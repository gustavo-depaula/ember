-- Ember database schema
-- 4-table data model + translation cache

-- user_practices: practice definitions (thin — mainly for custom practices)
CREATE TABLE IF NOT EXISTS user_practices (
  practice_id  TEXT PRIMARY KEY NOT NULL,
  custom_name  TEXT,
  custom_icon  TEXT,
  custom_desc  TEXT
);

-- user_practice_slots: one row per checklistable item
CREATE TABLE IF NOT EXISTS user_practice_slots (
  id           TEXT PRIMARY KEY NOT NULL,
  practice_id  TEXT NOT NULL REFERENCES user_practices(practice_id),
  slot_id      TEXT NOT NULL,
  enabled      INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  tier         TEXT NOT NULL DEFAULT 'essential',
  time         TEXT,
  time_block   TEXT NOT NULL DEFAULT 'flexible',
  notify       TEXT,
  schedule     TEXT NOT NULL DEFAULT '{"type":"daily"}',
  variant      TEXT
);
CREATE INDEX IF NOT EXISTS idx_slots_practice ON user_practice_slots (practice_id);
CREATE INDEX IF NOT EXISTS idx_slots_enabled ON user_practice_slots (enabled, sort_order);

-- completions: event log of what the user did
CREATE TABLE IF NOT EXISTS completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id  TEXT NOT NULL,
  sub_id       TEXT,
  date         TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions (date);
CREATE INDEX IF NOT EXISTS idx_completions_pd ON completions (practice_id, date);

-- cursors: reading position bookmarks (schemaless JSON position)
CREATE TABLE IF NOT EXISTS cursors (
  id         TEXT PRIMARY KEY NOT NULL,
  position   TEXT NOT NULL,
  started_at TEXT NOT NULL
);

-- preferences: key/value store (replaces AsyncStorage)
CREATE TABLE IF NOT EXISTS preferences (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- cached_translations: offline cache for online Bible translations
CREATE TABLE IF NOT EXISTS cached_translations (
  translation TEXT NOT NULL,
  book        TEXT NOT NULL,
  chapter     INTEGER NOT NULL,
  content     TEXT NOT NULL,
  cached_at   INTEGER NOT NULL,
  PRIMARY KEY (translation, book, chapter)
);
