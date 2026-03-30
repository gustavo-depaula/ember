CREATE TABLE IF NOT EXISTS practice_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id TEXT NOT NULL,
  detail TEXT,
  date TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  FOREIGN KEY (practice_id) REFERENCES practices(id)
);

CREATE INDEX IF NOT EXISTS idx_completions_date ON practice_completions (date);
CREATE INDEX IF NOT EXISTS idx_completions_practice ON practice_completions (practice_id);
CREATE INDEX IF NOT EXISTS idx_completions_practice_date ON practice_completions (practice_id, date);

INSERT OR IGNORE INTO practice_completions (practice_id, detail, date, completed_at)
  SELECT practice_id, NULL, date, COALESCE(completed_at, 0)
  FROM practice_logs WHERE completed = 1;

INSERT OR IGNORE INTO practice_completions (practice_id, detail, date, completed_at)
  SELECT 'divine-office', hour, date, COALESCE(completed_at, 0)
  FROM daily_office WHERE completed = 1;
