import { getDb } from '../instance'
import { replayAll } from './store'
import type { AppEvent, StoredEvent } from './types'

// The whole of what a person has done in the app, as one file: every event
// with the id that places it. Merging a file from another device is the same
// operation whichever way the events travel, so two devices that have each
// merged the other's file hold the same log and fold it to the same state.

const format = 'ember-log'

type LogFile = {
  format: typeof format
  version: 1
  events: { id: string; timestamp: number; version: number; event: AppEvent }[]
}

export async function exportLog(): Promise<string> {
  const rows = await getDb().getAllAsync<StoredEvent>('SELECT * FROM events ORDER BY id')
  const file: LogFile = {
    format,
    version: 1,
    events: rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      version: row.version,
      event: JSON.parse(row.payload),
    })),
  }
  return JSON.stringify(file)
}

/**
 * Adds the events of `file` this log doesn't hold yet and folds the whole log
 * again, since some may belong before events already here. Resolves to how
 * many were new. Stores that copy from the log (the preferences) and cached
 * queries are the caller's to refresh.
 */
export async function mergeLog(file: string): Promise<number> {
  const parsed = JSON.parse(file) as Partial<LogFile>
  if (parsed.format !== format || parsed.version !== 1 || !Array.isArray(parsed.events)) {
    throw new Error('Not an Ember log file')
  }
  // One statement, so a file is merged whole or not at all; an id already here is skipped.
  const { changes } = await getDb().runAsync(
    `INSERT OR IGNORE INTO events (id, type, payload, timestamp, version)
      SELECT json_extract(value, '$.id'), json_extract(value, '$.event.type'),
             json_extract(value, '$.event'), json_extract(value, '$.timestamp'),
             json_extract(value, '$.version')
      FROM json_each(?) ORDER BY key`,
    [JSON.stringify(parsed.events)],
  )
  await replayAll()
  return changes
}
