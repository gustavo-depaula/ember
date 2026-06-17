import { churchesQuerySchema, nearQuerySchema, verificationsQuerySchema } from '@ember/api'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import type { Env } from '../../app'
import { createDb } from '../../db'
import { verificationsForChurch } from './queries'
import { churchDetail, nearbyChurches, searchChurches } from './service'

// Public read routes (cacheable; pure geo — no server-side time computation). '/near' is registered
// before '/:id' so it isn't swallowed as an id.
export const churchesRouter = new Hono<{ Bindings: Env }>()
  .get('/near', zValidator('query', nearQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const churches = await nearbyChurches(db, c.req.valid('query'))
    return c.json({ churches })
  })
  .get('/', zValidator('query', churchesQuerySchema), async (c) => {
    const db = createDb(c.env.DB)
    const churches = await searchChurches(db, c.req.valid('query'))
    return c.json({ churches })
  })
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
