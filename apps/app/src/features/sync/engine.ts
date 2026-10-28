import type { SealedEvent } from '@ember/relay'
import { maxEventsPerPush } from '@ember/relay'
import { AppState } from 'react-native'

import { resetDatabase } from '@/db/client'
import { onEventsWritten, replayAll } from '@/db/events'
import type { StoredEvent } from '@/db/events/types'
import { getDb } from '@/db/instance'

import { hardwareId, nameDevice, newDevice } from './device'
import { type AccountKeys, accountKeys, fileKey, open, seal } from './keys'
import { isRelayError, relay } from './relay'
import { type Account, type SyncState, useSync } from './state'

// Keeps this device's log and the account's the same. Everyday syncing is a
// union: what was written here goes up, what other devices wrote comes down,
// and an event already held is skipped on either side. The log folds in id
// order, so it does not matter which way or in what order events travelled.

const accountKey = 'sync.account'
const positionKey = 'sync.position'
// A push stays well under what the relay takes in one request.
const maxPushBytes = 300_000

/** An event as it travels: the row's own columns, the payload already JSON. */
type Travelling = { id: string; t: number; v: number; e: string }

async function readPreference(key: string): Promise<string | undefined> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM preferences WHERE key = ?',
    [key],
  )
  return row?.value
}

const upsertPreference =
  'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value'

export function accountStatements(account: Account) {
  return [
    { sql: upsertPreference, params: [accountKey, JSON.stringify(account)] },
    { sql: 'DELETE FROM preferences WHERE key = ?', params: [positionKey] },
  ]
}

export const forgetAccountSql = `DELETE FROM preferences WHERE key IN ('${accountKey}', '${positionKey}')`

/** Sends what the relay doesn't hold yet. Throws if any of it could not be sent. */
export async function push(account: Account, keys: AccountKeys): Promise<void> {
  const db = getDb()
  for (;;) {
    const rows = await db.getAllAsync<StoredEvent>(
      'SELECT * FROM events WHERE synced = 0 ORDER BY sequence LIMIT ?',
      [maxEventsPerPush],
    )
    if (rows.length === 0) return
    const sealed: SealedEvent[] = []
    const sent: number[] = []
    let bytes = 0
    for (const row of rows) {
      const travelling: Travelling = {
        id: row.id,
        t: row.timestamp,
        v: row.version,
        e: row.payload,
      }
      const body = seal(keys.seal, JSON.stringify(travelling))
      if (sealed.length > 0 && bytes + body.length > maxPushBytes) break
      sealed.push([fileKey(keys, row.id), body])
      sent.push(row.sequence)
      bytes += body.length
    }
    await relay.push(keys.account, account.token, sealed)
    await db.runAsync(
      'UPDATE events SET synced = 1 WHERE sequence IN (SELECT value FROM json_each(?))',
      [JSON.stringify(sent)],
    )
  }
}

/** Brings down what other devices wrote. Resolves to whether any of it was new here. */
export async function pull(account: Account, keys: AccountKeys): Promise<boolean> {
  const db = getDb()
  let position = Number((await readPreference(positionKey)) ?? 0)
  let changed = false
  for (;;) {
    const pulled = await relay.pull(keys.account, account.token, position)
    if (pulled.bodies.length > 0) {
      const events = pulled.bodies.map((body) => JSON.parse(open(keys.seal, body)) as Travelling)
      const { changes } = await db.runAsync(
        `INSERT OR IGNORE INTO events (id, type, payload, timestamp, version, synced)
          SELECT json_extract(value, '$.id'), json_extract(json_extract(value, '$.e'), '$.type'),
                 json_extract(value, '$.e'), json_extract(value, '$.t'),
                 json_extract(value, '$.v'), 1
          FROM json_each(?) ORDER BY key`,
        [JSON.stringify(events)],
      )
      changed ||= changes > 0
    }
    // After the events, so a pull cut short is asked for again rather than skipped.
    if (pulled.position !== position) {
      position = pulled.position
      await db.runAsync(upsertPreference, [positionKey, String(position)])
    }
    if (!pulled.more) break
  }
  if (changed) {
    await replayAll()
  }
  return changed
}

/** Reads this device's account from its database. */
export async function loadAccount(): Promise<void> {
  const stored = await readPreference(accountKey)
  useSync.setState({ loaded: true, account: stored ? JSON.parse(stored) : undefined })
}

let pulledListener: (() => void) | undefined
let running: Promise<void> | undefined
let again = false
let held = false

/**
 * Runs `change` with syncing stopped: after any exchange under way has ended,
 * and with none starting until it is done. For a change to the account itself
 * — a sync that met the account half deleted would take this device for one
 * of those told to erase themselves.
 */
export async function withSyncHeld<T>(change: () => Promise<T>): Promise<T> {
  held = true
  try {
    await running
    return await change()
  } finally {
    held = false
  }
}

function stateOf(err: unknown): SyncState {
  // Anything else is a fault of ours: it is thrown, but the status is not left saying "syncing".
  if (!isRelayError(err)) {
    useSync.setState({ state: 'waiting' })
    throw err
  }
  if (err.status === 426) return 'outdated'
  if (err.status === 413) return 'full'
  return 'waiting'
}

/**
 * The account as this phone's own. A database restored from a backup onto
 * another phone brings the first phone's device with it; two phones answering
 * to one device would never be sent each other's changes. So a phone that
 * finds itself holding another's device registers as a new one.
 */
async function asOwnDevice(account: Account, keys: AccountKeys): Promise<Account> {
  const here = await hardwareId()
  if (!here || account.phone === here) return account
  // Registered before phones were told apart: this is the phone it was registered on.
  const restored = account.phone !== undefined
  const device = restored ? newDevice() : { id: account.device, token: account.token }
  if (restored) await relay.addDevice(keys.account, keys.auth, device)
  const own = { secret: account.secret, device: device.id, token: device.token, phone: here }
  // A new device starts from the top: the position kept was the other phone's.
  await getDb().runBatchInTx(restored ? accountStatements(own) : accountStatements(own).slice(0, 1))
  useSync.setState({ account: own })
  if (restored) await nameDevice(own.device)
  return own
}

async function round(): Promise<void> {
  const stored = useSync.getState().account
  if (!stored) return
  useSync.setState({ state: 'syncing' })
  try {
    const keys = accountKeys(stored.secret)
    const account = await asOwnDevice(stored, keys)
    await push(account, keys)
    if (await pull(account, keys)) pulledListener?.()
    useSync.setState({ state: 'ok', syncedAt: Date.now() })
  } catch (err) {
    // The account was deleted, or this device removed from it: either way
    // what is here was asked to go.
    if (isRelayError(err) && err.gone) {
      await resetDatabase()
      return
    }
    useSync.setState({ state: stateOf(err) })
  }
}

/** One exchange with the relay. A call during one already running asks for another after it. */
export function sync(): Promise<void> {
  if (held) return Promise.resolve()
  if (running) {
    again = true
    return running
  }
  running = round().finally(() => {
    running = undefined
    if (again && !held) sync()
    again = false
  })
  return running
}

/**
 * Reads this device's account and keeps it in step from then on: shortly after
 * each change made here, whenever the app comes to the front, and about once a
 * minute while it stays there. `onPulled` runs when another device's changes
 * have been folded in. Returns the way to stop.
 */
export function startSync(onPulled: () => void): () => void {
  pulledListener = onPulled
  let pushSoon: ReturnType<typeof setTimeout> | undefined

  loadAccount().then(sync)

  const stopListening = onEventsWritten(() => {
    clearTimeout(pushSoon)
    pushSoon = setTimeout(sync, 3000)
  })
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') sync()
  })
  const everyMinute = setInterval(() => {
    if (AppState.currentState === 'active') sync()
  }, 60_000)

  return () => {
    pulledListener = undefined
    clearTimeout(pushSoon)
    clearInterval(everyMinute)
    appState.remove()
    stopListening()
  }
}
