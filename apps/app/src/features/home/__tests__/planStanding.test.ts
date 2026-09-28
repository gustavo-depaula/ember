import { describe, expect, it } from 'vitest'

import { entriesAround, planStanding } from '../planStanding'

const blocks = [
  {
    block: 'morning' as const,
    slots: [
      { id: 'offering', name: 'Morning Offering' },
      { id: 'lauds', name: 'Lauds' },
    ],
  },
  {
    block: 'daytime' as const,
    slots: [
      { id: 'angelus', name: 'Angelus' },
      { id: 'reading', name: 'Reading' },
    ],
  },
  { block: 'evening' as const, slots: [{ id: 'compline', name: 'Compline' }] },
  { block: 'flexible' as const, slots: [{ id: 'rosary', name: 'Rosary' }] },
]
const ids = (entries: { id: string }[]) => entries.map((e) => e.id)

describe('planStanding', () => {
  it('is due while the current part of the day is unfinished', () => {
    const day = planStanding(blocks, new Set(), 'morning')
    expect(day.standing).toBe('due')
    expect(day.entries.map((e) => e.status)).toEqual([
      'due',
      'due',
      'ahead',
      'ahead',
      'ahead',
      'ahead',
    ])
  })

  it('falls behind once an unprayed part of the day has passed', () => {
    const day = planStanding(blocks, new Set(['lauds']), 'daytime')
    expect(day.standing).toBe('late')
    expect(day.entries[0].status).toBe('late')
  })

  it('is on track with only later practices left', () => {
    const done = new Set(['offering', 'lauds'])
    expect(planStanding(blocks, done, 'morning').standing).toBe('ontrack')
  })

  it('makes any-time practices due in the evening', () => {
    const done = new Set(['offering', 'lauds', 'angelus', 'reading', 'compline'])
    const day = planStanding(blocks, done, 'evening')
    expect(day.standing).toBe('due')
    expect(planStanding(blocks, new Set([...done, 'rosary']), 'evening').standing).toBe('done')
  })
})

describe('entriesAround', () => {
  it('starts at the first unprayed practice of the current part of the day', () => {
    const day = planStanding(blocks, new Set(['angelus']), 'daytime')
    expect(ids(entriesAround(day.entries, 'daytime', 4))).toEqual([
      'angelus',
      'reading',
      'compline',
      'rosary',
    ])
  })

  it('tops up from earlier practices when the day runs short', () => {
    const day = planStanding(blocks, new Set(), 'evening')
    expect(ids(entriesAround(day.entries, 'evening', 4))).toEqual([
      'angelus',
      'reading',
      'compline',
      'rosary',
    ])
  })

  it('shows the last practices once everything is prayed', () => {
    const all = new Set(blocks.flatMap((b) => b.slots.map((s) => s.id)))
    const day = planStanding(blocks, all, 'morning')
    expect(ids(entriesAround(day.entries, 'morning', 4))).toEqual([
      'angelus',
      'reading',
      'compline',
      'rosary',
    ])
  })
})
