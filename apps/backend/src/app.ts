import { Hono } from 'hono'
import { churchesRouter } from './features/churches/routes'
import { correctionsRouter } from './features/corrections/routes'

// The rate-limit binding shape (Workers Rate Limiting). Declared locally so we don't depend on the
// generated `worker-configuration.d.ts`.
export type RateLimitBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export type Env = {
  DB: D1Database
  WRITE_LIMITER: RateLimitBinding
  // Note: correction attachments are stored as base64 in D1 for now (R2 not enabled on the
  // account). Swap to an R2Bucket binding here when R2 is turned on.
}

// Both routers share the `/churches` prefix by design: `churchesRouter` owns the public reads,
// `correctionsRouter` the gated writes. Two files, one route surface — read both to see all paths.
const app = new Hono<{ Bindings: Env }>()
  .get('/health', (c) => c.json({ ok: true }))
  .route('/churches', churchesRouter)
  .route('/churches', correctionsRouter)

// Type-only export consumed by the frontend `hc` client (erased at build — no runtime crosses).
export type AppType = typeof app

export default app
