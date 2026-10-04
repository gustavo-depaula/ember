/**
 * PracticeMerged folds a practice kept under its bare id into its canonical
 * twin. Nothing the user did may be lost on the way: slots, the completions on
 * them and a program's place all have to come out under the new id, and again
 * after a replay of the log.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { setDb } from '@/db/instance'
import { addSlot, createPracticeWithSlot, logCompletion, updatePractice } from '@/db/repositories'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { useEventStore } from '../state'
import { createEventsTable, emit, replayAll } from '../store'

const sunday = '{"type":"days-of-week","days":[0]}'

function completions(): string[] {
  return [...useEventStore.getState().completions.values()]
    .map((c) => `${c.date} ${c.practice_id}::${c.sub_id} ${c.via}`)
    .sort()
}

function slotKeys(): string[] {
  return [...useEventStore.getState().slots.keys()].sort()
}

beforeEach(async () => {
  resetAllTestDbs()
  const db = await openDatabaseAsync('merge.db')
  setDb(db as never)
  await createEventsTable(db as never)
  useEventStore.getState().reset()
})

describe('merging a bare-id practice into its canonical twin', () => {
  it('carries slots and their completions across, renumbering a slot that collides', async () => {
    // The twin seeding leaves: one slot, switched off.
    const seeded = await createPracticeWithSlot({ id: 'practice/mass' }, { schedule: sunday })
    await emit({ type: 'SlotUpdated', slotKey: seeded, changes: { enabled: 0 } })
    // The one a template added and the user has been keeping.
    await createPracticeWithSlot({ id: 'mass' }, { schedule: sunday, time: '10:00' })
    await addSlot('mass', { time: '19:00' })
    await logCompletion('mass', '2026-05-10', '1', 'mass', 'checkin')
    await logCompletion('mass', '2026-05-12', '2', 'mass', 'amen')
    await logCompletion('mass', '2026-05-13', 'default', 'mass', 'checkin')

    await emit({ type: 'PracticeMerged', fromId: 'mass', toId: 'practice/mass' })
    await replayAll()

    const { practices, slots, completionsByPractice } = useEventStore.getState()
    expect([...practices.keys()]).toEqual(['practice/mass'])
    expect(slotKeys()).toEqual(['practice/mass::1', 'practice/mass::2', 'practice/mass::3'])
    expect(slots.get('practice/mass::1')?.enabled).toBe(0)
    expect(slots.get('practice/mass::2')).toMatchObject({ time: '10:00', enabled: 1 })
    expect(slots.get('practice/mass::3')).toMatchObject({ time: '19:00', enabled: 1 })
    expect(completions()).toEqual([
      '2026-05-10 practice/mass::2 checkin',
      '2026-05-12 practice/mass::3 amen',
      '2026-05-13 practice/mass::default checkin',
    ])
    expect(completionsByPractice.get('practice/mass')?.size).toBe(3)
    expect(completionsByPractice.has('mass')).toBe(false)
  })

  it('keeps the form the plan was praying and brings an archived twin back', async () => {
    await createPracticeWithSlot({ id: 'practice/mass', activeVariant: 'practice/mass' }, {})
    await emit({ type: 'PracticeArchived', practiceId: 'practice/mass' })
    await createPracticeWithSlot({ id: 'mass' }, {})
    await updatePractice('mass', { activeVariant: 'practice/mass-vetus-ordo' })

    await emit({ type: 'PracticeMerged', fromId: 'mass', toId: 'practice/mass' })

    expect(useEventStore.getState().practices.get('practice/mass')).toMatchObject({
      active_variant: 'practice/mass-vetus-ordo',
      archived: 0,
    })
  })

  it('renames a practice with no twin, and its program cursor with it', async () => {
    const slot = await createPracticeWithSlot({ id: 'novena-x' }, {})
    await emit({
      type: 'CursorSet',
      cursorId: 'program/novena-x',
      position: '{"day":4,"status":"active"}',
      startedAt: '2026-05-08',
    })
    await logCompletion('novena-x', '2026-05-12', '1', 'novena-x', 'amen')

    await emit({ type: 'PracticeMerged', fromId: 'novena-x', toId: 'practice/novena-x' })
    await replayAll()

    const { practices, cursors } = useEventStore.getState()
    expect(slot).toBe('novena-x::1')
    expect([...practices.keys()]).toEqual(['practice/novena-x'])
    expect(slotKeys()).toEqual(['practice/novena-x::1'])
    expect([...cursors.keys()]).toEqual(['program/practice/novena-x'])
    expect(cursors.get('program/practice/novena-x')?.position).toBe('{"day":4,"status":"active"}')
    expect(completions()).toEqual(['2026-05-12 practice/novena-x::1 amen'])
  })
})
