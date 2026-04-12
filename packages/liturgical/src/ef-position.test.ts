import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { getEfLiturgicalPosition, getPostPentecostWeekMapping } from './ef-position'
import { computeEaster, getFirstSundayOfAdvent } from './season'

// Helper: create date shorthand
const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

describe('getEfLiturgicalPosition', () => {
  // ── Advent ──

  describe('Advent', () => {
    it('returns 1st Sunday of Advent 2025', () => {
      // 2025: Advent starts Nov 30
      const pos = getEfLiturgicalPosition(d(2025, 11, 30))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/1/0')
    })

    it('returns Monday of 1st Advent week 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 1))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(1)
      expect(pos.key).toBe('advent/1/1')
    })

    it('returns 2nd Sunday of Advent 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 7))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/2/0')
    })

    it('returns Saturday of 3rd Advent week 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 20))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(6)
      expect(pos.key).toBe('advent/3/6')
    })

    it('returns 4th Sunday of Advent 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 21))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(4)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/4/0')
    })

    it('returns Wednesday of 4th Advent week 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 24))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(4)
      expect(pos.dayOfWeek).toBe(3)
      expect(pos.key).toBe('advent/4/3')
    })

    // 2024: Advent starts Dec 1
    it('returns 1st Sunday of Advent 2024', () => {
      const pos = getEfLiturgicalPosition(d(2024, 12, 1))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/1/0')
    })

    // 2026: Advent starts Nov 29
    it('returns 1st Sunday of Advent 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 11, 29))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/1/0')
    })
  })

  // ── Christmas ──

  describe('Christmas', () => {
    it('returns christmas for Dec 25', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 25))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('christmas')
      expect(pos.key).toBe('christmas/1/0')
    })

    it('returns fixed date for Dec 26', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 26))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/12-26')
    })

    it('returns fixed date for Dec 31', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 31))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/12-31')
    })

    it('returns fixed date for Jan 1 (Circumcision)', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 1))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('circumcision')
      expect(pos.key).toBe('fixed/01-01')
    })

    it('returns fixed date for Jan 6 (Epiphany)', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 6))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('epiphany')
      expect(pos.key).toBe('fixed/01-06')
    })

    it('returns fixed date for Jan 2-5', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 3))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/01-03')
    })

    it('returns fixed date for Jan 7-10', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 8))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/01-08')
    })
  })

  // ── Epiphany weeks ──

  describe('Epiphany weeks', () => {
    // 2026: Easter is April 5, Septuagesima is Feb 1
    // Epiphany week starts from first Sunday after Jan 6
    // Jan 6 2026 is Tuesday, so first Sunday after = Jan 11
    it('returns 1st Sunday after Epiphany 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 11))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('epiphany/1/0')
    })

    it('returns Monday of 1st Epiphany week 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 12))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(1)
      expect(pos.key).toBe('epiphany/1/1')
    })

    it('returns 2nd Sunday after Epiphany 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 18))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('epiphany/2/0')
    })

    it('returns Saturday of 2nd Epiphany week 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 24))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(6)
      expect(pos.key).toBe('epiphany/2/6')
    })

    // 2025: Easter is April 20, Septuagesima is Feb 16
    // Jan 6 2025 is Monday, first Sunday after = Jan 12
    it('returns multiple Epiphany weeks in 2025 (late Easter)', () => {
      // 3rd Sunday after Epiphany = Jan 26
      const pos = getEfLiturgicalPosition(d(2025, 1, 26))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('epiphany/3/0')
    })
  })

  // ── Septuagesima ──

  describe('Septuagesima', () => {
    // 2026: Easter April 5 → Septuagesima = Feb 1
    it('returns Septuagesima Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 1))
      expect(pos.season).toBe('septuagesima')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.specialDay).toBe('septuagesima')
      expect(pos.key).toBe('septuagesima/1/0')
    })

    // 2026: Sexagesima = Feb 8
    it('returns Sexagesima Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 8))
      expect(pos.season).toBe('septuagesima')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.specialDay).toBe('sexagesima')
      expect(pos.key).toBe('septuagesima/2/0')
    })

    // 2026: Quinquagesima = Feb 15
    it('returns Quinquagesima Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 15))
      expect(pos.season).toBe('septuagesima')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.specialDay).toBe('quinquagesima')
      expect(pos.key).toBe('septuagesima/3/0')
    })

    it('returns weekday of Septuagesima week', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 4)) // Wed of Septuagesima week
      expect(pos.season).toBe('septuagesima')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(3)
      expect(pos.key).toBe('septuagesima/1/3')
    })

    // 2025: Easter April 20 → Septuagesima = Feb 16
    it('returns Septuagesima Sunday 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 2, 16))
      expect(pos.season).toBe('septuagesima')
      expect(pos.specialDay).toBe('septuagesima')
    })
  })

  // ── Lent ──

  describe('Lent', () => {
    // 2026: Ash Wednesday = Feb 18
    // In the book, Ash Wed is within Quinquagesima week, not a separate Lent section
    it('returns Ash Wednesday 2026 as septuagesima', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 18))
      expect(pos.season).toBe('septuagesima')
      expect(pos.specialDay).toBe('ash-wednesday')
      expect(pos.key).toBe('septuagesima/3/3')
    })

    it('returns Thursday after Ash Wednesday 2026 as septuagesima', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 19))
      expect(pos.season).toBe('septuagesima')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(4)
      expect(pos.key).toBe('septuagesima/3/4')
    })

    it('returns 1st Sunday of Lent 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 2, 22))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('lent/1/0')
    })

    it('returns Wednesday of 3rd Lent week 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 11))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(3)
      expect(pos.key).toBe('lent/3/3')
    })

    it('returns 5th Sunday of Lent (Passion Sunday) 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 22))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(5)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('lent/5/0')
    })

    it('returns Saturday before Palm Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 28))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(5)
      expect(pos.dayOfWeek).toBe(6)
      expect(pos.key).toBe('lent/5/6')
    })

    // 2025: Ash Wednesday = March 5
    it('returns Ash Wednesday 2025 as septuagesima', () => {
      const pos = getEfLiturgicalPosition(d(2025, 3, 5))
      expect(pos.season).toBe('septuagesima')
      expect(pos.specialDay).toBe('ash-wednesday')
    })
  })

  // ── Holy Week ──

  describe('Holy Week', () => {
    // 2026: Easter = April 5, Palm Sunday = March 29
    it('returns Palm Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 29))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('palm-sunday')
      expect(pos.key).toBe('holy-week/1/0')
    })

    it('returns Monday of Holy Week 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 30))
      expect(pos.season).toBe('holy-week')
      expect(pos.dayOfWeek).toBe(1)
      expect(pos.key).toBe('holy-week/1/1')
    })

    it('returns Holy Thursday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 2))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('holy-thursday')
      expect(pos.key).toBe('holy-week/1/4')
    })

    it('returns Good Friday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 3))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('good-friday')
      expect(pos.key).toBe('holy-week/1/5')
    })

    it('returns Holy Saturday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 4))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('holy-saturday')
      expect(pos.key).toBe('holy-week/1/6')
    })
  })

  // ── Easter ──

  describe('Easter', () => {
    it('returns Easter Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 5))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('easter-sunday')
      expect(pos.key).toBe('easter/1/0')
    })

    it('returns Easter Monday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 6))
      expect(pos.season).toBe('easter')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(1)
      expect(pos.key).toBe('easter/1/1')
    })

    it('returns 2nd Sunday of Easter 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 4, 12))
      expect(pos.season).toBe('easter')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('easter/2/0')
    })

    // 2026: Ascension = May 14 (Easter+39)
    it('returns Ascension 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 5, 14))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('ascension')
    })

    // 2026: Pentecost = May 24 (Easter+49)
    it('returns Pentecost 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 5, 24))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('pentecost')
    })

    it('returns Saturday of Pentecost week (Easter+55) as easter season', () => {
      // 2026: Easter+55 = May 30
      const pos = getEfLiturgicalPosition(d(2026, 5, 30))
      expect(pos.season).toBe('easter')
    })

    // Easter 2025: April 20
    it('returns Easter Sunday 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 4, 20))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('easter-sunday')
    })
  })

  // ── Post-Pentecost ──

  describe('Post-Pentecost', () => {
    // 2026: Trinity Sunday = May 31 (Easter+56)
    it('returns Trinity Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 5, 31))
      expect(pos.season).toBe('post-pentecost')
      expect(pos.specialDay).toBe('trinity-sunday')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
    })

    // 2026: Corpus Christi = June 4 (Easter+60)
    it('returns Corpus Christi 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 6, 4))
      expect(pos.season).toBe('post-pentecost')
      expect(pos.specialDay).toBe('corpus-christi')
    })

    // 2026: Sacred Heart = June 12 (Easter+68)
    it('returns Sacred Heart 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 6, 12))
      expect(pos.season).toBe('post-pentecost')
      expect(pos.specialDay).toBe('sacred-heart')
    })

    it('returns 2nd Sunday after Pentecost 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 6, 7))
      expect(pos.season).toBe('post-pentecost')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
    })

    it('returns weekday of 5th Pentecost week 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 7, 1)) // Wed of 5th week
      expect(pos.season).toBe('post-pentecost')
      expect(pos.dayOfWeek).toBe(3)
    })

    it('returns late post-Pentecost week', () => {
      // A date in November before Advent
      const pos = getEfLiturgicalPosition(d(2026, 11, 25)) // Wed
      expect(pos.season).toBe('post-pentecost')
    })
  })

  // ── Season boundaries across multiple years ──

  describe('season boundaries', () => {
    const years = [2024, 2025, 2026, 2027, 2028]

    for (const year of years) {
      it(`covers every day of ${year} without errors`, () => {
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        let current = start
        while (current <= end) {
          const pos = getEfLiturgicalPosition(current)
          expect(pos.season).toBeTruthy()
          expect(pos.key).toBeTruthy()
          expect(pos.dayOfWeek).toBeGreaterThanOrEqual(0)
          expect(pos.dayOfWeek).toBeLessThanOrEqual(6)
          current = addDays(current, 1)
        }
      })
    }

    it('Ash Wednesday is always septuagesima with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const ashWed = addDays(easter, -46)
        const pos = getEfLiturgicalPosition(ashWed)
        expect(pos.season).toBe('septuagesima')
        expect(pos.specialDay).toBe('ash-wednesday')
      }
    })

    it('Palm Sunday is always holy-week with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const palmSunday = addDays(easter, -7)
        const pos = getEfLiturgicalPosition(palmSunday)
        expect(pos.season).toBe('holy-week')
        expect(pos.specialDay).toBe('palm-sunday')
      }
    })

    it('Easter Sunday is always easter with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const pos = getEfLiturgicalPosition(easter)
        expect(pos.season).toBe('easter')
        expect(pos.specialDay).toBe('easter-sunday')
      }
    })

    it('Pentecost is always easter season with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const pentecost = addDays(easter, 49)
        const pos = getEfLiturgicalPosition(pentecost)
        expect(pos.season).toBe('easter')
        expect(pos.specialDay).toBe('pentecost')
      }
    })

    it('Trinity Sunday is always post-pentecost with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const trinity = addDays(easter, 56)
        const pos = getEfLiturgicalPosition(trinity)
        expect(pos.season).toBe('post-pentecost')
        expect(pos.specialDay).toBe('trinity-sunday')
      }
    })

    it('Dec 25 is always christmas', () => {
      for (const year of years) {
        const pos = getEfLiturgicalPosition(d(year, 12, 25))
        expect(pos.season).toBe('christmas')
        expect(pos.specialDay).toBe('christmas')
      }
    })

    it('1st Sunday of Advent is always advent/1/0', () => {
      for (const year of years) {
        const adventStart = getFirstSundayOfAdvent(year)
        const pos = getEfLiturgicalPosition(adventStart)
        expect(pos.season).toBe('advent')
        expect(pos.key).toBe('advent/1/0')
      }
    })

    it('day before Advent is post-pentecost', () => {
      for (const year of years) {
        const adventStart = getFirstSundayOfAdvent(year)
        const dayBefore = addDays(adventStart, -1)
        const pos = getEfLiturgicalPosition(dayBefore)
        expect(pos.season).toBe('post-pentecost')
      }
    })
  })

  // ── Day-of-week correctness ──

  describe('day-of-week matches actual day', () => {
    it('reports correct dayOfWeek for arbitrary dates', () => {
      const dates = [
        d(2025, 3, 17), // Monday
        d(2025, 6, 4), // Wednesday
        d(2025, 9, 13), // Saturday
        d(2026, 1, 1), // Thursday
        d(2026, 8, 15), // Saturday
      ]
      for (const date of dates) {
        const pos = getEfLiturgicalPosition(date)
        expect(pos.dayOfWeek).toBe(date.getDay())
      }
    })
  })
})

describe('getPostPentecostWeekMapping', () => {
  it('returns valid mapping for 2025', () => {
    const mapping = getPostPentecostWeekMapping(2025)
    expect(mapping.size).toBeGreaterThan(0)

    // Last week should always be post-pentecost/25
    const maxWeek = Math.max(...mapping.keys())
    expect(mapping.get(maxWeek)).toBe('post-pentecost/25')
  })

  it('returns valid mapping for 2026', () => {
    const mapping = getPostPentecostWeekMapping(2026)
    expect(mapping.size).toBeGreaterThan(0)

    const maxWeek = Math.max(...mapping.keys())
    expect(mapping.get(maxWeek)).toBe('post-pentecost/25')
  })

  it('first week is always post-pentecost/1', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const mapping = getPostPentecostWeekMapping(year)
      expect(mapping.get(1)).toBe('post-pentecost/1')
    }
  })

  it('last week is always post-pentecost/25', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      expect(mapping.get(maxWeek)).toBe('post-pentecost/25')
    }
  })

  it('inserts epiphany-leftover weeks when more than 25 weeks', () => {
    // Find a year with >25 Pentecost Sundays
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      if (maxWeek > 25) {
        const values = [...mapping.values()]
        const hasLeftover = values.some((v) => v.startsWith('epiphany-leftover/'))
        expect(hasLeftover).toBe(true)
      }
    }
  })

  it('has no gaps in week numbers', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      for (let w = 1; w <= maxWeek; w++) {
        expect(mapping.has(w)).toBe(true)
      }
    }
  })
})
