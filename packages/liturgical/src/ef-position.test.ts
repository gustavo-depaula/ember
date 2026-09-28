import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { getEfLiturgicalPosition, getPostPentecostWeekMapping } from './ef-position'
import { getFirstSundayOfAdvent } from './season'

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

describe('getEfLiturgicalPosition', () => {
  describe('Advent', () => {
    it('returns 1st Sunday of Advent 2025', () => {
      const pos = getEfLiturgicalPosition(d(2025, 11, 30))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('advent/1/0')
    })

    it('returns Wednesday of 4th Advent week 2025 (Dec 24)', () => {
      const pos = getEfLiturgicalPosition(d(2025, 12, 24))
      expect(pos.season).toBe('advent')
      expect(pos.week).toBe(4)
      expect(pos.dayOfWeek).toBe(3)
      expect(pos.key).toBe('advent/4/3')
    })
  })

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

    it('returns fixed date for Jan 7-10', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 8))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/01-08')
    })
  })

  describe('Epiphany weeks', () => {
    // Jan 6 2026 is Tuesday, so the first Sunday after = Jan 11.
    it('returns 1st Sunday after Epiphany 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 1, 11))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('epiphany/1/0')
    })

    // 2025: Easter April 20, Septuagesima Feb 16; first Sunday after Epiphany = Jan 12.
    it('returns multiple Epiphany weeks in 2025 (late Easter)', () => {
      const pos = getEfLiturgicalPosition(d(2025, 1, 26))
      expect(pos.season).toBe('epiphany')
      expect(pos.week).toBe(3)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('epiphany/3/0')
    })
  })

  describe('Septuagesima', () => {
    // 2026: Easter April 5 → Septuagesima Feb 1, Sexagesima Feb 8, Quinquagesima Feb 15.
    it.each([
      [d(2026, 2, 1), 'septuagesima', 'septuagesima/1/0'],
      [d(2026, 2, 8), 'sexagesima', 'septuagesima/2/0'],
      [d(2026, 2, 15), 'quinquagesima', 'septuagesima/3/0'],
    ])('%s is %s', (date, specialDay, key) => {
      const pos = getEfLiturgicalPosition(date)
      expect(pos.season).toBe('septuagesima')
      expect(pos.specialDay).toBe(specialDay)
      expect(pos.key).toBe(key)
    })
  })

  describe('Lent', () => {
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

    it('returns Saturday before Palm Sunday 2026', () => {
      const pos = getEfLiturgicalPosition(d(2026, 3, 28))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(5)
      expect(pos.dayOfWeek).toBe(6)
      expect(pos.key).toBe('lent/5/6')
    })
  })

  describe('Holy Week', () => {
    // 2026: Palm Sunday = March 29, Easter = April 5
    it.each([
      [d(2026, 3, 29), 'palm-sunday', 'holy-week/1/0'],
      [d(2026, 3, 30), undefined, 'holy-week/1/1'],
      [d(2026, 4, 2), 'holy-thursday', 'holy-week/1/4'],
      [d(2026, 4, 3), 'good-friday', 'holy-week/1/5'],
      [d(2026, 4, 4), 'holy-saturday', 'holy-week/1/6'],
    ])('%s is %s', (date, specialDay, key) => {
      const pos = getEfLiturgicalPosition(date)
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe(specialDay)
      expect(pos.key).toBe(key)
    })
  })

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
      const pos = getEfLiturgicalPosition(d(2026, 5, 30))
      expect(pos.season).toBe('easter')
    })
  })

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

    it('day before Advent is post-pentecost', () => {
      for (const year of [2024, 2025, 2026, 2027, 2028]) {
        const dayBefore = addDays(getFirstSundayOfAdvent(year), -1)
        expect(getEfLiturgicalPosition(dayBefore).season).toBe('post-pentecost')
      }
    })
  })
})

describe('getPostPentecostWeekMapping', () => {
  const years = [2024, 2025, 2026, 2027, 2028]

  it('first week is always post-pentecost/1', () => {
    for (const year of years) {
      expect(getPostPentecostWeekMapping(year).get(1)).toBe('post-pentecost/1')
    }
  })

  it('last week is always post-pentecost/25', () => {
    for (const year of years) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      expect(mapping.get(maxWeek)).toBe('post-pentecost/25')
    }
  })

  it('inserts epiphany-leftover weeks when more than 25 weeks', () => {
    for (const year of years) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      if (maxWeek > 25) {
        const values = [...mapping.values()]
        expect(values.some((v) => v.startsWith('epiphany-leftover/'))).toBe(true)
      }
    }
  })

  it('has no gaps in week numbers', () => {
    for (const year of years) {
      const mapping = getPostPentecostWeekMapping(year)
      const maxWeek = Math.max(...mapping.keys())
      for (let w = 1; w <= maxWeek; w++) {
        expect(mapping.has(w)).toBe(true)
      }
    }
  })
})
