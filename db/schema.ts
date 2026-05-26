import { pgTable, serial, varchar, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id:       serial('id').primaryKey(),
  username: varchar('username', { length: 30 }).notNull(),
  email:    varchar('email', { length: 30 }).unique().notNull(),
});

export const playlist = pgTable('playlist', {
  id:      serial('id').primaryKey(),
  userID:  integer('userID').notNull().references(() => users.id),
  name:    varchar('name', { length: 30 }).notNull(),
  created: timestamp('created').notNull(),
});

export const song = pgTable('song', {
  id:        serial('id').primaryKey(),
  spotifyID: varchar('spotifyID', { length: 30 }).notNull(),
  title:     text('title').notNull(),
  artist:    text('artist').notNull(),
});

export const feedback = pgTable('feedback', {
  userID: integer('userID').notNull().references(() => users.id),
  songID: integer('songID').notNull().references(() => song.id),
  rating: integer('rating').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userID, table.songID] }),
}));

export const playlistSongs = pgTable('playlistsongs', {
  playlistID: integer('playlistID').notNull().references(() => playlist.id),
  songID:     integer('songID').notNull().references(() => song.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.playlistID, table.songID] }),
}));