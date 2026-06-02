@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js Version Warning

This project uses **Next.js 16** — APIs, conventions, and file structure may differ from training data. Read relevant guides in `node_modules/next/dist/docs/` before writing code and heed deprecation notices.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npm run db:push      # Push Drizzle schema changes to Neon PostgreSQL
npm run db:studio    # Open Drizzle Studio database UI
```

No test runner is configured in this project.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify API credentials
- `ANTHROPIC_API_KEY` — Claude API key
- `NEXTAUTH_SECRET` — JWT signing key
- `NEXTAUTH_URL` — Auth callback URL (e.g. `http://localhost:3000`)

## Architecture

AuRA is a Next.js app router application that generates personalized Spotify playlists using Claude AI based on user mood/activity descriptions.

### Request Flow

1. User submits a mood description in `PlaylistGenerator.tsx`
2. `/api/generate` sends it to Claude (claude-sonnet-4-6), which returns structured search queries
3. Each query is searched against the Spotify Web API (`lib/spotify.ts`); results are deduplicated by Spotify ID
4. User names and saves the playlist → `/api/playlist` inserts into `playlist`, `song`, and `playlistSongs` tables
5. Individual playlist pages (`/playlist/[id]`) load songs via `playlistSongs JOIN song` and embed Spotify iframes
6. Users rate songs 1–10 via `SongRating.tsx` → `/api/feedback`

### Auth

NextAuth.js v4 with a Credentials provider (email + bcrypt password). JWT sessions. All API routes guard with `getServerSession()`. Playlist pages additionally verify `session.user.id` matches the playlist owner.

### Database (Drizzle ORM + Neon PostgreSQL)

Five tables in [db/schema.ts](db/schema.ts):
- `users` — accounts
- `playlist` — user playlists
- `song` — deduplicated song catalog keyed by `spotifyID`
- `playlistSongs` — bridge table (playlistID, songID, position) — composite PK
- `feedback` — song ratings per user (userID, songID, rating) — composite PK

Schema changes go through `npm run db:push` (no migration files, direct push to Neon).

### Spotify Token Caching

`lib/spotify.ts` caches the client-credentials token in module scope for 1 hour to avoid redundant token fetches across requests.