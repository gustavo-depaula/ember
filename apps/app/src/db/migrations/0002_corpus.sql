-- Hearth v2 schema migration.
--
-- The library-bundle model is gone. Content is now addressed by sha256 hash
-- and lazily fetched. Pinned items live in `preferences['pinned-items']`
-- (a JSON array). Catalog & manifests are cached in the existing `cache` table.
-- Blob bytes live on the filesystem (native) / IndexedDB (web), keyed by hash.
--
-- IF EXISTS makes this idempotent — safe to run on a fresh DB or an upgraded one.

DROP TABLE IF EXISTS installed_books;
