import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db/index";
import { playlist, playlistSongs, song, feedback } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import SongRating from "@/components/SongRating";

//page for a specific playlist (based on playlist id)
export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {

  //get the current session
  const session = await getServerSession(authOptions);

  //if the user is not logged in, redirect to login page
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const playlistID = Number(id);

  //if playlistID cant be parsed as a number, dont display the page
  if (isNaN(playlistID)) {
    notFound(); //displays 404 page
  }

  //try searching for this playlist by id in the database, with a userID that matches the session's user id
  const [thisPlaylist] = await db
    .select()
    .from(playlist)
    .where(and(
      eq(playlist.id, playlistID),
      eq(playlist.userID, Number(session.user.id))
    ));

  //if the query returns no results, this means the playlist either does not exist or belongs to a different user
  //therefore, do not display the page
  if (!thisPlaylist) {
    notFound();
  }

  //get all songs for this playlist from the database
  const songs = await db
    .select({ //these are the fields we need
      id: song.id,
      spotifyID: song.spotifyID,
      title: song.title,
      artist: song.artist,
      position: playlistSongs.position,
    })
    .from(playlistSongs) //from our bridge table
    .innerJoin(song, eq(playlistSongs.songID, song.id)) //join on the song table where there are matches
    .where(eq(playlistSongs.playlistID, playlistID)) //and only get songs for this playlist
    .orderBy(asc(playlistSongs.position)); //order by playlist position

    //get all the user's song ratings
    const ratings = await db
      .select()
      .from(feedback)
      .where(eq(feedback.userID, Number(session.user.id)));

    //construct a map of the user's ratings so we can easily get a rating based on a songID
    const ratingMap = Object.fromEntries(ratings.map((r) => [r.songID, r.rating]));

  return (
    <main>
      <Link href="/dashboard">← Back to Dashboard</Link>

      <h1>{thisPlaylist.name}</h1>
      <p style={{ color: "#666" }}>
        Created {new Date(thisPlaylist.created).toLocaleDateString()}
      </p>
      <p>{songs.length} songs</p>

      <div style={{ marginTop: "1rem" }}>
        {songs.map((s, index) => (
          <div
            key={s.id}
            style={{
              padding: "0.75rem 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "#999", width: "24px" }}>{index + 1}</span>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>{s.artist}</p>
              </div>
            </div>
            <iframe
              src={`https://open.spotify.com/embed/track/${s.spotifyID}?utm_source=generator`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
            <SongRating
              songID={s.id}
              initialRating={ratingMap[s.id]}
            />
          </div>
        ))}
      </div>
    </main>
  );

}