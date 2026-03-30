-- Data Model V2: 4-table redesign
-- New tables: user_practices, completions, cursors, preferences

-- 1. user_practices — user's plan-of-life configuration (content comes from manifests)
CREATE TABLE IF NOT EXISTS user_practices (
  practice_id  TEXT PRIMARY KEY NOT NULL,
  enabled      INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  tier         TEXT NOT NULL DEFAULT 'essential',
  time_block   TEXT NOT NULL DEFAULT 'flexible',
  schedule     TEXT NOT NULL DEFAULT '{"type":"daily"}',
  variant      TEXT,
  custom_name  TEXT,
  custom_icon  TEXT,
  custom_desc  TEXT
);

-- 2. completions — event log of what the user did
CREATE TABLE IF NOT EXISTS completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id  TEXT NOT NULL,
  sub_id       TEXT,
  date         TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_v2_completions_date ON completions (date);
CREATE INDEX IF NOT EXISTS idx_v2_completions_pd ON completions (practice_id, date);

-- 3. cursors — reading position bookmarks (schemaless JSON position)
CREATE TABLE IF NOT EXISTS cursors (
  id         TEXT PRIMARY KEY NOT NULL,
  position   TEXT NOT NULL,
  started_at TEXT NOT NULL
);

-- 4. preferences — key/value store (replaces AsyncStorage)
CREATE TABLE IF NOT EXISTS preferences (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- Migrate practices → user_practices
INSERT OR IGNORE INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule, variant, custom_name, custom_icon, custom_desc)
  SELECT
    id,
    enabled,
    sort_order,
    tier,
    time_block,
    CASE
      WHEN frequency = 'daily' OR frequency_days = '[]' THEN
        CASE
          WHEN notify_enabled = 1 AND notify_time IS NOT NULL THEN
            '{"type":"daily","notify":[{"at":"' || notify_time || '"}]}'
          ELSE '{"type":"daily"}'
        END
      ELSE
        CASE
          WHEN notify_enabled = 1 AND notify_time IS NOT NULL THEN
            '{"type":"days-of-week","days":' || frequency_days || ',"notify":[{"at":"' || notify_time || '"}]}'
          ELSE '{"type":"days-of-week","days":' || frequency_days || '}'
        END
    END,
    selected_variant,
    CASE WHEN is_builtin = 0 THEN name ELSE NULL END,
    CASE WHEN is_builtin = 0 THEN icon ELSE NULL END,
    CASE WHEN is_builtin = 0 THEN description ELSE NULL END
  FROM practices;

-- Migrate practice_completions → completions
INSERT OR IGNORE INTO completions (id, practice_id, sub_id, date, completed_at)
  SELECT id, practice_id, detail, date, completed_at
  FROM practice_completions;

-- Migrate practice_reading_tracks → cursors
INSERT OR IGNORE INTO cursors (id, position, started_at)
  SELECT
    id,
    '{"index":' || current_index || '}',
    start_date
  FROM practice_reading_tracks;

-- Migrate reading_tracks → cursors (bible/catechism positions)
INSERT OR IGNORE INTO cursors (id, position, started_at)
  SELECT
    CASE
      WHEN type = 'ot' THEN 'bible/ot-position'
      WHEN type = 'nt' THEN 'bible/nt-position'
      WHEN type = 'catechism' THEN 'catechism/position'
      ELSE 'legacy/' || id
    END,
    '{"book":"' || current_book || '","chapter":' || current_chapter || '}',
    start_date
  FROM reading_tracks;
