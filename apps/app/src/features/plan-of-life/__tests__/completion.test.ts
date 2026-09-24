import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, useEventStore } from '@/db/events'
import { setDb } from '@/db/instance'
import { addSlot, archivePractice, createPracticeWithSlot } from '@/db/repositories'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { completePractice, setSlotDone, useCompletedSlots } from '../completion'

const date = '2026-05-12'

function doneOn(day: string): string[] {
  const s = useEventStore.getState()
  return [...(s.completionsByDate.get(day) ?? [])]
    .map((id) => s.completions.get(id))
    .map((c) => `${c?.practice_id}::${c?.sub_id}`)
    .sort()
}

beforeEach(async () => {
  resetAllTestDbs()
  const db = await openDatabaseAsync('completion.db')
  setDb(db as never)
  await createEventsTable(db as never)
  useEventStore.getState().reset()
})

describe('completing a prayed practice', () => {
  it('fills the base practice slot when its active variant is prayed', async () => {
    const slot = await createPracticeWithSlot(
      { id: 'practice/rosary', activeVariant: 'practice/rosary-scriptural' },
      {},
    )

    await completePractice('practice/rosary-scriptural', date)

    expect(doneOn(date)).toEqual([slot])
  })

  it('maps a bare route id onto the canonical plan practice', async () => {
    const slot = await createPracticeWithSlot({ id: 'practice/mass' }, {})

    await completePractice('mass', date)

    expect(doneOn(date)).toEqual([slot])
  })

  it('honours the slot that was tapped', async () => {
    await createPracticeWithSlot({ id: 'practice/angelus' }, {})
    const evening = await addSlot('practice/angelus', {})

    await completePractice('practice/angelus', date, evening)

    expect(doneOn(date)).toEqual([evening])
  })

  it('fills the next open slot when a twice-daily practice is prayed twice', async () => {
    const morning = await createPracticeWithSlot({ id: 'practice/angelus' }, {})
    const evening = await addSlot('practice/angelus', {})

    await completePractice('practice/angelus', date)
    await completePractice('practice/angelus', date)

    expect(doneOn(date)).toEqual([morning, evening].sort())
  })

  it('logs a practice outside the plan unslotted, under the prayed id', async () => {
    await completePractice('practice/our-father', date)

    expect(doneOn(date)).toEqual(['practice/our-father::default'])
  })

  it('does not fill a slot of an archived practice', async () => {
    await createPracticeWithSlot({ id: 'practice/rosary' }, {})
    await archivePractice('practice/rosary')

    await completePractice('practice/rosary', date)

    expect(doneOn(date)).toEqual(['practice/rosary::default'])
  })
})

describe('checking a slot off', () => {
  it('round-trips through the completed set', async () => {
    const slot = await createPracticeWithSlot({ id: 'practice/rosary' }, {})
    const { result } = renderHook(() => useCompletedSlots(date))
    expect(result.current.has(slot)).toBe(false)

    await act(() => setSlotDone(slot, date, true))
    expect(result.current.has(slot)).toBe(true)

    await act(() => setSlotDone(slot, date, false))
    expect(result.current.has(slot)).toBe(false)
  })

  it('scopes the completed set to its date', async () => {
    const slot = await createPracticeWithSlot({ id: 'practice/rosary' }, {})
    await setSlotDone(slot, '2026-05-11', true)

    const { result } = renderHook(() => useCompletedSlots(date))

    expect(result.current.size).toBe(0)
  })
})
