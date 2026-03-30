CREATE TABLE IF NOT EXISTS reading_tracks (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  label TEXT,
  current_book TEXT NOT NULL,
  current_chapter INTEGER NOT NULL,
  current_verse INTEGER NOT NULL DEFAULT 1,
  completed_books TEXT NOT NULL DEFAULT '[]',
  completed_chapters TEXT NOT NULL DEFAULT '{}',
  start_date TEXT NOT NULL
);

INSERT OR IGNORE INTO reading_tracks (id, type, label, current_book, current_chapter, current_verse, completed_books, completed_chapters, start_date)
  SELECT 'default-' || type, type, NULL, current_book, current_chapter, current_verse, completed_books, completed_chapters, start_date
  FROM reading_progress;
