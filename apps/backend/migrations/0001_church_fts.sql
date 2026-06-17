-- FTS5 name search over church(name, long_name). Hand-written: drizzle-kit can't emit virtual
-- tables, so `church_fts` is intentionally NOT in the Drizzle schema and is queried via raw `sql`.
-- External-content table (content='church') keeps the index off-row; triggers keep it in sync, so a
-- bulk `INSERT INTO church` (the dump import) populates the index automatically — no FTS rebuild.
CREATE VIRTUAL TABLE `church_fts` USING fts5(
  name, long_name,
  content='church',
  content_rowid='rowid'
);
--> statement-breakpoint
CREATE TRIGGER `church_fts_ai` AFTER INSERT ON `church` BEGIN
  INSERT INTO church_fts(rowid, name, long_name) VALUES (new.rowid, new.name, new.long_name);
END;
--> statement-breakpoint
CREATE TRIGGER `church_fts_ad` AFTER DELETE ON `church` BEGIN
  INSERT INTO church_fts(church_fts, rowid, name, long_name) VALUES ('delete', old.rowid, old.name, old.long_name);
END;
--> statement-breakpoint
CREATE TRIGGER `church_fts_au` AFTER UPDATE ON `church` BEGIN
  INSERT INTO church_fts(church_fts, rowid, name, long_name) VALUES ('delete', old.rowid, old.name, old.long_name);
  INSERT INTO church_fts(rowid, name, long_name) VALUES (new.rowid, new.name, new.long_name);
END;
