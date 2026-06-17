import { createMiddleware } from 'hono/factory'
import type { Env } from '../app'
import { computeFingerprint } from './fingerprint'

// Shared gate for every public write: derive the fingerprint (request IP + optional `X-Client-Id`
// header) and enforce the Workers Rate Limit before the handler runs. Handlers read the fingerprint
// via `c.get('fingerprint')` — no per-route preamble.
export const writeGuard = createMiddleware<{ Bindings: Env; Variables: { fingerprint: string } }>(
  async (c, next) => {
    const fingerprint = await computeFingerprint(
      c.req.header('CF-Connecting-IP'),
      c.req.header('X-Client-Id'),
    )
    const { success } = await c.env.WRITE_LIMITER.limit({ key: fingerprint })
    if (!success) return c.json({ error: 'rate_limited' }, 429)
    c.set('fingerprint', fingerprint)
    await next()
  },
)
