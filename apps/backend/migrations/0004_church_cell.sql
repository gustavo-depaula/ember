CREATE TABLE `church_cell` (
	`precision` integer NOT NULL,
	`cell` text NOT NULL,
	`kind` text NOT NULL,
	`count` integer NOT NULL,
	`lat_sum` real NOT NULL,
	`lng_sum` real NOT NULL,
	PRIMARY KEY(`precision`, `cell`, `kind`)
);
--> statement-breakpoint
-- Hand-written from here: drizzle-kit emits the table, not what keeps it true. Three triggers hold
-- `church_cell` to `church` whatever writes a church (the import today), the way `church_fts` is
-- held. A church counts once in each of its five cells under '' and once more under every kind of
-- service it offers. Each cell is named outright so a write reaches its rows through the primary
-- key, and the update trigger skips an import that changes nothing the counts depend on.
CREATE TRIGGER `church_cell_ai` AFTER INSERT ON `church` BEGIN
  INSERT INTO church_cell (`precision`, `cell`, `kind`, `count`, `lat_sum`, `lng_sum`)
  SELECT p.n, substr(new.geohash, 1, p.n), k.kind, 1, new.lat, new.lng
  FROM (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) p, (SELECT '' AS kind UNION SELECT json_extract(value, '$.kind') FROM json_each(new.services) WHERE json_extract(value, '$.kind') IS NOT NULL) k
  WHERE true
  ON CONFLICT (`precision`, `cell`, `kind`) DO UPDATE SET
    `count` = `count` + 1, `lat_sum` = `lat_sum` + excluded.lat_sum, `lng_sum` = `lng_sum` + excluded.lng_sum;
END;
--> statement-breakpoint
CREATE TRIGGER `church_cell_ad` AFTER DELETE ON `church` BEGIN
  UPDATE church_cell SET `count` = `count` - 1, `lat_sum` = `lat_sum` - old.lat, `lng_sum` = `lng_sum` - old.lng
  WHERE ((`precision` = 1 AND `cell` = substr(old.geohash, 1, 1)) OR (`precision` = 2 AND `cell` = substr(old.geohash, 1, 2)) OR (`precision` = 3 AND `cell` = substr(old.geohash, 1, 3)) OR (`precision` = 4 AND `cell` = substr(old.geohash, 1, 4)) OR (`precision` = 5 AND `cell` = substr(old.geohash, 1, 5)))
    AND `kind` IN (SELECT '' AS kind UNION SELECT json_extract(value, '$.kind') FROM json_each(old.services) WHERE json_extract(value, '$.kind') IS NOT NULL);
  DELETE FROM church_cell WHERE `count` <= 0 AND ((`precision` = 1 AND `cell` = substr(old.geohash, 1, 1)) OR (`precision` = 2 AND `cell` = substr(old.geohash, 1, 2)) OR (`precision` = 3 AND `cell` = substr(old.geohash, 1, 3)) OR (`precision` = 4 AND `cell` = substr(old.geohash, 1, 4)) OR (`precision` = 5 AND `cell` = substr(old.geohash, 1, 5)));
END;
--> statement-breakpoint
CREATE TRIGGER `church_cell_au` AFTER UPDATE OF `geohash`, `lat`, `lng`, `services` ON `church`
WHEN old.geohash IS NOT new.geohash OR old.lat IS NOT new.lat OR old.lng IS NOT new.lng
  OR old.services IS NOT new.services
BEGIN
  UPDATE church_cell SET `count` = `count` - 1, `lat_sum` = `lat_sum` - old.lat, `lng_sum` = `lng_sum` - old.lng
  WHERE ((`precision` = 1 AND `cell` = substr(old.geohash, 1, 1)) OR (`precision` = 2 AND `cell` = substr(old.geohash, 1, 2)) OR (`precision` = 3 AND `cell` = substr(old.geohash, 1, 3)) OR (`precision` = 4 AND `cell` = substr(old.geohash, 1, 4)) OR (`precision` = 5 AND `cell` = substr(old.geohash, 1, 5)))
    AND `kind` IN (SELECT '' AS kind UNION SELECT json_extract(value, '$.kind') FROM json_each(old.services) WHERE json_extract(value, '$.kind') IS NOT NULL);
  DELETE FROM church_cell WHERE `count` <= 0 AND ((`precision` = 1 AND `cell` = substr(old.geohash, 1, 1)) OR (`precision` = 2 AND `cell` = substr(old.geohash, 1, 2)) OR (`precision` = 3 AND `cell` = substr(old.geohash, 1, 3)) OR (`precision` = 4 AND `cell` = substr(old.geohash, 1, 4)) OR (`precision` = 5 AND `cell` = substr(old.geohash, 1, 5)));
  INSERT INTO church_cell (`precision`, `cell`, `kind`, `count`, `lat_sum`, `lng_sum`)
  SELECT p.n, substr(new.geohash, 1, p.n), k.kind, 1, new.lat, new.lng
  FROM (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) p, (SELECT '' AS kind UNION SELECT json_extract(value, '$.kind') FROM json_each(new.services) WHERE json_extract(value, '$.kind') IS NOT NULL) k
  WHERE true
  ON CONFLICT (`precision`, `cell`, `kind`) DO UPDATE SET
    `count` = `count` + 1, `lat_sum` = `lat_sum` + excluded.lat_sum, `lng_sum` = `lng_sum` + excluded.lng_sum;
END;
--> statement-breakpoint
-- The churches already there.
INSERT INTO church_cell (`precision`, `cell`, `kind`, `count`, `lat_sum`, `lng_sum`)
SELECT p.n, substr(c.geohash, 1, p.n), '', count(*), sum(c.lat), sum(c.lng)
FROM church c, (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) p
GROUP BY p.n, substr(c.geohash, 1, p.n);
--> statement-breakpoint
INSERT INTO church_cell (`precision`, `cell`, `kind`, `count`, `lat_sum`, `lng_sum`)
SELECT p.n, substr(c.geohash, 1, p.n), c.kind, count(*), sum(c.lat), sum(c.lng)
FROM (
  SELECT DISTINCT church.id, church.geohash, church.lat, church.lng, json_extract(j.value, '$.kind') AS kind
  FROM church, json_each(church.services) j
  WHERE json_extract(j.value, '$.kind') IS NOT NULL
) c, (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) p
GROUP BY p.n, substr(c.geohash, 1, p.n), c.kind;
