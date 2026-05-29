"use client";
import { useState } from "react";

interface SongRatingProps {
  songID: number;
  initialRating?: number;
}

//an element for the user to give a 1-10 rating to a song in a playlist
export default function SongRating({ songID, initialRating }: SongRatingProps) {

  //initialRating is the user's current rating of the song, if it exists
  //rating state is initialized to that value if it exists, 0 otherwise
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  //rate button handler
  async function handleSubmit() {

    //if no rating is given, display an error
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setError("");
    setSaved(false);

    //call rating submission POST with song & rating
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songID, rating }),
    });

    if (res.ok) {
      setSaved(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save rating");
    }

  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
      <label style={{ fontSize: "0.85rem", color: "#666" }}>Your rating:</label>
      <select
        value={rating}
        onChange={(e) => { setRating(Number(e.target.value)); setSaved(false); }}
        style={{ padding: "0.25rem" }}
      >
        <option value={0} disabled>--</option>
        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button onClick={handleSubmit} style={{ fontSize: "0.85rem" }}>
        {initialRating ? "Update" : "Rate"}
      </button>
      {saved && <span style={{ fontSize: "0.85rem", color: "green" }}>Saved!</span>}
      {error && <span style={{ fontSize: "0.85rem", color: "red" }}>{error}</span>}
    </div>
  );

}