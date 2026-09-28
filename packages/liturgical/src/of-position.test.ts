import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import {
  getLiturgicalYear,
  getOfLiturgicalPosition,
  getSundayCycle,
  getWeekdayCycle,
} from './of-position'

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

describe('cycle computation', () => {
  it('returns correct Sunday cycles', () => {
    expect(getSundayCycle(2026)).toBe('A')
    expect(getSundayCycle(2027)).toBe('B')
    expect(getSundayCycle(2028)).toBe('C')
  })

  it('returns correct weekday cycles', () => {
    expect(getWeekdayCycle(2025)).toBe('I')
    expect(getWeekdayCycle(2026)).toBe('II')
  })

  it('liturgical year transitions at Advent', () => {
    // Advent 2025 starts Nov 30 → belongs to liturgical year 2026
    expect(getLiturgicalYear(d(2025, 11, 30))).toBe(2026)
    expect(getLiturgicalYear(d(2025, 11, 29))).toBe(2025)
    expect(getLiturgicalYear(d(2026, 1, 15))).toBe(2026)
  })
})

describe('getOfLiturgicalPosition', () => {
  describe('Advent', () => {
    it('1st Sunday of Advent 2025', () => {
      const pos = getOfLiturgicalPosition(d(2025, 11, 30))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('advent/1/0')
    })

    it('Dec 16 still uses weekly cycle', () => {
      // 2025 Advent starts Nov 30. Dec 16 is Tuesday of 3rd week.
      const pos = getOfLiturgicalPosition(d(2025, 12, 16))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('advent/3/2')
    })

    it('Dec 17 gets fixed-date key', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 17))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('fixed/12-17')
    })
  })

  describe('Christmas', () => {
    it('Dec 25', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 25))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('christmas')
      expect(pos.key).toBe('fixed/12-25')
    })

    it('Dec 26-31 are fixed dates', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 28))
      expect(pos.season).toBe('christmas')
      expect(pos.key).toBe('fixed/12-28')
    })

    it('Jan 1 = Mary Mother of God', () => {
      const pos = getOfLiturgicalPosition(d(2026, 1, 1))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('mary-mother-of-god')
      expect(pos.key).toBe('fixed/01-01')
    })

    it('Jan 6 = Epiphany', () => {
      const pos = getOfLiturgicalPosition(d(2026, 1, 6))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('epiphany')
      expect(pos.key).toBe('fixed/01-06')
    })

    it('Baptism of the Lord', () => {
      // 2026: Jan 6 is Tuesday → Baptism = Jan 11 (Sunday)
      const pos = getOfLiturgicalPosition(d(2026, 1, 11))
      expect(pos.season).toBe('christmas')
      expect(pos.specialDay).toBe('baptism-of-the-lord')
      expect(pos.key).toBe('fixed/baptism')
    })
  })

  describe('Lent', () => {
    // 2026: Easter = April 5, Ash Wed = Feb 18
    it('Ash Wednesday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 18))
      expect(pos.season).toBe('lent')
      expect(pos.specialDay).toBe('ash-wednesday')
      expect(pos.key).toBe('lent/0/3')
    })

    it('Saturday after Ash Wednesday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 21))
      expect(pos.season).toBe('lent')
      expect(pos.key).toBe('lent/0/6')
    })

    it('1st Sunday of Lent', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 22))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(1)
      expect(pos.key).toBe('lent/1/0')
    })

    it('Saturday before Palm Sunday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 3, 28))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(5)
      expect(pos.key).toBe('lent/5/6')
    })
  })

  describe('Holy Week', () => {
    it.each([
      [d(2026, 3, 29), 'palm-sunday', 'holy-week/1/0'],
      [d(2026, 4, 2), 'holy-thursday', 'holy-week/1/4'],
      [d(2026, 4, 3), 'good-friday', 'holy-week/1/5'],
      [d(2026, 4, 4), 'holy-saturday', 'holy-week/1/6'],
    ])('%s is %s', (date, specialDay, key) => {
      const pos = getOfLiturgicalPosition(date)
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe(specialDay)
      expect(pos.key).toBe(key)
    })
  })

  describe('Easter', () => {
    it('Easter Sunday 2026', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 5))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('easter-sunday')
      expect(pos.key).toBe('easter/1/0')
    })

    it('Easter Monday (Octave)', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 6))
      expect(pos.season).toBe('easter')
      expect(pos.key).toBe('easter/1/1')
    })

    it('Saturday before Pentecost', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 23))
      expect(pos.season).toBe('easter')
      expect(pos.key).toBe('easter/7/6')
    })

    it('Pentecost 2026', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 24))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('pentecost')
      expect(pos.key).toBe('easter/8/0')
    })
  })

  describe('Ordinary Time I', () => {
    // 2026: Baptism = Jan 11, OT-I starts Jan 12
    it('Monday after Baptism = OT week 1', () => {
      const pos = getOfLiturgicalPosition(d(2026, 1, 12))
      expect(pos.season).toBe('ordinary')
      expect(pos.week).toBe(1)
      expect(pos.dayOfWeek).toBe(1)
      expect(pos.key).toBe('ordinary/1/1')
    })

    it('first Sunday after Baptism = 2nd Sunday of OT', () => {
      const pos = getOfLiturgicalPosition(d(2026, 1, 18))
      expect(pos.season).toBe('ordinary')
      expect(pos.week).toBe(2)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('ordinary/2/0')
    })

    it('Tuesday before Ash Wednesday = last day of OT-I', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 17))
      expect(pos.season).toBe('ordinary')
    })
  })

  describe('Ordinary Time II', () => {
    // 2026: Pentecost = May 24, Advent 1 = Nov 29
    it('Monday after Pentecost is in OT', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 25))
      expect(pos.season).toBe('ordinary')
      expect(pos.dayOfWeek).toBe(1)
    })

    it('Christ the King (last Sunday before Advent) = week 34', () => {
      const pos = getOfLiturgicalPosition(d(2026, 11, 22))
      expect(pos.season).toBe('ordinary')
      expect(pos.week).toBe(34)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('ordinary/34/0')
    })

    it('Saturday before Advent = last day of OT = week 34', () => {
      const pos = getOfLiturgicalPosition(d(2026, 11, 28))
      expect(pos.season).toBe('ordinary')
      expect(pos.week).toBe(34)
      expect(pos.key).toBe('ordinary/34/6')
    })

    it('Trinity Sunday is in OT with specialDay', () => {
      // 2026: Trinity = May 31 (Easter+56)
      const pos = getOfLiturgicalPosition(d(2026, 5, 31))
      expect(pos.season).toBe('ordinary')
      expect(pos.specialDay).toBe('trinity-sunday')
    })

    it('Corpus Christi is in OT with specialDay', () => {
      // 2026: Corpus Christi = June 4 (Easter+60)
      const pos = getOfLiturgicalPosition(d(2026, 6, 4))
      expect(pos.season).toBe('ordinary')
      expect(pos.specialDay).toBe('corpus-christi')
    })
  })

  it('OT week numbers stay within 1-34 across years', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const end = new Date(year, 11, 31)
      for (let current = new Date(year, 0, 1); current <= end; current = addDays(current, 1)) {
        const pos = getOfLiturgicalPosition(current)
        if (pos.season === 'ordinary') {
          expect(pos.week).toBeLessThanOrEqual(34)
          expect(pos.week).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })
})
