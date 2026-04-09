CREATE TABLE IF NOT EXISTS installed_books (
  book_id      TEXT PRIMARY KEY NOT NULL,
  version      TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  manifest     TEXT NOT NULL
);
