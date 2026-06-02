import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { playlist, playlistSongs, song } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import SignOutButton from "@/components/SignOutButton";
import PlaylistGenerator from "@/components/PlaylistGenerator";
import Link from "next/link";

//renders up to four album covers as a square 2x2 mosaic
function PlaylistCover({ images, name }: { images: string[]; name: string }) {

  //no art at all -> neutral placeholder square
  if (images.length === 0) {
    return <div style={{ width: "100%", aspectRatio: "1 / 1", background: "#eee", borderRadius: "4px" }} />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr",
        gridTemplateRows: images.length <= 2 ? "1fr" : "1fr 1fr",
        aspectRatio: "1 / 1", //forces a perfect square regardless of width
        width: "100%",
        gap: 0,
        overflow: "hidden",
        borderRadius: "4px",
      }}
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`${name} cover ${i + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ))}
    </div>
  );
}

export default async function DashboardPage() {

  //get the user session
  const session = await getServerSession(authOptions);

  //if the session is null (user is not logged in), redirect to login page
  if (!session) {
    redirect("/login");
  }

  //get all playlists belonging to the user as "playlists"
  const playlists = await db
    .select()
    .from(playlist)
    .where(eq(playlist.userID, Number(session.user.id)))
    .orderBy(desc(playlist.created));

  //for each playlist, grab the first four songs' album art (by position) for its mosaic cover
  const covers = await Promise.all(
    playlists.map(async (p) => {
      const rows = await db
        .select({ image: song.albumImage })
        .from(playlistSongs)
        .innerJoin(song, eq(playlistSongs.songID, song.id))
        .where(eq(playlistSongs.playlistID, p.id))
        .orderBy(asc(playlistSongs.position))
        .limit(4);
      const images = rows.map((r) => r.image).filter((url): url is string => Boolean(url));
      return [p.id, images] as const;
    })
  );
  const imagesById = new Map(covers);

  return (
    <main>
      <div>
        <h1>Welcome, {session.user.name}</h1>
        <SignOutButton />
      </div>

      <PlaylistGenerator />

      <section>
        <h2>Your Playlists</h2>
        {playlists.length === 0 ? (
          <p>You have no playlists yet. Generate one above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {playlists.map((p) => (
              <Link key={p.id} href={`/playlist/${p.id}`}>
                <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", cursor: "pointer" }}>
                  <PlaylistCover images={imagesById.get(p.id) ?? []} name={p.name} />
                  <h3>{p.name}</h3>
                  <p style={{ fontSize: "0.8rem", color: "#666" }}>
                    {new Date(p.created).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );

}