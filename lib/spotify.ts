let cachedToken: string | null = null;
let tokenExpiry: number = 0;

//get the spotify token efficiently, we need the token to verify that we are authorized to use the spotify api
//note: tokens expire every hour
export async function getSpotifyToken(): Promise<string> {

  //we cache the token. if it is cached, and not yet expired, return the cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  //if its not cached, or if it expired, then we need to fetch it again

  //format our credentials using our secrets from env, format like "clientID:clientSecret", encoded with base64
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  //give the credentials to spotify to request our access token
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  //we get our token and re-cache it
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken as string;
  
}

//search for songs from a query
export async function searchSpotifyTracks(query: string, limit = 5) {

  //get the access token
  const token = await getSpotifyToken();

  //simply use spotify's search api with our query & limit
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  //return an array of tracks
  const data = await res.json();
  return data.tracks.items as any[];

}