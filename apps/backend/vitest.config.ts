import { fileURLToPath } from 'node:url'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

// Integration tests run inside real workerd with a local D1 (same engine as `wrangler dev`), so the
// geohash range queries and FTS5 MATCH execute against real SQLite. Migrations are read here and
// applied per-test-worker in the setup file. (vitest-pool-workers v0.16: `cloudflareTest` plugin.)
export default defineConfig(async () => {
  const migrations = await readD1Migrations(fileURLToPath(new URL('./migrations', import.meta.url)))
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: { bindings: { TEST_MIGRATIONS: migrations } },
      }),
    ],
    test: {
      setupFiles: ['./test/applyMigrations.ts'],
    },
  }
})
