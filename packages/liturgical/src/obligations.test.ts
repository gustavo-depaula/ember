import { addDays, format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import type { DayCalendar, RankEF, RankOF, ResolvedCelebration } from './calendar-types'
import { getDayObligations } from './obligations'
import { computeEaster } from './season'

// Easter 2026 = April 5.
const easter = computeEaster(2026)
const ashWednesday = addDays(easter, -46) // Feb 18, 2026
const goodFriday = addDays(easter, -2) // April 3, 2026

// `getDayObligations` only reads `principal.entry.holyDayOfObligation` and
// `principal.rank` from the calendar (everything else is computed from the
// date), so a minimal fixture covers it. Christmas 2026 falls on a Friday,
// exercising the solemnity + holy-day exemptions.
function cal(
  form: 'of' | 'ef',
  days: Array<{ date: Date; rank: RankOF | RankEF; holyDay?: boolean }> = [],
): Map<string, DayCalendar> {
  const map = new Map<string, DayCalendar>()
  for (const { date, rank, holyDay } of days) {
    const principal: ResolvedCelebration = {
      entry: {
        id: 'x',
        name: {},
        category: 'other',
        description: {},
        holyDayOfObligation: holyDay,
      },
      date,
      rank,
      form,
    }
    map.set(format(date, 'yyyy-MM-dd'), { date, celebrations: [principal], principal })
  }
  return map
}

const christmas = new Date(2026, 11, 25)
const ofCal = cal('of', [{ date: christmas, rank: 'solemnity', holyDay: true }])
const efCal = cal('ef')

describe('getDayObligations', () => {
  it('Ash Wednesday is a day of fast and full abstinence', () => {
    const result = getDayObligations(ashWednesday, 'of', 'US', ofCal)
    expect(result.fast).toBe(true)
    expect(result.abstinence).toBe('full')
  })

  it('Good Friday is a day of fast and full abstinence', () => {
    const result = getDayObligations(goodFriday, 'of', 'US', ofCal)
    expect(result.fast).toBe(true)
    expect(result.abstinence).toBe('full')
  })

  describe('Friday in Lent', () => {
    const lentFriday = new Date(2026, 1, 20)

    it('OF US: abstinence full, no fast', () => {
      const result = getDayObligations(lentFriday, 'of', 'US', ofCal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })

    it('EF: fast (Lenten weekday) + full abstinence', () => {
      const result = getDayObligations(lentFriday, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })
  })

  describe('Friday outside Lent', () => {
    const summerFriday = new Date(2026, 6, 10)

    it('US OF: penance-required (not full abstinence)', () => {
      const result = getDayObligations(summerFriday, 'of', 'US', ofCal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('penance-required')
    })

    it('Universal OF (no jurisdiction): full abstinence', () => {
      const result = getDayObligations(summerFriday, 'of', undefined, ofCal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })

    it('EF: full abstinence', () => {
      const result = getDayObligations(summerFriday, 'ef', undefined, efCal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })
  })

  it('Friday of the Easter Octave carries no abstinence', () => {
    const result = getDayObligations(new Date(2026, 3, 10), 'of', 'BR', ofCal)
    expect(result.abstinence).toBe('none')
    expect(result.fast).toBe(false)
  })

  it('a solemnity on Friday (Christmas 2026) exempts from abstinence', () => {
    const result = getDayObligations(christmas, 'of', 'US', ofCal)
    expect(result.abstinence).toBe('none')
    expect(result.holyDay).toBe(true)
  })

  it('a regular Tuesday outside Lent has no obligations', () => {
    const result = getDayObligations(new Date(2026, 6, 7), 'of', 'US', ofCal)
    expect(result.fast).toBe(false)
    expect(result.abstinence).toBe('none')
    expect(result.holyDay).toBe(false)
    expect(result.details).toEqual([])
  })

  it('EF Lenten weekday (non-Friday) is a fast day', () => {
    const result = getDayObligations(new Date(2026, 2, 4), 'ef', undefined, efCal)
    expect(result.fast).toBe(true)
  })

  it('EF Ember Wednesday: fast + partial abstinence', () => {
    // 1st Sunday of Lent 2026 = Feb 22, so Ember Wednesday = Feb 25.
    const result = getDayObligations(new Date(2026, 1, 25), 'ef', undefined, efCal)
    expect(result.fast).toBe(true)
    expect(result.abstinence).toBe('partial')
  })

  it('EF September Ember days follow the third Sunday of September', () => {
    // 2026: the 1962 missal keeps them on 23, 25 and 26 September; the week of
    // the 16th is the older reckoning.
    const fastOn = (day: number) =>
      getDayObligations(new Date(2026, 8, day), 'ef', undefined, efCal).fast
    expect([16, 18, 19].map(fastOn)).toEqual([false, false, false])
    expect([23, 25, 26].map(fastOn)).toEqual([true, true, true])
  })

  it('EF Advent Ember days stay in one week when 13 December falls midweek', () => {
    const fastOn = (day: number) =>
      getDayObligations(new Date(2028, 11, day), 'ef', undefined, efCal).fast
    expect([15, 16].map(fastOn)).toEqual([false, false])
    expect([20, 22, 23].map(fastOn)).toEqual([true, true, true])
  })

  it('EF Vigil of Christmas: fast + full abstinence', () => {
    const result = getDayObligations(new Date(2026, 11, 24), 'ef', undefined, efCal)
    expect(result.fast).toBe(true)
    expect(result.abstinence).toBe('full')
  })
})
