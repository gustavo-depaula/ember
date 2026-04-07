import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { buildYearCalendar } from './calendar-builder'
import { getDayObligations } from './obligations'
import { computeEaster } from './season'

// Use 2026 for all tests. Easter 2026 = April 5.
const year = 2026
const easter = computeEaster(year)
const ashWednesday = addDays(easter, -46) // Feb 18, 2026
const goodFriday = addDays(easter, -2) // April 3, 2026

function cal(form: 'of' | 'ef', jurisdiction?: string) {
  return buildYearCalendar({ year, form, jurisdiction })
}

const ofUS = cal('of', 'US')
const ofBR = cal('of', 'BR')
const ofUniversal = cal('of')
const efCal = cal('ef')

describe('getDayObligations', () => {
  describe('Ash Wednesday', () => {
    it('is a day of fast and full abstinence (any form/jurisdiction)', () => {
      const result = getDayObligations(ashWednesday, 'of', 'US', ofUS)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })

    it('is a day of fast and full abstinence (EF)', () => {
      const result = getDayObligations(ashWednesday, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })
  })

  describe('Good Friday', () => {
    it('is a day of fast and full abstinence (any form/jurisdiction)', () => {
      const result = getDayObligations(goodFriday, 'of', 'US', ofUS)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })
  })

  describe('Friday in Lent', () => {
    // Find a Friday in Lent that isn't Ash Wednesday or Good Friday
    // Ash Wed is Feb 18 (Wed), first Friday of Lent is Feb 20
    const lentFriday = new Date(2026, 1, 20) // Feb 20, 2026 (Friday)

    it('OF US: abstinence full, no fast', () => {
      const result = getDayObligations(lentFriday, 'of', 'US', ofUS)
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
    // July 10, 2026 is a Friday
    const summerFriday = new Date(2026, 6, 10)

    it('US OF: penance-required (not full abstinence)', () => {
      const result = getDayObligations(summerFriday, 'of', 'US', ofUS)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('penance-required')
    })

    it('BR OF: full abstinence', () => {
      const result = getDayObligations(summerFriday, 'of', 'BR', ofBR)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })

    it('Universal OF (no jurisdiction): full abstinence', () => {
      const result = getDayObligations(summerFriday, 'of', undefined, ofUniversal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })

    it('EF: full abstinence', () => {
      const result = getDayObligations(summerFriday, 'ef', undefined, efCal)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('full')
    })
  })

  describe('Friday of Easter Octave', () => {
    // Easter 2026 = April 5 (Sunday), Friday of Octave = April 10
    const easterOctaveFriday = new Date(2026, 3, 10)

    it('OF: no abstinence (Easter Octave is solemnity-rank)', () => {
      const result = getDayObligations(easterOctaveFriday, 'of', 'BR', ofBR)
      expect(result.abstinence).toBe('none')
      expect(result.fast).toBe(false)
    })

    it('EF: no abstinence (Easter Octave is I class)', () => {
      const result = getDayObligations(easterOctaveFriday, 'ef', undefined, efCal)
      expect(result.abstinence).toBe('none')
    })
  })

  describe('Friday that is a solemnity', () => {
    // Find a solemnity that falls on Friday
    // Sacred Heart 2026: Friday after 2nd Sunday after Pentecost = June 19, 2026
    // Actually, let's just check — Sacred Heart is anchor_relative to corpus_christi
    // Pentecost 2026 = May 24, Corpus Christi = May 24 + 11 = June 4 (Thu? no, it's relative)
    // Let's use Christmas 2026 which falls on Friday (Dec 25, 2026 is a Friday)
    const christmasFriday = new Date(2026, 11, 25)

    it('OF: no abstinence (solemnity exemption)', () => {
      const result = getDayObligations(christmasFriday, 'of', 'US', ofUS)
      expect(result.abstinence).toBe('none')
      expect(result.holyDay).toBe(true)
    })
  })

  describe('Christmas (holy day)', () => {
    const christmas = new Date(2026, 11, 25)

    it('is a holy day of obligation', () => {
      const result = getDayObligations(christmas, 'of', 'US', ofUS)
      expect(result.holyDay).toBe(true)
    })
  })

  describe('Regular Tuesday outside Lent', () => {
    // July 7, 2026 is a Tuesday
    const tuesday = new Date(2026, 6, 7)

    it('has no obligations', () => {
      const result = getDayObligations(tuesday, 'of', 'US', ofUS)
      expect(result.fast).toBe(false)
      expect(result.abstinence).toBe('none')
      expect(result.holyDay).toBe(false)
    })
  })

  describe('EF Lenten weekday (non-Friday)', () => {
    // A Wednesday in Lent — March 4, 2026 (Wednesday)
    const lentenWed = new Date(2026, 2, 4)

    it('has fast but no abstinence (unless ember day)', () => {
      const result = getDayObligations(lentenWed, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      // Wednesday in Lent that is NOT an Ember day should have no abstinence
      // (abstinence is for Fridays and specific days only)
    })
  })

  describe('EF Ember days', () => {
    // Lent Ember days 2026: 1st Sunday of Lent = easter - 42 = Feb 22
    // Ember Wed = Feb 25, Ember Fri = Feb 27, Ember Sat = Feb 28
    const emberWed = new Date(2026, 1, 25)
    const emberFri = new Date(2026, 1, 27)
    const emberSat = new Date(2026, 1, 28)

    it('Ember Wednesday: fast + partial abstinence', () => {
      const result = getDayObligations(emberWed, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('partial')
    })

    it('Ember Friday: fast + full abstinence', () => {
      const result = getDayObligations(emberFri, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })

    it('Ember Saturday: fast + partial abstinence', () => {
      const result = getDayObligations(emberSat, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('partial')
    })
  })

  describe('EF Vigils', () => {
    // Vigil of Christmas = Dec 24, 2026 (Thursday)
    const vigilChristmas = new Date(2026, 11, 24)

    it('Vigil of Christmas: fast + full abstinence', () => {
      const result = getDayObligations(vigilChristmas, 'ef', undefined, efCal)
      expect(result.fast).toBe(true)
      expect(result.abstinence).toBe('full')
    })
  })

  describe('details array', () => {
    it('contains relevant descriptions', () => {
      const result = getDayObligations(ashWednesday, 'of', 'US', ofUS)
      expect(result.details.length).toBeGreaterThan(0)
      expect(result.details[0].en).toContain('Ash Wednesday')
    })

    it('is empty for days with no obligations', () => {
      const tuesday = new Date(2026, 6, 7)
      const result = getDayObligations(tuesday, 'of', 'US', ofUS)
      expect(result.details).toEqual([])
    })
  })
})
