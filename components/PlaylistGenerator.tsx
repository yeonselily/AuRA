"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Track {
  spotifyID: string;
  title: string;
  artist: string;
  albumArt: string | null;
  previewUrl: string | null;
}

//one element defining the mood input field, generate button, generated results, and save button
export default function PlaylistGenerator() {

  const router = useRouter();
  const [mood, setMood] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  //generate button handler
  async function handleGenerate() {

    //make sure something has been input, excluding whitespace
    if (!mood.trim()) return;

    setLoading(true);
    setError("");
    setGenerated(false);
    setTracks([]);

    //call generate POST with user input
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });

    //get the response as "data"
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    //set the tracks as data.tracks, which is just a Track[]
    setTracks(data.tracks);
    setGenerated(true);

  }

  //save playlist button handler
  async function handleSave() {

    //make sure a name has been input, excluding whitespace
    if (!playlistName.trim()) {
      setError("Please enter a playlist name");
      return;
    }

    setSaving(true);
    setError("");

    //call save playlist POST with name and Track[]
    const res = await fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playlistName, tracks }),
    });

    //get the response as "data"
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save playlist");
      return;
    }

    //get the playlist ID from data, and redirect to the playlist page
    router.push(`/playlist/${data.playlistID}`);
    router.refresh();

  }

  return (
    <div>
      <h2>Generate a Playlist</h2>
      <textarea
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="Describe your mood... (e.g. 'feeling nostalgic and rainy day vibes')"
        rows={3}
        style={{ width: "100%", padding: "0.5rem" }}
      />
      <button onClick={handleGenerate} disabled={loading || !mood.trim()}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {generated && tracks.length > 0 && (
        <div>
          <h3>Results</h3>
          {tracks.map((track) => (
            <div key={track.spotifyID} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              {track.albumArt && (
                <img src={track.albumArt} alt={track.title} width={50} height={50} style={{ borderRadius: "4px" }} />
              )}
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>{track.title}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>{track.artist}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Name your playlist"
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Playlist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

}