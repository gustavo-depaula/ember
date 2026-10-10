/**
 * A log written while launch still filled the plan with every practice in the
 * corpus has to open as the plan its owner made: what they added, removed or
 * prayed stays exactly as it was, and the placeholders are gone from the log
 * itself, not just hidden.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { setDb } from '@/db/instance'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { dropPlaceholders } from '../compact'
import { useEventStore } from '../state'
import { createEventsTable, emitBatch, getEventCount, replayAll } from '../store'
import type { AppEvent } from '../types'

const daily = '{"type":"daily"}'

function placeholder(practiceId: string): AppEvent[] {
  return [
    { type: 'PracticeCreated', practiceId, activeVariant: practiceId },
    {
      type: 'SlotAdded',
      practiceId,
      slotKey: `${practiceId}::1`,
      tier: 'extra',
      time: null,
      timeBlock: 'flexible',
      schedule: daily,
      sortOrder: 5,
      enabled: 0,
    },
  ]
}

const logged = (practiceId: string, completionId: number): AppEvent => ({
  type: 'CompletionLogged',
  completionId,
  practiceId,
  subId: 'default',
  date: '2026-05-10',
  completedAt: 1,
})

async function open(events: AppEvent[]) {
  resetAllTestDbs()
  const db = await openDatabaseAsync('compact.db')
  setDb(db as never)
  await createEventsTable(db as never)
  useEventStore.getState().reset()
  await emitBatch(events)
  await dropPlaceholders(db as never)
  await replayAll()
  return useEventStore.getState()
}

beforeEach(() => useEventStore.getState().reset())

describe('opening a log that launch had filled with every practice', () => {
  it('keeps what was added, removed, merged or prayed and drops the rest', async () => {
    const events: AppEvent[] = [
      ...placeholder('practice/rosary'),
      ...placeholder('practice/angelus'),
      ...placeholder('practice/lectio'),
      ...placeholder('practice/stations'),
      ...placeholder('practice/mass'),
      ...placeholder('practice/te-deum'),
      ...placeholder('prostrations'),
      // Added, then taken out again: the slot is kept, switched off.
      { type: 'SlotUpdated', slotKey: 'practice/rosary::1', changes: { enabled: 1 } },
      { type: 'SlotUpdated', slotKey: 'practice/rosary::1', changes: { enabled: 0 } },
      {
        type: 'SlotUpdated',
        slotKey: 'practice/angelus::1',
        changes: { time: '12:00', enabled: 1 },
      },
      // Prayed from the library, under the canonical id and under the bare one.
      logged('practice/lectio', 1),
      logged('stations', 2),
      // A template's bare-id copy folded into the placeholder.
      { type: 'PracticeCreated', practiceId: 'mass' },
      { ...placeholder('mass')[1], enabled: 1 } as AppEvent,
      { type: 'PracticeMerged', fromId: 'mass', toId: 'practice/mass' },
      { type: 'SlotsReordered', orderedSlotKeys: ['practice/angelus::1', 'practice/te-deum::1'] },
    ]
    const { practices, slots, completions } = await open(events)

    expect([...practices.keys()].sort()).toEqual([
      'practice/angelus',
      'practice/lectio',
      'practice/mass',
      'practice/rosary',
      'practice/stations',
    ])
    expect(slots.get('practice/rosary::1')?.enabled).toBe(0)
    expect(slots.get('practice/angelus::1')).toMatchObject({ time: '12:00', enabled: 1 })
    expect(slots.get('practice/mass::2')?.enabled).toBe(1)
    expect(completions.size).toBe(2)
    // te-deum and prostrations: two events each.
    expect(await getEventCount()).toBe(events.length - 4)
  })

  it('leaves a plan made without placeholders untouched', async () => {
    const events: AppEvent[] = [
      { type: 'PracticeCreated', practiceId: 'practice/rosary' },
      { ...placeholder('practice/rosary')[1], enabled: 1 } as AppEvent,
      { type: 'CursorSet', cursorId: 'book/x', position: '{"index":0}', startedAt: '2026-05-10' },
    ]
    await open(events)
    expect(await getEventCount()).toBe(events.length)
  })
})
