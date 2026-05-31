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

-- creator_follows: which creators the user follows + per-creator auto-pin policy
CREATE TABLE IF NOT EXISTS creator_follows (
  creator_id     TEXT PRIMARY KEY,
  followed_at    INTEGER NOT NULL,
  auto_pin_count INTEGER NOT NULL DEFAULT 0
);

-- feed_items: cached episodes/videos/articles fetched from external feeds.
-- item_id = sha256(creator_id + ':' + guid); deterministic across reinstalls.
-- raw_json preserves the source row so we can reparse without refetching.
CREATE TABLE IF NOT EXISTS feed_items (
  item_id       TEXT PRIMARY KEY,
  creator_id    TEXT NOT NULL,
  channel_kind  TEXT NOT NULL,
  guid          TEXT NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  published_at  INTEGER NOT NULL,
  duration_s    INTEGER,
  media_url     TEXT,
  web_url       TEXT,
  image_url     TEXT,
  chapters_json TEXT,
  raw_json      TEXT NOT NULL,
  fetched_at    INTEGER NOT NULL,
  pinned        INTEGER NOT NULL DEFAULT 0,
  pin_source    TEXT,
  pinned_at     INTEGER,
  media_hash    TEXT,
  image_hash    TEXT
);
CREATE INDEX IF NOT EXISTS feed_items_by_creator ON feed_items (creator_id, published_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_recent     ON feed_items (published_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_pinned     ON feed_items (pinned) WHERE pinned = 1;

-- media_progress: playback position per feed-item; lightweight, freely overwritten.
CREATE TABLE IF NOT EXISTS media_progress (
  item_id      TEXT PRIMARY KEY,
  position_s   REAL NOT NULL,
  duration_s   REAL,
  completed_at INTEGER,
  updated_at   INTEGER NOT NULL
);

-- search_history: most-recent search queries; clearable from Settings → Privacy.
CREATE TABLE IF NOT EXISTS search_history (
  query        TEXT NOT NULL,
  searched_at  INTEGER NOT NULL,
  PRIMARY KEY (query, searched_at)
);

-- practice_voice: which guided playlist voices the user prefers per practice (v1.1).
CREATE TABLE IF NOT EXISTS practice_voice (
  practice_id  TEXT PRIMARY KEY,
  guided_id    TEXT,
  updated_at   INTEGER NOT NULL
);

-- pending_pins: queue of feed-item pins deferred until Wi-Fi reconnects.
CREATE TABLE IF NOT EXISTS pending_pins (
  item_id   TEXT PRIMARY KEY,
  queued_at INTEGER NOT NULL
);

-- creator_meta: channel-level metadata captured at feed-refresh time
-- (specifically the podcast/RSS channel image, used as the creator avatar).
-- We store this separately from feed_items because feed_items.image_url is
-- per-episode (and for podcasts with per-episode art, doesn't equal the
-- channel logo).
CREATE TABLE IF NOT EXISTS creator_meta (
  creator_id TEXT PRIMARY KEY,
  image_url  TEXT,
  updated_at INTEGER NOT NULL
);

-- external_content: persistent cache of producer outputs (CCC chapters,
-- breviary, etc.). Composite key matches Producer.cacheKey + version. Pinned
-- rows survive cache eviction. `payload_json` holds the full ProducerResult.
CREATE TABLE IF NOT EXISTS external_content (
  producer_id      TEXT NOT NULL,
  producer_version TEXT NOT NULL,
  lang             TEXT NOT NULL,
  cache_key        TEXT NOT NULL,
  params_key       TEXT NOT NULL,
  payload_json     TEXT NOT NULL,
  fetched_at       INTEGER NOT NULL,
  pinned           INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (producer_id, producer_version, lang, cache_key, params_key)
);

-- Custody: ascetical commitments (the negative half of the rule of life).
-- Every commitment enforces — there is no "log only" tier. Tables here are
-- CRUD-shaped, not event-sourced; `commitment_events` is append-only by
-- repository convention.
CREATE TABLE IF NOT EXISTS commitments (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  kind            TEXT NOT NULL CHECK (kind IN ('abstain', 'time-limit', 'time-fence')),
  targets         TEXT NOT NULL,                                       -- JSON Target[]
  schedule        TEXT NOT NULL,                                       -- JSON Schedule
  friction        TEXT NOT NULL CHECK (friction IN ('none', 'wait', 'prayer')),
  friction_config TEXT,                                                -- JSON FrictionConfig
  fence_start     TEXT,                                                -- HH:mm, only for kind = 'time-fence'
  fence_end       TEXT,                                                -- HH:mm, only for kind = 'time-fence'
  limit_seconds   INTEGER,                                             -- only for kind = 'time-limit'
  archived        INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS commitments_active ON commitments(archived) WHERE archived = 0;

CREATE TABLE IF NOT EXISTS commitment_events (
  id            TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('kept', 'paused', 'overrode')),
  occurred_at   INTEGER NOT NULL,
  note          TEXT,
  metadata      TEXT                                                   -- JSON
);
CREATE INDEX IF NOT EXISTS commitment_events_by_commitment
  ON commitment_events(commitment_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS commitment_events_by_type
  ON commitment_events(type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS custody_sessions (
  id              TEXT PRIMARY KEY,
  anchor_ref      TEXT NOT NULL,
  anchor_type     TEXT NOT NULL CHECK (anchor_type IN ('text', 'image', 'prayer', 'lectio', 'silence')),
  planned_seconds INTEGER NOT NULL,
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  ended_reason    TEXT CHECK (ended_reason IN ('completed', 'aborted', 'app-killed'))
);
CREATE INDEX IF NOT EXISTS custody_sessions_recent ON custody_sessions(started_at DESC);

-- saved_items: the user's library shelf. A lightweight, instant "keep this"
-- (ref + timestamp), decoupled from offline availability (pinned-items, which
-- prefetches blobs). `kind` is denormalized from the catalog entry so shelves
-- group by kind without a lookup, and so a synthetic 'usercollection' kind can
-- sit on the shelf without any catalog entry. Saving is free and instant;
-- making something offline is a separate, optional act (see pinningManager).
CREATE TABLE IF NOT EXISTS saved_items (
  item_id  TEXT PRIMARY KEY,
  kind     TEXT NOT NULL,
  saved_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS saved_items_by_kind ON saved_items (kind, saved_at DESC);

-- user_collections: collections the user authors. They render through the same
-- viewer as corpus collections (CollectionHero + SectionList) — only the storage
-- and authoring are local. The ref form on the Saved shelf is usercollection/<id>.
CREATE TABLE IF NOT EXISTS user_collections (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  cover_tone  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- user_collection_items: ordered membership. section_id groups items into the
-- sections of the assembled CollectionItemManifest; position orders within a
-- section. v1 uses a single 'default' section, but the shape supports more.
CREATE TABLE IF NOT EXISTS user_collection_items (
  collection_id TEXT NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  ref           TEXT NOT NULL,
  section_id    TEXT NOT NULL DEFAULT 'default',
  label         TEXT,
  position      INTEGER NOT NULL,
  added_at      INTEGER NOT NULL,
  PRIMARY KEY (collection_id, ref, section_id)
);
CREATE INDEX IF NOT EXISTS user_collection_items_order
  ON user_collection_items (collection_id, section_id, position);
