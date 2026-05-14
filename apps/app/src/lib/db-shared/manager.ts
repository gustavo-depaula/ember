import { openDatabaseAsync } from 'expo-sqlite'
import { Platform } from 'react-native'

import { eventsTableSql } from '@/db/events/store'
import initialMigration from '@/db/migrations/0001_initial.sql'

/**
 * Per-tab unique-enough id. Originally `crypto.makeTabId()` but `crypto`
 * isn't a global on React Native's JS engine, and pulling in expo-crypto
 * here brings its `__DEV__`-dependent module init into the vitest jsdom
 * environment used by manager.test.ts. Timestamp + random hex is sufficient
 * — collisions between two same-millisecond tabs are bounded by the random
 * suffix and the only consequence of a collision is one tab's request
 * getting another tab's response, which the request-id sequencing already
 * disambiguates.
 */
function makeTabId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

import {
  CHANNEL_NAME,
  type CrossTabPayload,
  type EmberDb,
  LOCK_NAME,
  type RequestBody,
  type RequestMessage,
  type SqlBindParams,
  type Statement,
  type WireMessage,
} from './protocol'

// Generous backstop — the primary failover signal is the Web Lock callback
// firing on leader death, which drains pending synchronously. This timer
// only catches the case where the leader is alive but unresponsive.
const REQUEST_TIMEOUT_MS = 30_000

type Deferred<T> = {
  promise: Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

type PendingEntry = {
  d: Deferred<unknown>
  body: RequestBody
  timer: ReturnType<typeof setTimeout>
}

const tabId = makeTabId()

let initPromise: Promise<EmberDb> | undefined
let channel: BroadcastChannel | undefined
let realDb: Awaited<ReturnType<typeof openDatabaseAsync>> | undefined
let isLeader = false
const leaderReady = deferred<void>()

const pending = new Map<string, PendingEntry>()
const subscribers = new Set<(payload: CrossTabPayload) => void>()

// Broadcasts that arrive before the React tree subscribes (e.g. during the
// follower's boot, before `<CrossTabSync />` mounts) would otherwise be lost.
// Buffer them until the first subscriber attaches, then drain.
const broadcastBuffer: CrossTabPayload[] = []
let hasEverSubscribed = false

function ensureChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = handleMessage
  }
  return channel
}

function handleMessage(ev: MessageEvent) {
  const msg = ev.data as WireMessage | undefined
  if (!msg || typeof msg !== 'object') return

  if (msg.type === 'request') {
    if (isLeader) void serveRequest(msg)
    return
  }
  if (msg.type === 'response') {
    const entry = pending.get(msg.id)
    if (!entry) return
    pending.delete(msg.id)
    clearTimeout(entry.timer)
    if (msg.ok) entry.d.resolve(msg.result)
    else entry.d.reject(new Error(msg.error))
    return
  }
  if (msg.type === 'broadcast') {
    if (msg.originId === tabId) return
    if (!hasEverSubscribed) {
      broadcastBuffer.push(msg.payload)
      return
    }
    for (const s of subscribers) s(msg.payload)
    return
  }
  if (msg.type === 'leader-ready') {
    leaderReady.resolve()
    return
  }
  if (msg.type === 'leader-probe' && isLeader) {
    ensureChannel().postMessage({ type: 'leader-ready', leaderId: tabId })
  }
}

async function serveRequest(msg: RequestMessage) {
  const ch = ensureChannel()
  if (!realDb) {
    ch.postMessage({ type: 'response', id: msg.id, ok: false, error: 'leader has no db' })
    return
  }
  try {
    let result: unknown
    switch (msg.method) {
      case 'exec':
        await realDb.execAsync(msg.sql)
        break
      case 'run':
        result = await realDb.runAsync(msg.sql, msg.params ?? [])
        break
      case 'getAll':
        result = await realDb.getAllAsync(msg.sql, msg.params ?? [])
        break
      case 'getFirst':
        result = await realDb.getFirstAsync(msg.sql, msg.params ?? [])
        break
      case 'runBatchInTx': {
        const db = realDb
        await db.withTransactionAsync(async () => {
          for (const s of msg.statements) {
            await db.runAsync(s.sql, s.params ?? [])
          }
        })
        break
      }
    }
    ch.postMessage({ type: 'response', id: msg.id, ok: true, result })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    ch.postMessage({ type: 'response', id: msg.id, ok: false, error })
  }
}

async function sendRequest(body: RequestBody): Promise<unknown> {
  const ch = ensureChannel()
  const id = makeTabId()
  const d = deferred<unknown>()
  const timer = setTimeout(() => {
    if (pending.delete(id)) {
      d.reject(new Error('cross-tab DB request timed out'))
    }
  }, REQUEST_TIMEOUT_MS)
  pending.set(id, { d, body, timer })
  ch.postMessage({ type: 'request', id, ...body } as RequestMessage)
  return d.promise
}

async function becomeLeader(): Promise<void> {
  realDb = await openDatabaseAsync('ember.db')
  await realDb.execAsync(initialMigration)
  await realDb.execAsync(eventsTableSql)
  isLeader = true
  ensureChannel().postMessage({ type: 'leader-ready', leaderId: tabId })
  leaderReady.resolve()
}

/**
 * Called right after this tab is promoted from follower to leader (the
 * previous leader died, the Web Lock released, our queued lock request was
 * granted). Any pending requests have already been posted to the dead leader
 * and will never get a response. Reads are safe to re-execute locally; writes
 * may have partially committed before the leader died, so we surface a
 * retryable error to the caller rather than risk duplicates.
 */
function drainPendingOnPromotion(): void {
  if (!realDb) return
  const db = realDb
  const entries = [...pending.entries()]
  pending.clear()
  for (const [, entry] of entries) {
    clearTimeout(entry.timer)
    const { d, body } = entry
    if (body.method === 'getAll') {
      db.getAllAsync(body.sql, body.params).then(
        (res) => d.resolve(res),
        (err) => d.reject(err),
      )
    } else if (body.method === 'getFirst') {
      db.getFirstAsync(body.sql, body.params).then(
        (res) => d.resolve(res),
        (err) => d.reject(err),
      )
    } else {
      d.reject(new Error('cross-tab leader changed mid-request; please retry'))
    }
  }
}

function rejectAllPending(err: unknown): void {
  for (const [, entry] of pending) {
    clearTimeout(entry.timer)
    entry.d.reject(err)
  }
  pending.clear()
}

function makeProxy(): EmberDb {
  return {
    async execAsync(sql) {
      if (isLeader && realDb) {
        await realDb.execAsync(sql)
        return
      }
      await sendRequest({ method: 'exec', sql })
    },
    async runAsync(sql, params: SqlBindParams = []) {
      if (isLeader && realDb) return realDb.runAsync(sql, params)
      return (await sendRequest({ method: 'run', sql, params })) as {
        lastInsertRowId: number
        changes: number
      }
    },
    async getAllAsync<T>(sql: string, params: SqlBindParams = []): Promise<T[]> {
      if (isLeader && realDb) return realDb.getAllAsync<T>(sql, params)
      return (await sendRequest({ method: 'getAll', sql, params })) as T[]
    },
    async getFirstAsync<T>(sql: string, params: SqlBindParams = []): Promise<T | null> {
      if (isLeader && realDb) return realDb.getFirstAsync<T>(sql, params)
      return (await sendRequest({ method: 'getFirst', sql, params })) as T | null
    },
    async runBatchInTx(statements: Statement[]) {
      if (statements.length === 0) return
      if (isLeader && realDb) {
        const db = realDb
        await db.withTransactionAsync(async () => {
          for (const s of statements) await db.runAsync(s.sql, s.params ?? [])
        })
        return
      }
      await sendRequest({ method: 'runBatchInTx', statements })
    },
    async closeAsync() {
      // resetDatabase reloads the tab after closing, so in-flight requests
      // wouldn't survive anyway — but rejecting explicitly keeps awaiters
      // from hanging if reset semantics ever change.
      rejectAllPending(new Error('database closed'))
      if (isLeader && realDb) {
        await realDb.closeAsync()
        realDb = undefined
        isLeader = false
      }
    },
  }
}

export async function initEmberDb(): Promise<EmberDb> {
  if (initPromise) return initPromise

  const ch = ensureChannel()

  // Try to acquire the leader lock. The callback runs only when this tab wins;
  // we hold the lock until the tab unloads. Followers stay queued — if the
  // leader dies, the browser promotes one of them by firing this callback.
  void navigator.locks.request(LOCK_NAME, { mode: 'exclusive' }, async () => {
    try {
      await becomeLeader()
    } catch (err) {
      leaderReady.reject(err)
      rejectAllPending(err)
      throw err
    }
    drainPendingOnPromotion()
    await new Promise<void>(() => {})
  })

  // Probe in case a leader was established before we subscribed to the channel.
  ch.postMessage({ type: 'leader-probe' })

  initPromise = leaderReady.promise.then(makeProxy)
  return initPromise
}

export function broadcastChange(payload: CrossTabPayload): void {
  if (Platform.OS !== 'web') return
  ensureChannel().postMessage({ type: 'broadcast', originId: tabId, payload })
}

export function subscribeChanges(handler: (payload: CrossTabPayload) => void): () => void {
  if (Platform.OS !== 'web') return () => {}
  subscribers.add(handler)
  if (!hasEverSubscribed) {
    hasEverSubscribed = true
    const drained = broadcastBuffer.splice(0)
    for (const payload of drained) handler(payload)
  }
  return () => {
    subscribers.delete(handler)
  }
}
