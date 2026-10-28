import {
  churchesQuerySchema,
  churchIndexQuerySchema,
  nearQuerySchema,
  tileParamSchema,
  tileQuerySchema,
  verificationsQuerySchema,
} from '@ember/api'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import type { Env } from '../../app'
import { createDb } from '../../db'
import { churchIndexPage, verificationsForChurch } from './queries'
import { churchDetail, nearbyChurches, searchChurches, tile, viewport } from './service'

// Public read routes (cacheable; pure geo — no server-side time computation). `GET /` answers a
// name search (`q`) with `{ churches }`, or a map viewport (`bbox`) with `{ churches, clusters }`. '/near' is registered
// before '/:id' so it isn't swallowed as an id, and so is '/index' (the whole catalogue, a page at a
// time, for sitemaps and the static site).
export const churchesRouter = new Hono<{ Bindings: Env }>()
  .get('/near', zValidator('query', nearQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const churches = await nearbyChurches(db, c.req.valid('query'))
    return c.json({ churches })
  })
  .get('/index', zValidator('query', churchIndexQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const { after, scheduled, limit } = c.req.valid('query')
    const churches = await churchIndexPage(db, { after, scheduled: scheduled === '1', limit })
    // A full page may have more behind it; a short one is the end.
    const next = churches.length === limit ? churches[churches.length - 1].id : undefined
    return c.json({ churches, next })
  })
  .get('/', zValidator('query', churchesQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const { q, bbox, near, ...rest } = c.req.valid('query')
    // The validator guarantees one of the two.
    if (q !== undefined) return c.json({ churches: await searchChurches(db, { q, near, ...rest }) })
    return c.json(await viewport(db, { bbox: bbox as NonNullable<typeof bbox>, ...rest }))
  })
  // A tile's address is all it depends on, and church data changes by the day: an hour fresh, then
  // served as it is for a day more while a new copy is fetched.
  .get(
    '/tiles/:cell',
    zValidator('param', tileParamSchema),
    zValidator('query', tileQuerySchema),
    async (c) => {
      const db = createDb(c.env.DB)
      c.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
      return c.json(await tile(db, c.req.valid('param').cell, c.req.valid('query').kind))
    },
  )
  .get('/:id/verifications', zValidator('query', verificationsQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const verifications = await verificationsForChurch(db, c.req.param('id'), c.req.valid('query'))
    return c.json({ verifications })
  })
  .get('/:id', async (c) => {
    const db = createDb(c.env.DB)
    const detail = await churchDetail(db, c.req.param('id'))
    if (!detail) return c.json({ error: 'not_found' }, 404)
    return c.json(detail)
  })
