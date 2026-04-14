import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import {
  type LiturgicalDayMap,
  type ResolvedDayEntry,
  resolveLiturgicalDay,
} from './liturgical-day-resolver'
import { getFirstSundayOfAdvent } from './season'

// Load the actual generated map
const mapPath = resolve(
  __dirname,
  '../../..',
  'content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/data/liturgical-map.json',
)
const map: LiturgicalDayMap = JSON.parse(readFileSync(mapPath, 'utf8'))

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

const byCategory = (entries: ResolvedDayEntry[], cat: ResolvedDayEntry['category']) =>
  entries.filter((e) => e.category === cat)
const ids = (entries: ResolvedDayEntry[]) => entries.map((e) => e.id)

describe('resolveLiturgicalDay', () => {
  // ── Temporal resolution ──

  describe('temporal resolution', () => {
    it('resolves 1st Sunday of Advent 2025', () => {
      // 2025: Advent starts Nov 30
      const result = resolveLiturgicalDay(d(2025, 11, 30), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).toBe('temeridade-pecador-dia-juizo')
    })

    it('resolves Monday of 1st Advent week 2025', () => {
      const result = resolveLiturgicalDay(d(2025, 12, 1), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).toBe('pecado-adao-amor-deus-homens')
    })

    it('resolves 1st Sunday of Lent 2026', () => {
      // 2026: Easter April 5 → 1st Sunday of Lent = Feb 22
      const result = resolveLiturgicalDay(d(2026, 2, 22), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).toBe('jesus-no-deserto-tentacoes-almas-escolhidas')
    })

    it('resolves Easter Sunday 2026', () => {
      const result = resolveLiturgicalDay(d(2026, 4, 5), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).toBe('ressurreicao-jesus-cristo-esperanca-cristao')
    })

    it('resolves 1st Sunday of Post-Pentecost (Trinity) 2026', () => {
      // 2026: Trinity = May 31
      const result = resolveLiturgicalDay(d(2026, 5, 31), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).toBe('amor-deus-com-homens-missao-espirito-santo')
    })
  })

  // ── Fixed date additive entries ──

  describe('fixed date additive entries', () => {
    it('adds Christmas Day (Dec 25) as an additional entry', () => {
      const result = resolveLiturgicalDay(d(2025, 12, 25), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining(['natividade-nosso-senhor-jesus-cristo']),
      )
    })

    it('adds Dec 26 fixed-date entry with secondary', () => {
      const result = resolveLiturgicalDay(d(2025, 12, 26), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
      const additional = byCategory(result, 'additional')
      expect(additional.length).toBeGreaterThanOrEqual(2)
      expect(additional[0].id).toBe('festa-de-santo-estevao-protomartir')
      expect(additional[1].id).toBe('visita-gruta-belem')
    })

    it('adds Jan 1 (Circumcision) as an additional entry', () => {
      const result = resolveLiturgicalDay(d(2026, 1, 1), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining(['circuncisao-jesus-sacramento-batismo']),
      )
    })

    it('adds Jan 6 (Epiphany) as an additional entry', () => {
      const result = resolveLiturgicalDay(d(2026, 1, 6), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining(['epifania-nosso-senhor-jesus-cristo']),
      )
    })
  })

  // ── Feast day resolution ──

  describe('feast day resolution', () => {
    it('resolves feast of St. Joseph (Mar 19)', () => {
      const result = resolveLiturgicalDay(d(2026, 3, 19), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('festa-sao-jose-esposo-virgem-maria')
    })

    it('resolves Assumption (Aug 15)', () => {
      const result = resolveLiturgicalDay(d(2026, 8, 15), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('festa-da-assuncao-de-maria-santissima')
    })

    it('resolves All Saints (Nov 1) with secondary', () => {
      const result = resolveLiturgicalDay(d(2026, 11, 1), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBe(2)
      expect(feasts[0].id).toBe('festa-de-todos-os-santos-2')
      expect(feasts[1].id).toBe('suspiros-pela-patria-celeste')
    })

    it('resolves Immaculate Conception (Dec 8)', () => {
      const result = resolveLiturgicalDay(d(2026, 12, 8), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('08-de-dezembro-festa-da-imaculada-conceicao-de-maria')
    })

    it('returns both temporal and feast on feast days', () => {
      // Aug 15 is a feast but also a regular Pentecost weekday
      const result = resolveLiturgicalDay(d(2026, 8, 15), map)
      const temporal = byCategory(result, 'temporal')
      const feasts = byCategory(result, 'feast')
      expect(temporal.length).toBeGreaterThan(0)
      expect(feasts.length).toBeGreaterThan(0)
      expect(temporal[0].id).not.toBe(feasts[0].id)
    })

    it('returns no feast on non-feast days', () => {
      // Jan 15 has no feast in the map
      const result = resolveLiturgicalDay(d(2026, 1, 15), map)
      expect(byCategory(result, 'feast')).toHaveLength(0)
    })
  })

  describe('additional entry resolution', () => {
    it('adds monthly 25th entry for April 25', () => {
      const result = resolveLiturgicalDay(d(2026, 4, 25), map)
      const additional = byCategory(result, 'additional')
      expect(additional.length).toBeGreaterThan(0)
      expect(additional[0].id).toBe('jesus-o-medico-das-nossas-almas')
    })

    it('keeps feast + fixed-date additions on March 25', () => {
      const result = resolveLiturgicalDay(d(2026, 3, 25), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('festa-anunciacao-maria-santissima')
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining([
          'festa-anunciacao-maria-santissima-2',
          'da-dignidade-sao-jose-esposo-virgem-maria-2',
        ]),
      )
    })

    it('adds weekdaysOfMonths first friday entry', () => {
      const result = resolveLiturgicalDay(d(2026, 1, 2), map)
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining(['devocao-ao-sagrado-coracao-seta-reservada']),
      )
    })

    it('adds weekdaysOfMonths fifth wednesday entry when month has five weekdays', () => {
      const result = resolveLiturgicalDay(d(2028, 3, 29), map)
      expect(ids(byCategory(result, 'additional'))).toEqual(
        expect.arrayContaining(['gloria-sao-jose-esposo-virgem-maria-2']),
      )
    })

    it('does not add fixed-date additions on dates without fixed entries', () => {
      const result = resolveLiturgicalDay(d(2026, 2, 14), map)
      expect(byCategory(result, 'additional')).toHaveLength(0)
    })

    it('keeps temporal + fixed-date additions even on calendar-hole dates', () => {
      const result = resolveLiturgicalDay(d(2026, 5, 25), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
      expect(byCategory(result, 'additional').length).toBeGreaterThan(0)
    })
  })

  // ── Novena resolution ──

  describe('novena resolution', () => {
    it('resolves Christmas Novena (Dec 16 = day 1)', () => {
      const result = resolveLiturgicalDay(d(2025, 12, 16), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('resolves Christmas Novena (Dec 20 = day 5)', () => {
      const result = resolveLiturgicalDay(d(2025, 12, 20), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('resolves Holy Spirit Novena day 1', () => {
      // 2026: Easter = April 5, Ascension = May 14 (Thu)
      // Novena starts May 15 (Fri)
      const result = resolveLiturgicalDay(d(2026, 5, 15), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      const novenaEntry = map.novenas['holy-spirit/1']
      expect(temporal[0].id).toBe(novenaEntry.primary)
    })

    it('resolves Holy Spirit Novena day 9', () => {
      // 2026: Novena starts May 15, day 9 = May 23
      const result = resolveLiturgicalDay(d(2026, 5, 23), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      const novenaEntry = map.novenas['holy-spirit/9']
      expect(temporal[0].id).toBe(novenaEntry.primary)
    })

    it('resolves Sacred Heart Novena', () => {
      // 2026: Easter = April 5, Sacred Heart = June 12 (Easter+68)
      // Novena starts Easter+59 = June 3
      const result = resolveLiturgicalDay(d(2026, 6, 3), map)
      const temporal = byCategory(result, 'temporal')
      expect(temporal.length).toBeGreaterThan(0)
      const novenaEntry = map.novenas['sacred-heart/1']
      expect(temporal[0].id).toBe(novenaEntry.primary)
    })
  })

  // ── Movable feasts ──

  describe('movable feasts', () => {
    it('resolves Sunday before June 24', () => {
      // 2026: June 24 is Wednesday, so Sunday before = June 21
      const result = resolveLiturgicalDay(d(2026, 6, 21), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('festa-de-nossa-senhora-do-perpetuo-socorro')
    })

    it('resolves 3rd Sunday of July', () => {
      // 2026: July 1 is Wednesday, 3rd Sunday = July 19
      const result = resolveLiturgicalDay(d(2026, 7, 19), map)
      const feasts = byCategory(result, 'feast')
      expect(feasts.length).toBeGreaterThan(0)
      expect(feasts[0].id).toBe('solenidade-do-santissimo-redentor')
    })
  })

  // ── Full year coverage ──

  describe('full year coverage', () => {
    const years = [2024, 2025, 2026, 2027, 2028]

    for (const year of years) {
      it(`resolves every day of ${year} with a temporal entry`, () => {
        let missing = 0
        const missingDates: string[] = []
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        let current = start

        while (current <= end) {
          const result = resolveLiturgicalDay(current, map)
          if (byCategory(result, 'temporal').length === 0) {
            missing++
            missingDates.push(current.toISOString().slice(0, 10))
          }
          current = addDays(current, 1)
        }

        if (missing > 0) {
          console.log(
            `  ${year}: ${missing} days without temporal entry:`,
            missingDates.slice(0, 10),
          )
        }
        // Allow some gaps — the book doesn't cover 100% of days
        // (e.g., Jan 11-13 transition, some short weeks)
        // But the vast majority should be covered
        expect(missing).toBeLessThan(30)
      })
    }
  })

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles Ash Wednesday correctly', () => {
      // 2026: Ash Wednesday = Feb 18
      // In the book, Ash Wednesday falls within Quinquagesima week (Wed of week 3)
      const result = resolveLiturgicalDay(d(2026, 2, 18), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('handles Palm Sunday correctly', () => {
      // 2026: Palm Sunday = March 29
      const result = resolveLiturgicalDay(d(2026, 3, 29), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('handles Good Friday correctly', () => {
      // 2026: Good Friday = April 3
      const result = resolveLiturgicalDay(d(2026, 4, 3), map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('handles last Sunday of the year (before Advent)', () => {
      // The last Sunday after Pentecost before Advent
      const adventStart = getFirstSundayOfAdvent(2026)
      const lastSunday = addDays(adventStart, -7)
      const result = resolveLiturgicalDay(lastSunday, map)
      expect(byCategory(result, 'temporal').length).toBeGreaterThan(0)
    })

    it('does not return feast when date has no feast', () => {
      const result = resolveLiturgicalDay(d(2026, 4, 15), map) // random Wednesday
      expect(byCategory(result, 'feast')).toHaveLength(0)
    })
  })
})
