import { broadcastChange } from '@/lib/db-shared/manager'

import type { EmberDb } from '@/lib/db-shared/protocol'
import { getDb } from '../instance'
import { idsInOrder, newWriterTag, nextId, observe } from './clock'
import { useEventStore } from './state'
import type { AppEvent, StoredEvent } from './types'

// `sequence` is the order rows reached this database; `id` is the event's
// place in the log wherever it is read (see clock.ts), and the order it folds in.
const eventsTableSql = `
CREATE TABLE IF NOT EXISTS events (
  sequence  INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL,
  payload   TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  version   INTEGER NOT NULL DEFAULT 1,
  id        TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
`

export async function createEventsTable(db: EmberDb): Promise<void> {
  await db.execAsync(eventsTableSql)
  const hasId = await db.getAllAsync("SELECT 1 FROM pragma_table_info('events') WHERE name = 'id'")
  if (hasId.length === 0) {
    await db.execAsync("ALTER TABLE events ADD COLUMN id TEXT NOT NULL DEFAULT ''")
  }
  await identifyEvents(db)
  await db.execAsync('CREATE UNIQUE INDEX IF NOT EXISTS idx_events_id ON events (id)')
}

// A log from before events had ids gets them here, once. Its completions were
// numbered by a counter every device started at 1, so each takes the log's own
// tag as well, and two devices' completions can't be taken for each other.
async function identifyEvents(db: EmberDb): Promise<void> {
  const rows = await db.getAllAsync<StoredEvent>(
    "SELECT * FROM events WHERE id = '' ORDER BY sequence",
  )
  if (rows.length === 0) return
  const tag = newWriterTag()
  const ids = idsInOrder(
    rows.map((row) => row.timestamp),
    tag,
  )
  const completionId = (n: unknown) => `${tag}-${n}`
  const identified = rows.map((row, i) => {
    const event = JSON.parse(row.payload)
    if ('completionId' in event) event.completionId = completionId(event.completionId)
    for (const entry of event.type === 'CompletionsBatchLogged' ? event.entries : []) {
      entry.completionId = completionId(entry.completionId)
    }
    return [row.sequence, ids[i], JSON.stringify(event)]
  })
  // One statement, so a log is never left half identified.
  await db.runAsync(
    `UPDATE events SET id = j.id, payload = j.payload
      FROM (SELECT json_extract(value, '$[0]') AS sequence, json_extract(value, '$[1]') AS id,
                   json_extract(value, '$[2]') AS payload FROM json_each(?)) AS j
      WHERE events.sequence = j.sequence`,
    [JSON.stringify(identified)],
  )
}

export async function emit(event: AppEvent): Promise<void> {
  useEventStore.getState().apply(event)

  const db = getDb()
  try {
    await db.runAsync(
      'INSERT INTO events (id, type, payload, timestamp, version) VALUES (?, ?, ?, ?, 1)',
      [nextId(), event.type, JSON.stringify(event), Date.now()],
    )
    broadcastChange({ kind: 'event', event })
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
    // One statement for the whole batch: SQLite expands the JSON array itself,
    // where a statement per row cost most of a second on a batch of hundreds.
    await db.runBatchInTx([
      {
        sql: `INSERT INTO events (id, type, payload, timestamp, version)
          SELECT json_extract(value, '$[0]'), json_extract(value, '$[1].type'),
                 json_extract(value, '$[1]'), ?, 1
          FROM json_each(?) ORDER BY key`,
        params: [ts, JSON.stringify(events.map((event) => [nextId(ts), event]))],
      },
    ])
    broadcastChange({ kind: 'event-batch', events })
  } catch (err) {
    await replayAll()
    throw err
  }
}

export async function replayAll(): Promise<void> {
  const db = getDb()
  const rows = await db.getAllAsync<StoredEvent>('SELECT * FROM events ORDER BY id')
  observe(rows.at(-1)?.id)
  useEventStore.getState().load(rows.map((row) => JSON.parse(row.payload) as AppEvent))
}

export async function getEventCount(): Promise<number> {
  const db = getDb()
  const row = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM events')
  return row?.cnt ?? 0
}
