import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchSpotifyTracks } from "@/lib/spotify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

//we are using anthropic/claude as our ai
const anthropic = new Anthropic();

//POST function for generating a playlist from mood
export async function POST(req: Request) {

  try {

    //get current session
    const session = await getServerSession(authOptions);

    //if user is not logged in, error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //get the mood input from the user
    const { mood } = await req.json();

    //make sure the input exists
    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    //make a prompt and get the AI response as "message"
    //temperature set to 1 to encourage variety
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 1,
      messages: [
        {
          role: "user",
          content: `You are a music recommendation assistant. Based on the following mood description, generate 8 Spotify search queries to find songs that match the mood. Return ONLY a JSON array of search query strings, nothing else. No markdown, no explanation.
          
Mood: ${mood}

Example format: ["happy pop upbeat 2020", "feel good summer hits", "energetic dance music"]`,
        },
      ],
    });

    //get the usable text response as "content"
    const content = message.content[0];

    //make sure AI didnt goof
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response from AI" }, { status: 500 });
    }

    //AI's response should be in a JSON format we can parse into a string[], so we will try to do that
    let queries: string[];
    try {
      queries = JSON.parse(content.text);
    } catch {
      //but if we fail, we let the user know
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    //use spotify api to search for tracks based on all queries, and collect results as "trackResults"
    const trackResults = await Promise.all(
      queries.map((query) => searchSpotifyTracks(query, 2))
    );

    //but we may have gotten duplicate tracks among the multiple searches, so lets get rid of them

    //we will keep track of unique trakcs in "seen"
    const seen = new Set<string>();

    //we turn trackResults into a simple array of unique tracks, using our Track interface from components/PlaylistGenerator.tsx
    const tracks = trackResults
      .flat() //turn trackResults into a single array
      .filter((track) => {
        if (seen.has(track.id)) return false; //this track is a duplicate, filter it out
        seen.add(track.id); //otherwise, mark it as "seen"
        return true; //...and keep it
      })
      .map((track) => ({ //make every track element follow our Track interface
        spotifyID: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(", "),
        albumArt: track.album.images[0]?.url ?? null,
        previewUrl: track.preview_url ?? null,
      }));

    //success, return the generated tracks
    return NextResponse.json({ tracks });

  } catch (err) {

    //ruh roh something went wrong
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  }

}