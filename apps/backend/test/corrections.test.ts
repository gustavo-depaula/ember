import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app'
import { resetTables } from './helpers'

const churchId = 'st-mary-a'

async function reset() {
  await resetTables('verification_event', 'correction', 'attachment', 'church')
  await env.DB.prepare(
    'INSERT INTO church (id, name, lat, lng, geohash, timezone) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(churchId, 'Saint Mary', 40, -74, 'dr5regw3p', 'America/New_York')
    .run()
}

beforeEach(reset)

const postJson = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  app.request(
    path,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...headers },
    },
    env,
  )

describe('POST /churches/:id/verify', () => {
  it('records a verification, then dedupes a repeat from the same fingerprint', async () => {
    const first = await postJson(`/churches/${churchId}/verify`, {})
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ deduped: false })

    const second = await postJson(`/churches/${churchId}/verify`, {})
    expect(await second.json()).toEqual({ deduped: true })

    // a different client id is a different fingerprint → not deduped
    const other = await postJson(
      `/churches/${churchId}/verify`,
      {},
      { 'X-Client-Id': 'someone-else' },
    )
    expect(await other.json()).toEqual({ deduped: false })

    const { count } = await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM verification_event WHERE church_id = ?',
    )
      .bind(churchId)
      .first<{ count: number }>()
    expect(count).toBe(2)
  })
})

describe('POST /churches/:id/corrections', () => {
  it('accepts a valid note and stores a pending row with the JSON payload', async () => {
    const res = await postJson(`/churches/${churchId}/corrections`, {
      kind: 'note',
      comment: 'Sunday Mass moved to 10:00',
    })
    expect(res.status).toBe(201)
    const { id } = (await res.json()) as { id: string }
    expect(id).toBeTruthy()

    const row = await env.DB.prepare('SELECT kind, status, payload FROM correction WHERE id = ?')
      .bind(id)
      .first<{ kind: string; status: string; payload: string }>()
    expect(row?.kind).toBe('note')
    expect(row?.status).toBe('pending')
    expect(JSON.parse(row?.payload ?? '{}')).toMatchObject({
      comment: 'Sunday Mass moved to 10:00',
    })
  })

  it('accepts a structured edit_service correction', async () => {
    const res = await postJson(`/churches/${churchId}/corrections`, {
      kind: 'edit_service',
      serviceId: 'svc-1',
      changes: { startTime: '10:00' },
    })
    expect(res.status).toBe(201)
    const row = await env.DB.prepare('SELECT service_id FROM correction WHERE church_id = ?')
      .bind(churchId)
      .first<{ service_id: string }>()
    expect(row?.service_id).toBe('svc-1')
  })

  it('rejects a malformed payload (Zod 400)', async () => {
    const res = await postJson(`/churches/${churchId}/corrections`, { kind: 'note' }) // missing required comment
    expect(res.status).toBe(400)
  })
})

describe('POST /churches/:id/corrections/attachments', () => {
  it('stores the body as base64 in D1 and returns its id as the key', async () => {
    const res = await app.request(
      `/churches/${churchId}/corrections/attachments`,
      { method: 'POST', body: 'fake-bulletin-bytes', headers: { 'Content-Type': 'image/jpeg' } },
      env,
    )
    expect(res.status).toBe(201)
    const { key } = (await res.json()) as { key: string }

    const row = await env.DB.prepare(
      'SELECT church_id, content_type, data FROM attachment WHERE id = ?',
    )
      .bind(key)
      .first<{ church_id: string; content_type: string; data: string }>()
    expect(row?.church_id).toBe(churchId)
    expect(row?.content_type).toBe('image/jpeg')
    expect(atob(row?.data ?? '')).toBe('fake-bulletin-bytes')
  })

  it('rejects an empty body', async () => {
    const res = await app.request(
      `/churches/${churchId}/corrections/attachments`,
      { method: 'POST', body: '', headers: { 'Content-Type': 'image/jpeg' } },
      env,
    )
    expect(res.status).toBe(400)
  })
})
