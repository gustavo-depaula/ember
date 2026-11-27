import app from './app'
import { pruneAnalytics } from './prune'
import { ensureSchema } from './schema'

// The Worker: the routes, and a nightly run that thins the usage counts as they age.
export default {
  fetch: app.fetch,
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      ensureSchema(env.DB).then(() =>
        pruneAnalytics(env.DB, new Date().toISOString().slice(0, 10)),
      ),
    )
  },
} satisfies ExportedHandler<{ DB: D1Database }>
