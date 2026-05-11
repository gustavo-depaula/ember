-- Ember database schema
--
-- User state is event-sourced: see `events` (created in db/events/store.ts)
-- and the in-memory projection in `db/events/state.ts`. This migration only
-- creates tables for non-event state: the preferences KV store and the
-- generic cache.

CREATE TABLE IF NOT EXISTS preferences (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cache (
  key       TEXT PRIMARY KEY NOT NULL,
  data      TEXT NOT NULL,
  cached_at INTEGER NOT NULL
);
