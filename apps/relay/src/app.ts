import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import {
  type AccountView,
  type Gone,
  maxEventsPerPush,
  type Pairing,
  type PairingState,
  type Pulled,
  pairingMinutes,
} from './protocol'
import { ensureSchema } from './schema'

// The relay keeps each account's events and hands them to that account's
// devices. It cannot read an event: bodies arrive sealed with a key only the
// devices hold, and the key each is filed under is a keyed hash of its id. An
// account id and the secrets a device presents are all derived on the device
// from one secret that never comes here (except, sealed again, as the recovery
// copy a person may leave).

type RateLimitBinding = { limit(options: { key: string }): Promise<{ success: boolean }> }

export type Env = { DB: D1Database; LIMITER: RateLimitBinding; PAIRING_LIMITER: RateLimitBinding }

type AccountRow = { id: string; auth_hash: string; format: number; bytes: number }
type Vars = { account: AccountRow; device: string }

// Room for years of daily use; a log that outgrows it is something else.
const accountCapBytes = 50_000_000
const pullPage = 500
const secret = z.string().min(32).max(128)
const id = z.string().min(8).max(64)

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function bearer(header: string | undefined): string {
  return header?.startsWith('Bearer ') ? header.slice(7) : ''
}

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const gone = (what: Gone['gone']): Gone => ({ gone: what })

const app = new Hono<{ Bindings: Env; Variables: Vars }>()
  .use(
    cors({
      origin: '*',
      allowHeaders: ['Content-Type', 'Authorization', 'X-Log-Format'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      maxAge: 86400,
    }),
  )
  .use(async (c, next) => {
    await ensureSchema(c.env.DB)
    await next()
  })
  .get('/health', (c) => c.json({ ok: true }))

  // ── Accounts ────────────────────────────────────────────────────────────

  .post(
    '/accounts',
    zValidator(
      'json',
      z.object({
        account: id,
        auth: secret,
        format: z.number().int(),
        device: z.object({ id, token: secret }),
      }),
    ),
    async (c) => {
      const body = c.req.valid('json')
      if (!(await c.env.LIMITER.limit({ key: body.account })).success) return c.json({}, 429)
      const now = Date.now()
      const made = await c.env.DB.prepare(
        'INSERT OR IGNORE INTO accounts (id, auth_hash, format, created_at) VALUES (?, ?, ?, ?)',
      )
        .bind(body.account, await sha256(body.auth), body.format, now)
        .run()
      if (made.meta.changes === 0) return c.json({}, 409)
      await c.env.DB.prepare(
        'INSERT INTO devices (account, id, token_hash, created_at, seen_at) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(body.account, body.device.id, await sha256(body.device.token), now, now)
        .run()
      return c.json({}, 201)
    },
  )

  // Everything under an account: the account must exist and not be deleted.
  .use('/accounts/:account/*', async (c, next) => {
    const account = c.req.param('account')
    if (!(await c.env.LIMITER.limit({ key: account })).success) return c.json({}, 429)
    const row = await c.env.DB.prepare(
      'SELECT id, auth_hash, format, bytes, deleted_at FROM accounts WHERE id = ?',
    )
      .bind(account)
      .first<AccountRow & { deleted_at: number | null }>()
    if (!row) return c.json({}, 404)
    if (row.deleted_at) return c.json(gone('account'), 410)
    c.set('account', row)
    await next()
  })

  // A device that holds the account's secret adds itself.
  .post(
    '/accounts/:account/devices',
    zValidator('json', z.object({ id, token: secret })),
    async (c) => {
      const account = c.get('account')
      if ((await sha256(bearer(c.req.header('Authorization')))) !== account.auth_hash) {
        return c.json({}, 401)
      }
      const body = c.req.valid('json')
      const now = Date.now()
      await c.env.DB.prepare(
        'INSERT OR IGNORE INTO devices (account, id, token_hash, created_at, seen_at) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(account.id, body.id, await sha256(body.token), now, now)
        .run()
      return c.json({}, 201)
    },
  )

  // The rest is for a device of the account, known by its own token.
  .use('/accounts/:account/*', async (c, next) => {
    if (c.req.path.endsWith('/devices') && c.req.method === 'POST') return next()
    const account = c.get('account')
    const device = await c.env.DB.prepare(
      'SELECT id, seen_at, removed_at FROM devices WHERE account = ? AND token_hash = ?',
    )
      .bind(account.id, await sha256(bearer(c.req.header('Authorization'))))
      .first<{ id: string; seen_at: number; removed_at: number | null }>()
    if (!device) return c.json({}, 401)
    if (device.removed_at) return c.json(gone('device'), 410)

    // An app older than the log the account now keeps would misread it.
    const format = Number(c.req.header('X-Log-Format') ?? 0)
    if (format < account.format) return c.json({ format: account.format }, 426)
    if (format > account.format) {
      await c.env.DB.prepare('UPDATE accounts SET format = ? WHERE id = ?')
        .bind(format, account.id)
        .run()
    }
    const now = Date.now()
    if (now - device.seen_at > 3_600_000) {
      await c.env.DB.prepare('UPDATE devices SET seen_at = ? WHERE account = ? AND id = ?')
        .bind(now, account.id, device.id)
        .run()
    }
    c.set('device', device.id)
    await next()
  })

  .get('/accounts/:account/view', async (c) => {
    const account = c.get('account')
    const [profile, devices] = await c.env.DB.batch([
      c.env.DB.prepare(
        'SELECT name, email, phone, birthday, news, recovery FROM accounts WHERE id = ?',
      ).bind(account.id),
      c.env.DB.prepare(
        'SELECT id, seen_at FROM devices WHERE account = ? AND removed_at IS NULL',
      ).bind(account.id),
    ])
    const p = profile.results[0] as Record<string, string | number | null>
    const view: AccountView = {
      profile: {
        name: (p.name as string) ?? undefined,
        email: (p.email as string) ?? undefined,
        phone: (p.phone as string) ?? undefined,
        birthday: (p.birthday as string) ?? undefined,
        news: p.news === 1,
      },
      devices: (devices.results as { id: string; seen_at: number }[]).map((d) => ({
        id: d.id,
        seenAt: d.seen_at,
      })),
      recoverable: p.recovery !== null,
    }
    return c.json(view)
  })

  .put(
    '/accounts/:account/profile',
    zValidator(
      'json',
      z.object({
        name: z.string().max(200).optional(),
        email: z.string().max(320).optional(),
        phone: z.string().max(40).optional(),
        birthday: z.string().max(10).optional(),
        news: z.boolean().optional(),
        // The account's secret, sealed for the keeper of the recovery key; null withdraws it.
        recovery: z.string().max(1000).nullable(),
      }),
    ),
    async (c) => {
      const body = c.req.valid('json')
      await c.env.DB.prepare(
        'UPDATE accounts SET name = ?, email = ?, phone = ?, birthday = ?, news = ?, recovery = ? WHERE id = ?',
      )
        .bind(
          body.name || null,
          body.email || null,
          body.phone || null,
          body.birthday || null,
          body.news ? 1 : 0,
          body.email || body.phone ? body.recovery : null,
          c.get('account').id,
        )
        .run()
      return c.json({})
    },
  )

  .post(
    '/accounts/:account/events',
    zValidator(
      'json',
      z.object({
        events: z
          .array(z.tuple([z.string().min(16).max(128), z.string().max(1_500_000)]))
          .max(maxEventsPerPush),
      }),
    ),
    async (c) => {
      const account = c.get('account')
      if (account.bytes > accountCapBytes) return c.json({}, 413)
      const { events } = c.req.valid('json')
      // One statement: an event already held is skipped, the rest are stored together.
      const stored = await c.env.DB.prepare(
        `INSERT OR IGNORE INTO events (account, key, device, body)
          SELECT ?, json_extract(value, '$[0]'), ?, json_extract(value, '$[1]')
          FROM json_each(?) ORDER BY key
          RETURNING length(body) AS size`,
      )
        .bind(account.id, c.get('device'), JSON.stringify(events))
        .all<{ size: number }>()
      const bytes = stored.results.reduce((sum, row) => sum + row.size, 0)
      if (bytes > 0) {
        await c.env.DB.prepare('UPDATE accounts SET bytes = bytes + ? WHERE id = ?')
          .bind(bytes, account.id)
          .run()
      }
      return c.json({ stored: stored.results.length })
    },
  )

  // What other devices have stored since `after`. The asking device's own
  // events are left out: it wrote them.
  .get('/accounts/:account/events', async (c) => {
    const account = c.get('account')
    const after = Number(c.req.query('after') ?? 0) || 0
    // Read together, so the head is never ahead of a row this page missed.
    const [page, head] = await c.env.DB.batch([
      c.env.DB.prepare(
        'SELECT seq, body FROM events WHERE account = ? AND seq > ? AND device != ? ORDER BY seq LIMIT ?',
      ).bind(account.id, after, c.get('device'), pullPage + 1),
      c.env.DB.prepare('SELECT max(seq) AS head FROM events WHERE account = ?').bind(account.id),
    ])
    const rows = (page.results as { seq: number; body: string }[]).slice(0, pullPage)
    const more = page.results.length > pullPage
    const top = (head.results[0] as { head: number | null }).head ?? 0
    const pulled: Pulled = {
      bodies: rows.map((row) => row.body),
      position: more ? rows[rows.length - 1].seq : Math.max(top, after),
      more,
    }
    return c.json(pulled)
  })

  // Removing a device turns it away from then on; told so, it erases itself.
  .delete('/accounts/:account/devices/:device', async (c) => {
    await c.env.DB.prepare(
      'UPDATE devices SET removed_at = ? WHERE account = ? AND id = ? AND removed_at IS NULL',
    )
      .bind(Date.now(), c.get('account').id, c.req.param('device'))
      .run()
    return c.json({})
  })

  // Deleting an account leaves only the fact that it was deleted, which is
  // what tells its other devices to erase themselves.
  .delete('/accounts/:account', async (c) => {
    const account = c.get('account').id
    await c.env.DB.batch([
      c.env.DB.prepare('DELETE FROM events WHERE account = ?').bind(account),
      c.env.DB.prepare('DELETE FROM devices WHERE account = ?').bind(account),
      c.env.DB.prepare(
        `UPDATE accounts SET deleted_at = ?, auth_hash = '', bytes = 0, name = NULL, email = NULL,
          phone = NULL, birthday = NULL, news = 0, recovery = NULL WHERE id = ?`,
      ).bind(Date.now(), account),
    ])
    return c.json({})
  })

  // ── Pairing ─────────────────────────────────────────────────────────────
  // A device asking to join leaves a public key and waits; a device of the
  // account answers with its own and with the account's secret sealed between
  // the two. The relay carries the messages and can open none of them.

  .use('/pairings/*', async (c, next) => {
    const address = c.req.header('CF-Connecting-IP') ?? 'local'
    const limiter = c.req.path.includes('/code/') ? c.env.PAIRING_LIMITER : c.env.LIMITER
    if (!(await limiter.limit({ key: address })).success) return c.json({}, 429)
    await next()
  })

  .post(
    '/pairings',
    zValidator('json', z.object({ key: z.string().min(40).max(64) })),
    async (c) => {
      const now = Date.now()
      await c.env.DB.prepare('DELETE FROM pairings WHERE expires_at < ?').bind(now).run()
      const pairing: Pairing = {
        id: randomHex(16),
        code: String(crypto.getRandomValues(new Uint32Array(1))[0] % 100_000_000).padStart(8, '0'),
        expiresAt: now + pairingMinutes * 60_000,
      }
      const made = await c.env.DB.prepare(
        'INSERT OR IGNORE INTO pairings (id, code, key, expires_at) VALUES (?, ?, ?, ?)',
      )
        .bind(pairing.id, pairing.code, c.req.valid('json').key, pairing.expiresAt)
        .run()
      // The code is someone else's just now: the asking device tries again.
      if (made.meta.changes === 0) return c.json({}, 503)
      return c.json(pairing, 201)
    },
  )

  .get('/pairings/code/:code', async (c) => {
    const row = await c.env.DB.prepare(
      'SELECT id, key FROM pairings WHERE code = ? AND expires_at > ? AND answer_key IS NULL',
    )
      .bind(c.req.param('code'), Date.now())
      .first<{ id: string; key: string }>()
    return row ? c.json(row) : c.json({}, 404)
  })

  // The first answer stands: a second device can't step into a pairing.
  .put(
    '/pairings/:id',
    zValidator(
      'json',
      z.object({ answerKey: z.string().min(40).max(64), sealed: z.string().max(2000).optional() }),
    ),
    async (c) => {
      const body = c.req.valid('json')
      const done = await c.env.DB.prepare(
        `UPDATE pairings SET answer_key = coalesce(answer_key, ?), sealed = coalesce(sealed, ?)
          WHERE id = ? AND expires_at > ? AND (answer_key IS NULL OR answer_key = ?)`,
      )
        .bind(body.answerKey, body.sealed ?? null, c.req.param('id'), Date.now(), body.answerKey)
        .run()
      return done.meta.changes ? c.json({}) : c.json({}, 404)
    },
  )

  .get('/pairings/:id', async (c) => {
    const row = await c.env.DB.prepare(
      'SELECT answer_key, sealed FROM pairings WHERE id = ? AND expires_at > ?',
    )
      .bind(c.req.param('id'), Date.now())
      .first<{ answer_key: string | null; sealed: string | null }>()
    if (!row) return c.json({}, 404)
    // Read once: the secret doesn't wait on the relay after it is collected.
    if (row.sealed) {
      await c.env.DB.prepare('DELETE FROM pairings WHERE id = ?').bind(c.req.param('id')).run()
    }
    const state: PairingState = {
      answerKey: row.answer_key ?? undefined,
      sealed: row.sealed ?? undefined,
    }
    return c.json(state)
  })

  // ── Usage ───────────────────────────────────────────────────────────────
  // Counted under an id an install draws for this alone. It is never sent
  // with an account, and the address it came from is not kept.

  .post(
    '/analytics',
    zValidator(
      'json',
      z.object({
        install: id,
        platform: z.string().max(16),
        version: z.string().max(32),
        language: z.string().max(16),
        build: z.string().max(32).optional(),
        events: z
          .array(
            z.object({
              name: z.string().max(64),
              props: z.record(z.string().max(32), z.string().max(200)).optional(),
              day: z.string().length(10),
              hour: z.number().int().min(0).max(23).optional(),
            }),
          )
          .max(200),
      }),
    ),
    async (c) => {
      const body = c.req.valid('json')
      if (!(await c.env.LIMITER.limit({ key: body.install })).success) return c.json({}, 429)
      await c.env.DB.prepare(
        `INSERT INTO analytics (day, install, platform, version, language, build, name, props, hour)
          SELECT json_extract(value, '$.day'), ?, ?, ?, ?, ?, json_extract(value, '$.name'),
                 json_extract(value, '$.props'), json_extract(value, '$.hour')
          FROM json_each(?)`,
      )
        .bind(
          body.install,
          body.platform,
          body.version,
          body.language,
          body.build ?? null,
          JSON.stringify(body.events),
        )
        .run()
      return c.json({})
    },
  )

export default app
