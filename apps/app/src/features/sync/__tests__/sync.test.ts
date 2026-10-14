/**
 * Two devices and the real relay, end to end: the relay's own routes run over
 * a SQLite database standing in for D1, and each device is a database of its
 * own that the test steps between.
 */
import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventStore } from '@/db/events/state'
import { createEventsTable, emit, replayAll } from '@/db/events/store'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import {
  deleteAccount,
  joinAccount,
  keepOnlyHere,
  removeDevice,
  removeThisDevice,
  startAccount,
} from '../account'
import { sync } from '../engine'
import { answerScanned, answerTyped, askToJoin, readQr, waitForAnswer } from '../pairing'
import { type Account, useSync } from '../state'

const erased = vi.hoisted(() => ({ times: 0 }))
vi.mock('@/db/client', () => ({
  resetDatabase: async () => {
    erased.times++
  },
}))
// Which phone the code finds itself on.
const phoneHardware = vi.hoisted(() => ({ id: undefined as string | undefined }))
vi.mock('../device', async (original) => ({
  ...(await original<typeof import('../device')>()),
  hardwareId: async () => phoneHardware.id,
}))
const backups = vi.hoisted(() => [] as string[])
vi.mock('@/lib/backupFile', () => ({
  saveBackup: async (log: string) => {
    backups.push(log)
  },
}))

// The relay's sources are a Worker's: imported untyped, so this app's type-check doesn't take them in.
const { default: relayApp } = (await import('../../../../../relay/src/app' as string)) as {
  default: { request: (path: string, init: RequestInit, env: unknown) => Promise<Response> }
}

// D1's statement API over better-sqlite3: the same SQL engine the relay runs on.
function fakeD1() {
  const db = new Database(':memory:')
  const prepare = (sql: string) => {
    const run = (params: unknown[]) => {
      const statement = db.prepare(sql)
      if (statement.reader) return { results: statement.all(...params), meta: { changes: 0 } }
      return { results: [], meta: { changes: statement.run(...params).changes } }
    }
    const bound = (params: unknown[]) => ({
      run: async () => run(params),
      all: async () => run(params),
      first: async () => run(params).results[0] ?? null,
      execute: () => run(params),
    })
    return { ...bound([]), bind: (...params: unknown[]) => bound(params) }
  }
  return {
    prepare,
    batch: async (statements: { execute: () => unknown }[]) => statements.map((s) => s.execute()),
    raw: db,
  }
}

// One for the file: the relay makes its tables once per runtime.
const d1 = fakeD1()
let offline = false
// Called as soon as the relay has deleted an account, before the device has taken that in.
let onAccountDeleted: (() => void) | undefined
const allow = { limit: async () => ({ success: true }) }

type Device = { name: string; account: Account | undefined }
const phone: Device = { name: 'phone.db', account: undefined }
const laptop: Device = { name: 'laptop.db', account: undefined }
let current: Device

/** Steps over to `device`: its database, its account, its log folded. */
async function on(device: Device) {
  if (current) current.account = useSync.getState().account
  current = device
  setDb((await openDatabaseAsync(device.name)) as never)
  useSync.setState({ loaded: true, account: device.account, state: 'ok' })
  await replayAll()
}

const shelf = () => [...useEventStore.getState().savedItems.keys()].sort()
const save = (itemId: string) => emit({ type: 'ItemSaved', itemId, kind: 'book', savedAt: 1 })

beforeEach(async () => {
  resetAllTestDbs()
  offline = false
  onAccountDeleted = undefined
  phoneHardware.id = undefined
  erased.times = 0
  backups.length = 0
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    if (offline) throw new TypeError('Network request failed')
    const path = new URL(url).pathname
    const res = await relayApp.request(path + new URL(url).search, init, {
      DB: d1,
      LIMITER: allow,
      PAIRING_LIMITER: allow,
    })
    if (init.method === 'DELETE' && path.split('/').length === 3) onAccountDeleted?.()
    return res
  })
  await fetch('https://relay/health', {})
  for (const table of ['accounts', 'devices', 'events', 'pairings'])
    d1.raw.exec(`DELETE FROM ${table}`)
  for (const device of [phone, laptop]) {
    device.account = undefined
    const db = await openDatabaseAsync(device.name)
    await db.execAsync(initialMigration)
    await createEventsTable(db as never)
  }
  current = undefined as never
  await on(phone)
})

async function linkLaptop() {
  const secret = useSync.getState().account?.secret ?? ''
  await on(laptop)
  await joinAccount(secret)
}

describe('an account on two devices', () => {
  it('shows each what the other did', async () => {
    await save('book/phone-before')
    await startAccount()
    await linkLaptop()
    expect(shelf()).toEqual(['book/phone-before'])

    await save('book/laptop')
    await sync()
    await on(phone)
    await save('book/phone-after')
    await sync()
    expect(shelf()).toEqual(['book/laptop', 'book/phone-after', 'book/phone-before'])
    await on(laptop)
    await sync()
    expect(shelf()).toEqual(['book/laptop', 'book/phone-after', 'book/phone-before'])
    expect([...useEventStore.getState().devices.values()]).toHaveLength(2)
  })

  it('shows the relay nothing it can read', async () => {
    await startAccount()
    await save('book/confessions')
    await sync()
    const rows = d1.raw.prepare('SELECT key, body FROM events').all() as {
      key: string
      body: string
    }[]
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows)
      expect(row.key + atob(row.body)).not.toMatch(/confessions|ItemSaved|17\d{11}/)
  })

  it('replaces what a joining device held, after keeping a copy', async () => {
    await save('book/phone')
    await startAccount()
    await on(laptop)
    await save('book/laptop-only')
    await on(phone)
    await linkLaptop()
    expect(shelf()).toEqual(['book/phone'])
    expect(backups).toHaveLength(1)
    expect(backups[0]).toContain('book/laptop-only')
    // And it stays replaced: nothing of the old log is sent up afterwards.
    await sync()
    await on(phone)
    await sync()
    expect(shelf()).toEqual(['book/phone'])
  })

  it('keeps changes made out of reach and sends them later', async () => {
    await startAccount()
    await linkLaptop()
    offline = true
    await save('book/on-the-plane')
    await sync()
    expect(useSync.getState().state).toBe('waiting')
    offline = false
    await sync()
    expect(useSync.getState().state).toBe('ok')
    await on(phone)
    await sync()
    expect(shelf()).toEqual(['book/on-the-plane'])
  })

  it('erases a device removed from another, and only that one', async () => {
    await save('book/kept')
    await startAccount()
    await linkLaptop()
    const laptopId = useSync.getState().account?.device ?? ''
    await on(phone)
    await sync()
    await removeDevice(laptopId)
    expect(useEventStore.getState().devices.has(laptopId)).toBe(false)
    await sync()
    expect(erased.times).toBe(0)
    await on(laptop)
    await sync()
    expect(erased.times).toBe(1)
  })

  it('removes this device after sending what it had', async () => {
    await startAccount()
    await linkLaptop()
    await save('book/last-thing')
    await removeThisDevice()
    expect(erased.times).toBe(1)
    await on(phone)
    await sync()
    expect(shelf()).toEqual(['book/last-thing'])
    expect(erased.times).toBe(1)
  })

  it('kept only here: the account goes, the others are erased, this one keeps everything', async () => {
    await save('book/mine')
    await startAccount()
    await linkLaptop()
    await on(phone)
    await keepOnlyHere()
    expect(useSync.getState().account).toBeUndefined()
    expect(shelf()).toEqual(['book/mine'])
    expect(useEventStore.getState().devices.size).toBe(0)
    expect(d1.raw.prepare('SELECT count(*) AS n FROM events').get()).toEqual({ n: 0 })
    await on(laptop)
    await sync()
    expect(erased.times).toBe(1)

    // Starting again later takes the whole log up, not just what is new.
    await on(phone)
    await startAccount()
    expect(d1.raw.prepare('SELECT count(*) AS n FROM events').get()).toEqual({ n: 2 })
  })

  it('kept only here, with a sync starting the moment the account is gone: still not erased', async () => {
    await save('book/mine')
    await startAccount()
    let started: Promise<void> | undefined
    onAccountDeleted = () => {
      started = sync()
    }
    await keepOnlyHere()
    await started
    await sync()
    expect(erased.times).toBe(0)
    expect(shelf()).toEqual(['book/mine'])
  })

  it('restored from a backup onto another phone, becomes a device of its own', async () => {
    phoneHardware.id = 'old-phone'
    await save('book/before')
    await startAccount()
    const first = useSync.getState().account
    await sync()
    expect(useSync.getState().account).toEqual(first)

    // The same database, now on a new phone, while the old one goes on being used.
    phoneHardware.id = 'new-phone'
    offline = true
    await sync()
    expect(useSync.getState().account).toEqual(first)
    offline = false
    await sync()
    const second = useSync.getState().account
    expect(second?.device).not.toBe(first?.device)
    expect(second?.token).not.toBe(first?.token)
    expect(useEventStore.getState().devices.size).toBe(2)
    const known = d1.raw.prepare('SELECT count(*) AS n FROM devices WHERE removed_at IS NULL').get()
    expect(known).toEqual({ n: 2 })
    // And it settles: the next exchange registers nothing more.
    await sync()
    expect(useSync.getState().account).toEqual(second)
  })

  it('deleted: erased everywhere', async () => {
    await startAccount()
    await linkLaptop()
    await deleteAccount()
    expect(erased.times).toBe(1)
    await on(phone)
    await sync()
    expect(erased.times).toBe(2)
  })
})

describe('bringing a device in', () => {
  it('by scanning its code', async () => {
    await save('book/phone')
    await startAccount()
    await on(laptop)
    const asking = await askToJoin()
    await on(phone)
    const scanned = readQr(asking.qr)
    expect(scanned).toBeDefined()
    if (scanned) await answerScanned(scanned)
    await on(laptop)
    const secret = await waitForAnswer(
      asking,
      () => undefined,
      () => false,
    )
    await joinAccount(secret ?? '')
    expect(shelf()).toEqual(['book/phone'])
  })

  it('by typing its code, with the same number on both', async () => {
    await save('book/phone')
    await startAccount()
    await on(laptop)
    const asking = await askToJoin()
    await on(phone)
    const answer = await answerTyped(`${asking.code.slice(0, 4)} ${asking.code.slice(4)}`)
    let shown = ''
    const waiting = waitForAnswer(
      asking,
      (check) => {
        shown = check
        answer.confirm()
      },
      () => false,
    )
    const secret = await waiting
    expect(shown).toBe(answer.check)
    await on(laptop)
    await joinAccount(secret ?? '')
    expect(shelf()).toEqual(['book/phone'])
  }, 15_000)
})
