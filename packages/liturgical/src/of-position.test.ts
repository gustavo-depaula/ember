import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import {
  getLiturgicalYear,
  getOfLiturgicalPosition,
  getSundayCycle,
  getWeekdayCycle,
} from './of-position'
import { computeEaster, getFirstSundayOfAdvent } from './season'

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

describe('cycle computation', () => {
  it('returns correct Sunday cycles', () => {
    expect(getSundayCycle(2023)).toBe('A')
    expect(getSundayCycle(2024)).toBe('B')
    expect(getSundayCycle(2025)).toBe('C')
    expect(getSundayCycle(2026)).toBe('A')
    expect(getSundayCycle(2027)).toBe('B')
    expect(getSundayCycle(2028)).toBe('C')
  })

  it('returns correct weekday cycles', () => {
    expect(getWeekdayCycle(2023)).toBe('I')
    expect(getWeekdayCycle(2024)).toBe('II')
    expect(getWeekdayCycle(2025)).toBe('I')
    expect(getWeekdayCycle(2026)).toBe('II')
  })

  it('liturgical year transitions at Advent', () => {
    // Advent 2025 starts Nov 30 → belongs to liturgical year 2026
    expect(getLiturgicalYear(d(2025, 11, 30))).toBe(2026)
    expect(getLiturgicalYear(d(2025, 11, 29))).toBe(2025)
    // Jan 2026 is still liturgical year 2026
    expect(getLiturgicalYear(d(2026, 1, 15))).toBe(2026)
  })
})

describe('getOfLiturgicalPosition', () => {
  // ── Advent ──

  describe('Advent', () => {
    it('1st Sunday of Advent 2025', () => {
      const pos = getOfLiturgicalPosition(d(2025, 11, 30))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('advent/1/0')
    })

    it('Monday of 1st Advent week', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 1))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('advent/1/1')
    })

    it('Dec 17 gets fixed-date key', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 17))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('fixed/12-17')
    })

    it('Dec 24 gets fixed-date key', () => {
      const pos = getOfLiturgicalPosition(d(2025, 12, 24))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('fixed/12-24')
    })

    it('Dec 16 still uses weekly cycle', () => {
      // 2025 Advent starts Nov 30. Dec 16 is Tuesday of 3rd week.
      const pos = getOfLiturgicalPosition(d(2025, 12, 16))
      expect(pos.season).toBe('advent')
      expect(pos.key).toBe('advent/3/2')
    })
  })

  // ── Christmas ──

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

  // ── Lent ──

  describe('Lent', () => {
    // 2026: Easter = April 5, Ash Wed = Feb 18
    it('Ash Wednesday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 18))
      expect(pos.season).toBe('lent')
      expect(pos.specialDay).toBe('ash-wednesday')
      expect(pos.key).toBe('lent/0/3')
    })

    it('Thursday after Ash Wednesday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 2, 19))
      expect(pos.season).toBe('lent')
      expect(pos.key).toBe('lent/0/4')
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

    it('Wednesday of 3rd week of Lent', () => {
      const pos = getOfLiturgicalPosition(d(2026, 3, 11))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(3)
      expect(pos.key).toBe('lent/3/3')
    })

    it('Saturday before Palm Sunday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 3, 28))
      expect(pos.season).toBe('lent')
      expect(pos.week).toBe(5)
      expect(pos.key).toBe('lent/5/6')
    })
  })

  // ── Holy Week ──

  describe('Holy Week', () => {
    it('Palm Sunday 2026', () => {
      const pos = getOfLiturgicalPosition(d(2026, 3, 29))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('palm-sunday')
      expect(pos.key).toBe('holy-week/1/0')
    })

    it('Holy Thursday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 2))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('holy-thursday')
      expect(pos.key).toBe('holy-week/1/4')
    })

    it('Good Friday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 3))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('good-friday')
      expect(pos.key).toBe('holy-week/1/5')
    })

    it('Holy Saturday', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 4))
      expect(pos.season).toBe('holy-week')
      expect(pos.specialDay).toBe('holy-saturday')
      expect(pos.key).toBe('holy-week/1/6')
    })
  })

  // ── Easter ──

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

    it('2nd Sunday of Easter', () => {
      const pos = getOfLiturgicalPosition(d(2026, 4, 12))
      expect(pos.season).toBe('easter')
      expect(pos.key).toBe('easter/2/0')
    })

    it('Pentecost 2026', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 24))
      expect(pos.season).toBe('easter')
      expect(pos.specialDay).toBe('pentecost')
      expect(pos.key).toBe('easter/8/0')
    })

    it('Saturday before Pentecost', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 23))
      expect(pos.season).toBe('easter')
      expect(pos.key).toBe('easter/7/6')
    })
  })

  // ── Ordinary Time I ──

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

  // ── Ordinary Time II (backward counting) ──

  describe('Ordinary Time II', () => {
    // 2026: Pentecost = May 24, Advent 1 = Nov 29

    it('Monday after Pentecost is in OT', () => {
      const pos = getOfLiturgicalPosition(d(2026, 5, 25))
      expect(pos.season).toBe('ordinary')
      expect(pos.dayOfWeek).toBe(1)
    })

    it('Christ the King (last Sunday before Advent) = week 34', () => {
      // 2026: Advent 1 = Nov 29, so Christ the King = Nov 22
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

    it('33rd Sunday of OT 2026', () => {
      const pos = getOfLiturgicalPosition(d(2026, 11, 15))
      expect(pos.season).toBe('ordinary')
      expect(pos.week).toBe(33)
      expect(pos.dayOfWeek).toBe(0)
      expect(pos.key).toBe('ordinary/33/0')
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

  // ── Season boundaries across multiple years ──

  describe('season boundaries', () => {
    const years = [2024, 2025, 2026, 2027, 2028]

    for (const year of years) {
      it(`covers every day of ${year} without errors`, () => {
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        let current = start
        while (current <= end) {
          const pos = getOfLiturgicalPosition(current)
          expect(pos.season).toBeTruthy()
          expect(pos.key).toBeTruthy()
          expect(pos.dayOfWeek).toBeGreaterThanOrEqual(0)
          expect(pos.dayOfWeek).toBeLessThanOrEqual(6)
          current = addDays(current, 1)
        }
      })
    }

    it('Ash Wednesday is always lent/0 with specialDay', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const ashWed = addDays(easter, -46)
        const pos = getOfLiturgicalPosition(ashWed)
        expect(pos.season).toBe('lent')
        expect(pos.specialDay).toBe('ash-wednesday')
        expect(pos.key).toBe('lent/0/3')
      }
    })

    it('Easter Sunday is always easter/1/0', () => {
      for (const year of years) {
        const easter = computeEaster(year)
        const pos = getOfLiturgicalPosition(easter)
        expect(pos.season).toBe('easter')
        expect(pos.specialDay).toBe('easter-sunday')
        expect(pos.key).toBe('easter/1/0')
      }
    })

    it('Pentecost is always easter/8/0', () => {
      for (const year of years) {
        const pentecost = addDays(computeEaster(year), 49)
        const pos = getOfLiturgicalPosition(pentecost)
        expect(pos.season).toBe('easter')
        expect(pos.specialDay).toBe('pentecost')
        expect(pos.key).toBe('easter/8/0')
      }
    })

    it('Christ the King is always ordinary/34/0', () => {
      for (const year of years) {
        const christTheKing = addDays(getFirstSundayOfAdvent(year), -7)
        const pos = getOfLiturgicalPosition(christTheKing)
        expect(pos.season).toBe('ordinary')
        expect(pos.week).toBe(34)
        expect(pos.key).toBe('ordinary/34/0')
      }
    })

    it('1st Sunday of Advent is always advent/1/0', () => {
      for (const year of years) {
        const adventStart = getFirstSundayOfAdvent(year)
        const pos = getOfLiturgicalPosition(adventStart)
        expect(pos.season).toBe('advent')
        expect(pos.key).toBe('advent/1/0')
      }
    })

    it('OT week numbers never exceed 34', () => {
      for (const year of years) {
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        let current = start
        while (current <= end) {
          const pos = getOfLiturgicalPosition(current)
          if (pos.season === 'ordinary') {
            expect(pos.week).toBeLessThanOrEqual(34)
            expect(pos.week).toBeGreaterThanOrEqual(1)
          }
          current = addDays(current, 1)
        }
      }
    })
  })
})
