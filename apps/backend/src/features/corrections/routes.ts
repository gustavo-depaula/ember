import { correctionBodySchema, verifyBodySchema } from '@ember/api'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import type { Env } from '../../app'
import { createDb } from '../../db'
import { writeGuard } from '../../lib/writeGuard'
import { insertAttachment } from './queries'
import { submitCorrection, submitVerification } from './service'

const maxAttachmentBytes = 1 * 1024 * 1024 // 1 MB — kept small while attachments live as base64 in D1

// ArrayBuffer → base64, chunked so a large buffer doesn't blow the call stack via spread.
function bytesToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

// Public write routes — append-only. `writeGuard` (fingerprint + Workers Rate Limit) runs first for
// every route; handlers read the fingerprint from context.
export const correctionsRouter = new Hono<{ Bindings: Env; Variables: { fingerprint: string } }>()
  .use('*', writeGuard)
  .post('/:id/corrections', zValidator('json', correctionBodySchema), async (c) => {
    const result = await submitCorrection(
      createDb(c.env.DB),
      c.req.param('id'),
      c.get('fingerprint'),
      c.req.valid('json'),
    )
    return c.json(result, 201)
  })
  .post('/:id/verify', zValidator('json', verifyBodySchema), async (c) => {
    const result = await submitVerification(
      createDb(c.env.DB),
      c.req.param('id'),
      c.get('fingerprint'),
      c.req.valid('json'),
      new Date(),
    )
    return c.json(result)
  })
  // Attachment upload → stored as base64 in D1 (interim; R2 not enabled). Returns the row id, used
  // as a key in `correction.payload.attachmentKeys`.
  .post('/:id/corrections/attachments', async (c) => {
    const body = await c.req.arrayBuffer()
    if (body.byteLength === 0) return c.json({ error: 'empty_body' }, 400)
    if (body.byteLength > maxAttachmentBytes) return c.json({ error: 'too_large' }, 413)

    const id = crypto.randomUUID()
    await insertAttachment(createDb(c.env.DB), {
      id,
      churchId: c.req.param('id'),
      contentType: c.req.header('Content-Type') ?? 'application/octet-stream',
      data: bytesToBase64(body),
    })
    return c.json({ key: id }, 201)
  })
