import { applyD1Migrations, env } from 'cloudflare:test'

// Apply the same migrations (incl. the FTS5 virtual table + triggers) to the test D1.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
