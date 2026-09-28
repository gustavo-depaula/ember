/**
 * emitBatch writes a whole batch in one statement (SQLite expands a JSON
 * array); replay must see every event, in order, with its payload intact.
 */
import { openDatabaseAsync } from 'expo-sqlite'
import { beforeEach, describe, expect, it } from 'vitest'

import type { EmberDb } from '@/lib/db-shared/protocol'
import { setDb } from '../../instance'
import { useEventStore } from '../state'
import { createEventsTable, emitBatch, getEventCount, replayAll } from '../store'
import type { AppEvent } from '../types'

beforeEach(async () => {
  const db = (await openDatabaseAsync(`events-${Math.random()}`)) as unknown as EmberDb
  await createEventsTable(db)
  setDb(db)
  useEventStore.getState().reset()
})

const cursorEvents = (n: number): AppEvent[] =>
  Array.from({ length: n }, (_, i) => ({
    type: 'CursorSet' as const,
    cursorId: `cursor-${i}`,
    position: `{"index":${i}}`,
    startedAt: '2026-09-28',
  }))

describe('emitBatch', () => {
  it('persists every event of a large batch', async () => {
    await emitBatch(cursorEvents(450))

    expect(await getEventCount()).toBe(450)
  })

  it('replays the persisted batch in order', async () => {
    await emitBatch(cursorEvents(450))
    await replayAll()

    const cursors = useEventStore.getState().cursors
    expect(cursors.size).toBe(450)
    expect(cursors.get('cursor-449')?.position).toBe('{"index":449}')
  })

  it('keeps each payload byte-for-byte and the type column in sync', async () => {
    const events: AppEvent[] = [
      { type: 'PracticeCreated', practiceId: 'practice/angelus', customName: 'Ângelus — “Ave”' },
      { type: 'CursorSet', cursorId: 'c', position: '{"index":0}', startedAt: '2026-09-28' },
    ]
    await emitBatch(events)

    const { getDb } = await import('../../instance')
    const rows = await getDb().getAllAsync<{ type: string; payload: string }>(
      'SELECT type, payload FROM events ORDER BY sequence',
    )
    expect(rows.map((r) => r.type)).toEqual(['PracticeCreated', 'CursorSet'])
    expect(rows.map((r) => JSON.parse(r.payload))).toEqual(events)
  })
})
