import type { SQLiteDatabase } from 'expo-sqlite'

import { getDb } from '../instance'
import { useEventStore } from './state'
import type { AppEvent, StoredEvent } from './types'

const createEventsSql = `
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

export async function createEventsTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(createEventsSql)
}

export async function emit(event: AppEvent): Promise<number> {
  useEventStore.getState().apply(event)

  const db = getDb()
  try {
    const result = await db.runAsync(
      'INSERT INTO events (type, payload, timestamp, version) VALUES (?, ?, ?, 1)',
      [event.type, JSON.stringify(event), Date.now()],
    )
    return result.lastInsertRowId
  } catch (err) {
    await replayAll()
    throw err
  }
}

export async function emitBatch(events: AppEvent[]): Promise<void> {
  useEventStore.getState().applyBatch(events)

  const db = getDb()
  const ts = Date.now()
  try {
    await db.withTransactionAsync(async () => {
      for (const event of events) {
        await db.runAsync(
          'INSERT INTO events (type, payload, timestamp, version) VALUES (?, ?, ?, 1)',
          [event.type, JSON.stringify(event), ts],
        )
      }
    })
  } catch (err) {
    await replayAll()
    throw err
  }
}

export async function replayAll(): Promise<void> {
  const db = getDb()
  const rows = await db.getAllAsync<StoredEvent>('SELECT * FROM events ORDER BY sequence')
  const store = useEventStore.getState()
  store.reset()
  store.applyBatch(rows.map((row) => JSON.parse(row.payload) as AppEvent))
}

export async function getEventCount(): Promise<number> {
  const db = getDb()
  const row = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM events')
  return row?.cnt ?? 0
}
