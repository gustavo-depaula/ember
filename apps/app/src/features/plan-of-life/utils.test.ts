import { describe, expect, it } from 'vitest'

import type { SlotState } from '@/db/events'

import type { Schedule } from './schedule'
import { isSlotApplicableOnDate } from './utils'

function makeSlot(schedule: Schedule, id = 'p1::default'): SlotState {
  return {
    id,
    practice_id: 'p1',
    enabled: 1,
    sort_order: 0,
    tier: 'essential',
    time: null,
    time_block: 'morning',
    notify: null,
    schedule: JSON.stringify(schedule),
    variant: null,
  }
}

describe('isSlotApplicableOnDate / times-per visibility', () => {
  // 2026-04-26 = Sunday (start of period), 2026-05-02 = Saturday (end), 2026-05-03 = next Sunday.
  const sunday = '2026-04-26'
  const monday = '2026-04-27'
  const tuesday = '2026-04-28'
  const wednesday = '2026-04-29'
  const saturday = '2026-05-02'
  const nextSunday = '2026-05-03'

  it('once-a-week with no completions is visible every day in the period', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'week' })
    for (const date of [sunday, monday, tuesday, wednesday, saturday]) {
      expect(isSlotApplicableOnDate(slot, date, undefined, [])).toBe(true)
    }
  })

  it('once-a-week hides remaining days after a completion', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'week' })
    const completions = [monday]
    expect(isSlotApplicableOnDate(slot, monday, undefined, completions)).toBe(true)
    expect(isSlotApplicableOnDate(slot, tuesday, undefined, completions)).toBe(false)
    expect(isSlotApplicableOnDate(slot, saturday, undefined, completions)).toBe(false)
  })

  it('once-a-week becomes visible again next period', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'week' })
    expect(isSlotApplicableOnDate(slot, nextSunday, undefined, [monday])).toBe(true)
  })

  it('past day before completion in same week is hidden once quota is met', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'week' })
    expect(isSlotApplicableOnDate(slot, sunday, undefined, [monday])).toBe(false)
  })

  it('three-times-per-week stays visible until quota is met', () => {
    const slot = makeSlot({ type: 'times-per', count: 3, period: 'week' })
    expect(isSlotApplicableOnDate(slot, wednesday, undefined, [monday, tuesday])).toBe(true)
    expect(isSlotApplicableOnDate(slot, wednesday, undefined, [monday, tuesday, wednesday])).toBe(
      true,
    )
    expect(isSlotApplicableOnDate(slot, saturday, undefined, [monday, tuesday, wednesday])).toBe(
      false,
    )
  })

  it('once-a-month resets at month boundary', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'month' })
    const aprilDone = ['2026-04-10']
    expect(isSlotApplicableOnDate(slot, '2026-04-30', undefined, aprilDone)).toBe(false)
    expect(isSlotApplicableOnDate(slot, '2026-05-01', undefined, aprilDone)).toBe(true)
  })

  it('completions outside the period do not count toward quota', () => {
    const slot = makeSlot({ type: 'times-per', count: 1, period: 'week' })
    expect(isSlotApplicableOnDate(slot, monday, undefined, ['2026-04-15'])).toBe(true)
  })
})
