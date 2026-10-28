import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import app from '../src/app'
import type { AccountView, PairingState, Pulled } from '../src/protocol'

const secretOf = (name: string) => name.padEnd(40, '-')

function call(path: string, method = 'GET', body?: unknown, token?: string, format = 1) {
  return app.request(
    path,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Log-Format': String(format),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env,
  )
}

async function account(name: string) {
  const id = `account-${name}`
  const res = await call('/accounts', 'POST', {
    account: id,
    auth: secretOf(`${name}-auth`),
    format: 1,
    device: { id: 'device-one', token: secretOf(`${name}-one`) },
  })
  expect(res.status).toBe(201)
  return { id, auth: secretOf(`${name}-auth`), one: secretOf(`${name}-one`) }
}

const key = (n: number) => `key-${n}`.padEnd(20, '0')

async function pull(id: string, token: string, after = 0) {
  return (await (
    await call(`/accounts/${id}/events?after=${after}`, 'GET', undefined, token)
  ).json()) as Pulled
}

describe('an account', () => {
  it('hands each device what the others stored, once', async () => {
    const a = await account('share')
    const two = secretOf('share-two')
    expect(
      (await call(`/accounts/${a.id}/devices`, 'POST', { id: 'device-two', token: two }, a.auth))
        .status,
    ).toBe(201)

    await call(
      `/accounts/${a.id}/events`,
      'POST',
      {
        events: [
          [key(1), 'one'],
          [key(2), 'two'],
        ],
      },
      a.one,
    )
    const again = await call(
      `/accounts/${a.id}/events`,
      'POST',
      {
        events: [
          [key(2), 'two'],
          [key(3), 'three'],
        ],
      },
      a.one,
    )
    expect(await again.json()).toEqual({ stored: 1 })

    const first = await pull(a.id, two)
    expect(first.bodies).toEqual(['one', 'two', 'three'])
    expect(first.more).toBe(false)
    expect((await pull(a.id, two, first.position)).bodies).toEqual([])
    // Its own events don't come back, and its position still moves past them.
    const own = await pull(a.id, a.one)
    expect(own.bodies).toEqual([])
    expect(own.position).toBe(first.position)
  })

  it('refuses a stranger, and a device without the account secret', async () => {
    const a = await account('guard')
    expect(
      (await call(`/accounts/${a.id}/events`, 'GET', undefined, secretOf('nobody'))).status,
    ).toBe(401)
    const added = await call(
      `/accounts/${a.id}/devices`,
      'POST',
      { id: 'device-x', token: secretOf('x') },
      a.one,
    )
    expect(added.status).toBe(401)
    expect((await call('/accounts/account-unknown/events', 'GET', undefined, a.one)).status).toBe(
      404,
    )
  })

  it('turns a removed device away for good, and leaves the others', async () => {
    const a = await account('remove')
    const two = secretOf('remove-two')
    await call(`/accounts/${a.id}/devices`, 'POST', { id: 'device-two', token: two }, a.auth)
    await call(`/accounts/${a.id}/devices/device-two`, 'DELETE', undefined, a.one)

    const refused = await call(`/accounts/${a.id}/events`, 'GET', undefined, two)
    expect(refused.status).toBe(410)
    expect(await refused.json()).toEqual({ gone: 'device' })
    const view = (await (
      await call(`/accounts/${a.id}/view`, 'GET', undefined, a.one)
    ).json()) as AccountView
    expect(view.devices.map((d) => d.id)).toEqual(['device-one'])
  })

  it('once deleted, keeps nothing and tells every device so', async () => {
    const a = await account('delete')
    await call(
      `/accounts/${a.id}/profile`,
      'PUT',
      { name: 'Ana', email: 'ana@example.org', recovery: 'sealed' },
      a.one,
    )
    await call(`/accounts/${a.id}/events`, 'POST', { events: [[key(1), 'one']] }, a.one)
    expect((await call(`/accounts/${a.id}`, 'DELETE', undefined, a.one)).status).toBe(200)

    const after = await call(`/accounts/${a.id}/events`, 'GET', undefined, a.one)
    expect(after.status).toBe(410)
    expect(await after.json()).toEqual({ gone: 'account' })
    const kept = await env.DB.prepare('SELECT name, email, recovery FROM accounts WHERE id = ?')
      .bind(a.id)
      .first()
    expect(kept).toEqual({ name: null, email: null, recovery: null })
    const events = await env.DB.prepare('SELECT count(*) AS n FROM events WHERE account = ?')
      .bind(a.id)
      .first()
    expect(events).toEqual({ n: 0 })
  })

  it('keeps a recovery copy only beside a way to reach its owner', async () => {
    const a = await account('profile')
    await call(`/accounts/${a.id}/profile`, 'PUT', { name: 'Ana', recovery: 'sealed' }, a.one)
    const view = (await (
      await call(`/accounts/${a.id}/view`, 'GET', undefined, a.one)
    ).json()) as AccountView
    expect(view).toMatchObject({ profile: { name: 'Ana', news: false }, recoverable: false })
    await call(
      `/accounts/${a.id}/profile`,
      'PUT',
      { phone: '+55 11 5555-0100', recovery: 'sealed' },
      a.one,
    )
    const reachable = (await (
      await call(`/accounts/${a.id}/view`, 'GET', undefined, a.one)
    ).json()) as AccountView
    expect(reachable.recoverable).toBe(true)
  })

  it('asks an older app to update once a newer one has written', async () => {
    const a = await account('format')
    await call(`/accounts/${a.id}/events`, 'GET', undefined, a.one, 2)
    expect((await call(`/accounts/${a.id}/events`, 'GET', undefined, a.one, 1)).status).toBe(426)
  })
})

describe('pairing', () => {
  const askerKey = 'a'.repeat(43)
  const answerKey = 'b'.repeat(43)

  it('carries the answer to the asking device once', async () => {
    const pairing = (await (await call('/pairings', 'POST', { key: askerKey })).json()) as {
      id: string
      code: string
    }
    expect(pairing.code).toMatch(/^\d{8}$/)
    const found = (await (await call(`/pairings/code/${pairing.code}`)).json()) as {
      id: string
      key: string
    }
    expect(found).toEqual({ id: pairing.id, key: askerKey })

    await call(`/pairings/${pairing.id}`, 'PUT', { answerKey })
    // Answered: the code leads nowhere now, and no one else can answer.
    expect((await call(`/pairings/code/${pairing.code}`)).status).toBe(404)
    expect(
      (
        await call(`/pairings/${pairing.id}`, 'PUT', {
          answerKey: 'c'.repeat(43),
          sealed: 'theirs',
        })
      ).status,
    ).toBe(404)
    expect((await (await call(`/pairings/${pairing.id}`)).json()) as PairingState).toEqual({
      answerKey,
    })

    await call(`/pairings/${pairing.id}`, 'PUT', { answerKey, sealed: 'secret' })
    expect(await (await call(`/pairings/${pairing.id}`)).json()).toEqual({
      answerKey,
      sealed: 'secret',
    })
    expect((await call(`/pairings/${pairing.id}`)).status).toBe(404)
  })
})

describe('usage', () => {
  it('is counted without an account', async () => {
    const res = await call('/analytics', 'POST', {
      install: 'install-1',
      platform: 'android',
      version: '1.1.0',
      language: 'pt-BR',
      events: [
        { name: 'practice_prayed', props: { practice: 'practice/rosary' }, day: '2026-10-12' },
      ],
    })
    expect(res.status).toBe(200)
    const row = await env.DB.prepare('SELECT name, props FROM analytics').first()
    expect(row).toEqual({ name: 'practice_prayed', props: '{"practice":"practice/rosary"}' })
  })

  it('keeps the hour and the update when the app sends them, and goes without', async () => {
    const batch = { install: 'install-2', platform: 'ios', version: '1.1.0', language: 'en-US' }
    await call('/analytics', 'POST', {
      ...batch,
      build: '2026-10-14T09:30',
      events: [{ name: 'app_opened', day: '2026-10-14', hour: 6 }],
    })
    await call('/analytics', 'POST', {
      ...batch,
      events: [{ name: 'app_opened', day: '2026-10-14' }],
    })
    const { results } = await env.DB.prepare(
      "SELECT hour, build FROM analytics WHERE install = 'install-2' ORDER BY id",
    ).all()
    expect(results).toEqual([
      { hour: 6, build: '2026-10-14T09:30' },
      { hour: null, build: null },
    ])
  })
})
