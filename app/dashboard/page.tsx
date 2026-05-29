import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { playlist } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import SignOutButton from "@/components/SignOutButton";
import PlaylistGenerator from "@/components/PlaylistGenerator";
import Link from "next/link";

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