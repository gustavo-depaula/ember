-- Generic cache table for API responses (OF propers, Bible translations, etc.)
CREATE TABLE IF NOT EXISTS cache (
  key       TEXT PRIMARY KEY NOT NULL,
  data      TEXT NOT NULL,
  cached_at INTEGER NOT NULL
);
