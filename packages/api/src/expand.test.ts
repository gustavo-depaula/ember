import { describe, expect, it } from 'vitest'
import { expandService } from './expand'

const iso = (d: Date) => d.toISOString().slice(0, 10)

// A church in a fixed reference frame. We expand against an explicit `from` so tests are
// deterministic (no Date.now()).
const from = new Date(Date.UTC(2026, 5, 1)) // Mon 2026-06-01

describe('expandService', () => {
  it('expands a weekly Sunday rule to upcoming Sundays', () => {
    const out = expandService(
      { rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00', exdate: null, rdate: null },
      { from, count: 3 },
    )
    expect(out.map((o) => iso(o.date))).toEqual(['2026-06-07', '2026-06-14', '2026-06-21'])
    expect(out.every((o) => o.startTime === '09:00')).toBe(true)
    // anchored at UTC midnight so the day is unambiguous
    expect(out[0].date.getUTCHours()).toBe(0)
  })

  it('honors EXDATE — a cancelled Sunday is skipped', () => {
    const out = expandService(
      { rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00', exdate: '2026-06-14', rdate: null },
      { from, count: 3 },
    )
    expect(out.map((o) => iso(o.date))).toEqual(['2026-06-07', '2026-06-21', '2026-06-28'])
  })

  it('honors RDATE — a one-off date not in the rule is added in order', () => {
    const out = expandService(
      { rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00', exdate: null, rdate: '2026-06-10' },
      { from, count: 4 },
    )
    expect(out.map((o) => iso(o.date))).toEqual([
      '2026-06-07',
      '2026-06-10',
      '2026-06-14',
      '2026-06-21',
    ])
  })

  it('respects the count cap and never returns more than requested', () => {
    const out = expandService(
      { rrule: 'FREQ=DAILY', startTime: '07:30', exdate: null, rdate: null },
      { from, count: 5 },
    )
    expect(out).toHaveLength(5)
    expect(iso(out[0].date)).toBe('2026-06-01')
  })

  it('includes an occurrence falling on the `from` day (inclusive lower bound)', () => {
    // 2026-06-01 is a Monday
    const out = expandService(
      { rrule: 'FREQ=WEEKLY;BYDAY=MO', startTime: '12:00', exdate: null, rdate: null },
      { from, count: 1 },
    )
    expect(iso(out[0].date)).toBe('2026-06-01')
  })

  it('returns nothing when count is zero', () => {
    expect(
      expandService(
        { rrule: 'FREQ=DAILY', startTime: '07:30', exdate: null, rdate: null },
        { count: 0 },
      ),
    ).toEqual([])
  })
})
