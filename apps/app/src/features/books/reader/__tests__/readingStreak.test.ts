import { beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, emit, useEventStore } from '@/db/events'
import { setDb } from '@/db/instance'
import { readingStreakCursorId, readingTimeCursorId } from '@/db/repositories/cursors'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { getReadingStreak, touchReadingStreak } from '../readingStreak'
import { addReadingTime, getReadingTimeMs } from '../readingTime'

beforeEach(async () => {
  resetAllTestDbs()
  const db = await openDatabaseAsync('reading.db')
  setDb(db as never)
  await createEventsTable(db as never)
  useEventStore.getState().reset()
})

describe('readingStreak', () => {
  it('starts at 1 on first touch', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-06T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-06T11:00:00'))).toBe(1)
  })

  it('same-day touches don’t increment', async () => {
    const d1 = new Date('2026-06-06T08:00:00')
    const d2 = new Date('2026-06-06T20:00:00')
    await touchReadingStreak('book/a', d1)
    await touchReadingStreak('book/a', d2)
    expect(getReadingStreak('book/a', d2)).toBe(1)
  })

  it('consecutive days increment', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-05T10:00:00'))
    await touchReadingStreak('book/a', new Date('2026-06-06T10:00:00'))
    await touchReadingStreak('book/a', new Date('2026-06-07T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-07T11:00:00'))).toBe(3)
  })

  it('a one-day gap resets the streak', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-05T10:00:00'))
    // skip 2026-06-06
    await touchReadingStreak('book/a', new Date('2026-06-07T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-07T11:00:00'))).toBe(1)
  })

  it('getReadingStreak returns 0 when the last touch is older than yesterday', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-01T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-06T10:00:00'))).toBe(0)
  })

  it('carries on a run kept before each day was recorded', async () => {
    await emit({
      type: 'CursorSet',
      cursorId: readingStreakCursorId('book/a'),
      position: '{"lastDay":"2026-06-05","count":3}',
      startedAt: '2026-06-03',
    })
    expect(getReadingStreak('book/a', new Date('2026-06-06T09:00:00'))).toBe(3)
    await touchReadingStreak('book/a', new Date('2026-06-06T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-06T11:00:00'))).toBe(4)
  })

  it('adds the time each session read to the total kept before', async () => {
    await emit({
      type: 'CursorSet',
      cursorId: readingTimeCursorId('book/a'),
      position: '{"totalMs":60000}',
      startedAt: '2026-06-03',
    })
    await addReadingTime('book/a', 30_000)
    await addReadingTime('book/a', 15_000)
    expect(getReadingTimeMs('book/a')).toBe(105_000)
  })
})
