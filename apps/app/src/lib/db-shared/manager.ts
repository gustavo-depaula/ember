import { openDatabaseAsync } from 'expo-sqlite'
import { Platform } from 'react-native'

import initialMigration from '@/db/migrations/0001_initial.sql'

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

const eventsTableSql = `
CREATE TABLE IF NOT EXISTS events (
  sequence  INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL,
  payload   TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  version   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
`

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

const tabId = crypto.randomUUID()

let initPromise: Promise<EmberDb> | undefined
let channel: BroadcastChannel | undefined
let realDb: Awaited<ReturnType<typeof openDatabaseAsync>> | undefined
let isLeader = false
const leaderReady = deferred<void>()

const pending = new Map<string, Deferred<unknown>>()
const subscribers = new Set<(payload: CrossTabPayload) => void>()

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
    const d = pending.get(msg.id)
    if (!d) return
    pending.delete(msg.id)
    if (msg.ok) d.resolve(msg.result)
    else d.reject(new Error(msg.error))
    return
  }
  if (msg.type === 'broadcast') {
    if (msg.originId === tabId) return
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
      case 'runBatchInTx':
        await realDb.withTransactionAsync(async () => {
          for (const s of msg.statements) {
            await realDb!.runAsync(s.sql, s.params ?? [])
          }
        })
        break
    }
    ch.postMessage({ type: 'response', id: msg.id, ok: true, result })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    ch.postMessage({ type: 'response', id: msg.id, ok: false, error })
  }
}

async function sendRequest(body: RequestBody): Promise<unknown> {
  const ch = ensureChannel()
  const id = crypto.randomUUID()
  const d = deferred<unknown>()
  pending.set(id, d)
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
      // Followers can't close — only the leader holds the connection.
      // resetDatabase handles the cross-tab teardown via window.location.reload.
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
  // we hold the lock until the tab unloads. Followers stay queued.
  void navigator.locks.request(LOCK_NAME, { mode: 'exclusive' }, async () => {
    try {
      await becomeLeader()
    } catch (err) {
      leaderReady.reject(err)
      throw err
    }
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
  return () => {
    subscribers.delete(handler)
  }
}
