CREATE TABLE IF NOT EXISTS practice_reading_tracks (
  id TEXT PRIMARY KEY NOT NULL,
  practice_id TEXT NOT NULL,
  track TEXT NOT NULL,
  current_index INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prt_practice ON practice_reading_tracks (practice_id);
