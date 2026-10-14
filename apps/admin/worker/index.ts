import { resolutionSchema } from '@ember/api/src/moderation'
import { Hono } from 'hono'
import { identify } from './access'
import { createDesk, issues, message } from './desk'
import type { Env } from './env'
import { reviewer } from './reviewer'
import type { Seen } from './types'
import { loadUsage } from './usage'

// Ember's admin panel. Its first desk is Mass-times moderation, under /api; the page is the static
// build in dist/. Reviews by Claude run in the Reviewer container.
export { ContainerProxy } from '@cloudflare/containers'
export { Reviewer } from './reviewer'

type Body = Record<string, unknown>

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.onError((error, c) => c.json({ error: message(error) }, 500))

app.use('*', async (c, next) => {
  const who = await identify(c.req.raw, c.env)
  if (typeof who === 'string') return c.json({ error: who }, 403)
  // Access vouches for the person, not for the page that sent the request: a write has to be JSON,
  // which another site cannot send here without a preflight this Worker never answers.
  const write = c.req.method !== 'GET'
  if (write && !c.req.header('Content-Type')?.startsWith('application/json')) {
    return c.json({ error: 'Send JSON.' }, 415)
  }
  await next()
})

// The database behind `wrangler dev` is a local copy; a deployed Worker holds the real one.
const desk = (c: { env: Env; req: { url: string } }) =>
  createDesk(
    c.env,
    ['localhost', '127.0.0.1'].includes(new URL(c.req.url).hostname) ? 'local' : 'remote',
  )

app.get('/desk', async (c) => c.json(await desk(c).load()))
app.post('/refresh', async (c) => c.json(await desk(c).load()))

app.get('/progress', async (c) => {
  const progress = await desk(c).progress()
  // Someone is watching reviews run, so the box running them stays up.
  const working = Object.values(progress.runs).some((run) => run.status !== 'failed')
  if (working) c.executionCtx.waitUntil(reviewer(c.env).fetch('http://reviewer/ping'))
  return c.json(progress)
})

app.get('/photos/:churchId/:key', (c) =>
  desk(c).photoResponse(c.req.param('churchId'), c.req.param('key')),
)

app.post('/cases/:churchId/review', async (c) => {
  const { instruction } = await c.req.json<{ instruction?: string }>()
  await desk(c).review(c.req.param('churchId'), instruction?.trim() || undefined)
  return c.json(await desk(c).progress())
})

app.post('/review-all', async (c) => {
  await desk(c).reviewAll()
  return c.json(await desk(c).progress())
})

app.post('/cases/:churchId/stop', async (c) => {
  await desk(c).stop(c.req.param('churchId'))
  return c.json(await desk(c).progress())
})

app.post('/cases/:churchId/search', async (c) => {
  const { query } = await c.req.json<{ query?: string }>()
  return c.json({ matches: await desk(c).search(c.req.param('churchId'), String(query ?? '')) })
})

app.post('/cases/:churchId/apply', async (c) => {
  const { resolution, seen } = await c.req.json<Body>()
  const parsed = resolutionSchema.safeParse(resolution)
  if (!parsed.success) throw new Error(issues(parsed.error))
  return c.json(await desk(c).apply(c.req.param('churchId'), parsed.data, (seen ?? {}) as Seen))
})

app.post('/history/:id/undo', async (c) => c.json(await desk(c).undo(c.req.param('id'))))

app.post('/history/:id/shared', async (c) => {
  const { shared } = await c.req.json<{ shared?: boolean }>()
  return c.json(await desk(c).markShared(c.req.param('id'), shared === true))
})

app.get('/usage', async (c) => {
  const days = Number(c.req.query('days'))
  return c.json(
    await loadUsage(c.env.RELAY, {
      days: [7, 28, 90].includes(days) ? days : 28,
      platform: c.req.query('platform') ?? '',
      language: c.req.query('language') ?? '',
    }),
  )
})

app.all('*', (c) => c.json({ error: `No route for ${c.req.method} ${c.req.path}` }, 404))

export default app
