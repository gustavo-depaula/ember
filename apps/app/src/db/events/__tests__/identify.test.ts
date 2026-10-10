/**
 * A log written before events had ids opens with every event identified, in
 * the order it was written even where the device's clock ran backwards, and
 * with its numbered completions renamed so that another device's completion 1
 * can never be taken for this one's. A removal has to follow its completion
 * through the rename.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { setDb } from '@/db/instance'
import { logCompletion } from '@/db/repositories'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { useEventStore } from '../state'
import { createEventsTable, replayAll } from '../store'

const legacyTable = `
CREATE TABLE events (
  sequence  INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL,
  payload   TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  version   INTEGER NOT NULL DEFAULT 1
);`

const logged = (completionId: number, date: string) => ({
  type: 'CompletionLogged',
  completionId,
  practiceId: 'practice/rosary',
  subId: '1',
  date,
  completedAt: 1,
})

async function openLegacy(events: { type: string }[], timestamps: number[]) {
  const db = await openDatabaseAsync('legacy.db')
  await db.execAsync(legacyTable)
  for (const [i, event] of events.entries()) {
    await db.runAsync('INSERT INTO events (type, payload, timestamp) VALUES (?, ?, ?)', [
      event.type,
      JSON.stringify(event),
      timestamps[i],
    ])
  }
  setDb(db as never)
  await createEventsTable(db as never)
  await replayAll()
  return db
}

beforeEach(() => {
  resetAllTestDbs()
  useEventStore.getState().reset()
})

describe('opening a log written before events had ids', () => {
  it('identifies every event in the order written and renames its completions', async () => {
    const db = await openLegacy(
      [
        logged(1, '2026-05-10'),
        logged(2, '2026-05-11'),
        { type: 'CompletionRemoved', completionId: 1, practiceId: 'practice/rosary' } as never,
        {
          type: 'CompletionsBatchLogged',
          practiceId: 'practice/rosary',
          entries: [{ completionId: 3, date: '2026-05-12', subId: 'backfill', completedAt: 1 }],
        } as never,
      ],
      // The second and third were stored in one batch; the fourth after the clock was set back.
      [1000, 2000, 2000, 500],
    )

    const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM events ORDER BY sequence')
    const ids = rows.map((r) => r.id)
    expect(new Set(ids).size).toBe(4)
    expect([...ids].sort()).toEqual(ids)

    const { completions } = useEventStore.getState()
    expect([...completions.values()].map((c) => c.date).sort()).toEqual([
      '2026-05-11',
      '2026-05-12',
    ])
    expect([...completions.keys()].every((id) => /^\w{8}-[23]$/.test(id))).toBe(true)

    // Opening again changes nothing, and what is written next sorts after it all.
    await createEventsTable(db as never)
    await logCompletion('practice/rosary', '2026-05-13', '1', 'rosary', 'amen')
    const after = await db.getAllAsync<{ id: string }>('SELECT id FROM events ORDER BY sequence')
    expect(after.slice(0, 4).map((r) => r.id)).toEqual(ids)
    expect(after[4].id > ids[3]).toBe(true)
    expect(useEventStore.getState().completions.size).toBe(3)
  })
})
