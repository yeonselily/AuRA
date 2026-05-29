import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { playlist, song, playlistSongs } from "@/db/schema";
import { eq } from "drizzle-orm";

//POST function for saving a playlist
export async function POST(req: Request) {

  //get the current session
  const session = await getServerSession(authOptions);

  //if the user is not logged in, give an error
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //get the name and tracks for the playlist
  const { name, tracks } = await req.json();

  //if either are not provided, or tracks is empty, give an error
  if (!name || !tracks || tracks.length === 0) {
    return NextResponse.json({ error: "Name and tracks are required" }, { status: 400 });
  }

  //insert the playlist into the database
  const [newPlaylist] = await db
    .insert(playlist)
    .values({
      userID: Number(session.user?.id),
      name,
    })
    .returning(); //return the playlist id

  //now we need to insert all songs into the database
  for (let i = 0; i < tracks.length; i++) {

    const track = tracks[i];

    //check if the song is already stored in our database
    let [existingSong] = await db
      .select()
      .from(song)
      .where(eq(song.spotifyID, track.spotifyID));

    //if not, insert the song
    if (!existingSong) {
      [existingSong] = await db
        .insert(song)
        .values({
          spotifyID: track.spotifyID,
          title: track.title,
          artist: track.artist,
        })
        .returning(); //and return the song ID
    }

    //link the song to the playlist using the bridge table, passing in the track index as playlist position
    await db.insert(playlistSongs).values({
      playlistID: newPlaylist.id,
      songID: existingSong.id,
      position: i,
    });

  }

  //success! respond with the playlist id
  return NextResponse.json({ playlistID: newPlaylist.id }, { status: 201 });

}