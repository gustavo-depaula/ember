CREATE TABLE IF NOT EXISTS practices (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	icon text NOT NULL,
	frequency text DEFAULT 'daily' NOT NULL,
	enabled integer DEFAULT 1 NOT NULL,
	sort_order integer NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_logs (
	date text NOT NULL,
	practice_id text NOT NULL,
	completed integer DEFAULT 0 NOT NULL,
	completed_at integer,
	PRIMARY KEY (date, practice_id),
	FOREIGN KEY (practice_id) REFERENCES practices(id)
);
CREATE INDEX IF NOT EXISTS idx_practice_logs_date ON practice_logs (date);
CREATE INDEX IF NOT EXISTS idx_practice_logs_practice ON practice_logs (practice_id);

CREATE TABLE IF NOT EXISTS reading_progress (
	type text PRIMARY KEY NOT NULL,
	current_book text NOT NULL,
	current_chapter integer NOT NULL,
	current_verse integer DEFAULT 1 NOT NULL,
	completed_books text DEFAULT '[]' NOT NULL,
	start_date text NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_office (
	date text NOT NULL,
	hour text NOT NULL,
	completed integer DEFAULT 0 NOT NULL,
	completed_at integer,
	PRIMARY KEY (date, hour)
);
CREATE INDEX IF NOT EXISTS idx_daily_office_date ON daily_office (date);

CREATE TABLE IF NOT EXISTS office_preferences (
	key text PRIMARY KEY NOT NULL,
	value text NOT NULL
);

CREATE TABLE IF NOT EXISTS cached_translations (
	translation text NOT NULL,
	book text NOT NULL,
	chapter integer NOT NULL,
	content text NOT NULL,
	cached_at integer NOT NULL,
	PRIMARY KEY (translation, book, chapter)
);
