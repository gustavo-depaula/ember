import { defineConfig } from 'drizzle-kit'

// drizzle-kit only generates SQL here (offline, no DB connection). Migrations are applied to D1
// via `wrangler d1 migrations apply` — NOT `drizzle-kit migrate`. The FTS5 virtual table is a
// hand-written migration alongside the generated ones (drizzle-kit can't emit virtual tables).
export default defineConfig({
  dialect: 'sqlite',
  schema: '../../packages/api/src/schema.ts',
  out: './migrations',
})
