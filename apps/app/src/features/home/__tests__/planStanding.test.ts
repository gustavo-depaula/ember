import { describe, expect, it } from 'vitest'

import { dayMinutes } from '@/features/plan-of-life/timeBlocks'
import { entriesAround, owedAt, planStanding } from '../planStanding'

const plan = [
  { block: 'morning' as const, slots: [['offering', '06:00'], ['lauds']] },
  { block: 'daytime' as const, slots: [['angelus', '12:00'], ['reading']] },
  {
    block: 'evening' as const,
    slots: [
      ['examen', '22:00'],
      ['compline', '00:30'],
    ],
  },
]
const blocks = plan.map(({ block, slots }) => ({
  block,
  slots: slots.map(([id, time]) => ({ id, name: id, owed: owedAt(block, time) })),
}))
const ids = (entries: { id: string }[]) => entries.map((e) => e.id)
const at = dayMinutes
const morningDone = new Set(['offering', 'lauds'])

describe('planStanding', () => {
  it('stays on track while a practice is within an hour of its time', () => {
    const day = planStanding(blocks, new Set(), at('06:59'))
    expect(day.standing).toBe('ontrack')
    expect(day.entries.every((e) => e.status === 'pending')).toBe(true)
  })

  it('is delayed an hour past a practice’s time', () => {
    const day = planStanding(blocks, new Set(), at('07:00'))
    expect(day.standing).toBe('delayed')
    expect(day.entries[0].status).toBe('late')
  })

  it('is at risk three hours past a practice’s time', () => {
    expect(planStanding(blocks, new Set(), at('08:59')).standing).toBe('delayed')
    expect(planStanding(blocks, new Set(), at('09:00')).standing).toBe('atrisk')
  })

  it('owes an untimed practice by the end of its part of the day', () => {
    const done = new Set(['offering', 'angelus'])
    expect(planStanding(blocks, done, at('12:59')).standing).toBe('ontrack')
    expect(planStanding(blocks, done, at('13:00')).standing).toBe('delayed')
  })

  it('is on track in the evening with the day prayed up to now', () => {
    const done = new Set([...morningDone, 'angelus', 'reading'])
    expect(planStanding(blocks, done, at('21:30')).standing).toBe('ontrack')
    expect(planStanding(blocks, done, at('22:30')).standing).toBe('ontrack')
  })

  it('owes a practice after midnight at the tail of the same day', () => {
    const done = new Set([...morningDone, 'angelus', 'reading', 'examen'])
    expect(planStanding(blocks, done, at('23:00')).standing).toBe('ontrack')
    expect(planStanding(blocks, done, at('01:30')).standing).toBe('delayed')
    expect(planStanding(blocks, new Set([...done, 'compline']), at('01:30')).standing).toBe('done')
  })
})

describe('entriesAround', () => {
  it('starts at the first unprayed practice of the current part of the day', () => {
    const day = planStanding(blocks, new Set(['offering']), at('12:30'))
    expect(ids(entriesAround(day.entries, 'daytime', 3))).toEqual(['angelus', 'reading', 'examen'])
  })

  it('tops up from earlier practices when the day runs short', () => {
    const day = planStanding(blocks, new Set(), at('21:00'))
    expect(ids(entriesAround(day.entries, 'evening', 3))).toEqual(['reading', 'examen', 'compline'])
  })

  it('shows the last practices once everything is prayed', () => {
    const all = new Set(blocks.flatMap((b) => b.slots.map((s) => s.id)))
    const day = planStanding(blocks, all, at('08:00'))
    expect(ids(entriesAround(day.entries, 'morning', 3))).toEqual(['reading', 'examen', 'compline'])
  })
})
