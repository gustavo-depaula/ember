import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { type LiturgicalMeditationMap, resolveLiturgicalMeditation } from './meditation-resolver'
import { computeEaster, getFirstSundayOfAdvent } from './season'

// Load the actual generated map
const mapPath = resolve(
  __dirname,
  '../../..',
  'content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/data/liturgical-map.json',
)
const map: LiturgicalMeditationMap = JSON.parse(readFileSync(mapPath, 'utf8'))

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

describe('resolveLiturgicalMeditation', () => {
  // ── Temporal resolution ──

  describe('temporal resolution', () => {
    it('resolves 1st Sunday of Advent 2025', () => {
      // 2025: Advent starts Nov 30
      const result = resolveLiturgicalMeditation(d(2025, 11, 30), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('temeridade-pecador-dia-juizo')
      expect(result.source).toBe('temporal')
    })

    it('resolves Monday of 1st Advent week 2025', () => {
      const result = resolveLiturgicalMeditation(d(2025, 12, 1), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('pecado-adao-amor-deus-homens')
    })

    it('resolves 1st Sunday of Lent 2026', () => {
      // 2026: Easter April 5 → 1st Sunday of Lent = Feb 22
      const result = resolveLiturgicalMeditation(d(2026, 2, 22), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('jesus-no-deserto-tentacoes-almas-escolhidas')
    })

    it('resolves Easter Sunday 2026', () => {
      const result = resolveLiturgicalMeditation(d(2026, 4, 5), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('ressurreicao-jesus-cristo-esperanca-cristao')
    })

    it('resolves 1st Sunday of Post-Pentecost (Trinity) 2026', () => {
      // 2026: Trinity = May 31
      const result = resolveLiturgicalMeditation(d(2026, 5, 31), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('amor-deus-com-homens-missao-espirito-santo')
    })
  })

  // ── Fixed date resolution ──

  describe('fixed date resolution', () => {
    it('resolves Christmas Day (Dec 25)', () => {
      const result = resolveLiturgicalMeditation(d(2025, 12, 25), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('natividade-nosso-senhor-jesus-cristo')
      expect(result.source).toBe('fixed-date')
    })

    it('resolves Dec 26 with secondary meditation', () => {
      const result = resolveLiturgicalMeditation(d(2025, 12, 26), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('festa-de-santo-estevao-protomartir')
      expect(result.temporal!.secondary).toBe('visita-gruta-belem')
    })

    it('resolves Jan 1 (Circumcision)', () => {
      const result = resolveLiturgicalMeditation(d(2026, 1, 1), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('circuncisao-jesus-sacramento-batismo')
      expect(result.source).toBe('fixed-date')
    })

    it('resolves Jan 6 (Epiphany)', () => {
      const result = resolveLiturgicalMeditation(d(2026, 1, 6), map)
      expect(result.temporal).toBeDefined()
      expect(result.temporal!.chapterId).toBe('epifania-nosso-senhor-jesus-cristo')
    })
  })

  // ── Feast day resolution ──

  describe('feast day resolution', () => {
    it('resolves feast of St. Joseph (Mar 19)', () => {
      const result = resolveLiturgicalMeditation(d(2026, 3, 19), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('festa-sao-jose-esposo-virgem-maria')
    })

    it('resolves Assumption (Aug 15)', () => {
      const result = resolveLiturgicalMeditation(d(2026, 8, 15), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('festa-da-assuncao-de-maria-santissima')
    })

    it('resolves All Saints (Nov 1) with secondary', () => {
      const result = resolveLiturgicalMeditation(d(2026, 11, 1), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('festa-de-todos-os-santos-2')
      expect(result.feast!.secondary).toBe('suspiros-pela-patria-celeste')
    })

    it('resolves Immaculate Conception (Dec 8)', () => {
      const result = resolveLiturgicalMeditation(d(2026, 12, 8), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('08-de-dezembro-festa-da-imaculada-conceicao-de-maria')
    })

    it('returns both temporal and feast on feast days', () => {
      // Aug 15 is a feast but also a regular Pentecost weekday
      const result = resolveLiturgicalMeditation(d(2026, 8, 15), map)
      expect(result.temporal).toBeDefined()
      expect(result.feast).toBeDefined()
      expect(result.temporal!.chapterId).not.toBe(result.feast!.chapterId)
    })

    it('returns no feast on non-feast days', () => {
      // Jan 15 has no feast in the map
      const result = resolveLiturgicalMeditation(d(2026, 1, 15), map)
      expect(result.feast).toBeUndefined()
    })
  })

  // ── Novena resolution ──

  describe('novena resolution', () => {
    it('resolves Christmas Novena (Dec 16 = day 1)', () => {
      const result = resolveLiturgicalMeditation(d(2025, 12, 16), map)
      expect(result.temporal).toBeDefined()
      expect(result.source).toBe('fixed-date') // Dec 16 is both a fixed date and novena day
    })

    it('resolves Christmas Novena (Dec 20 = day 5)', () => {
      const result = resolveLiturgicalMeditation(d(2025, 12, 20), map)
      expect(result.temporal).toBeDefined()
      expect(result.source).toBe('fixed-date')
    })

    it('resolves Holy Spirit Novena day 1', () => {
      // 2026: Easter = April 5, Ascension = May 14 (Thu)
      // Novena starts May 15 (Fri)
      const result = resolveLiturgicalMeditation(d(2026, 5, 15), map)
      expect(result.temporal).toBeDefined()
      expect(result.source).toBe('novena')
      const novenaEntry = map.novenas['holy-spirit/1']
      expect(result.temporal!.chapterId).toBe(novenaEntry.primary)
    })

    it('resolves Holy Spirit Novena day 9', () => {
      // 2026: Novena starts May 15, day 9 = May 23
      const result = resolveLiturgicalMeditation(d(2026, 5, 23), map)
      expect(result.temporal).toBeDefined()
      expect(result.source).toBe('novena')
      const novenaEntry = map.novenas['holy-spirit/9']
      expect(result.temporal!.chapterId).toBe(novenaEntry.primary)
    })

    it('resolves Sacred Heart Novena', () => {
      // 2026: Easter = April 5, Sacred Heart = June 12 (Easter+68)
      // Novena starts Easter+59 = June 3
      const result = resolveLiturgicalMeditation(d(2026, 6, 3), map)
      expect(result.temporal).toBeDefined()
      expect(result.source).toBe('novena')
      const novenaEntry = map.novenas['sacred-heart/1']
      expect(result.temporal!.chapterId).toBe(novenaEntry.primary)
    })
  })

  // ── Movable feasts ──

  describe('movable feasts', () => {
    it('resolves Sunday before June 24', () => {
      // 2026: June 24 is Wednesday, so Sunday before = June 21
      const result = resolveLiturgicalMeditation(d(2026, 6, 21), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('festa-de-nossa-senhora-do-perpetuo-socorro')
    })

    it('resolves 3rd Sunday of July', () => {
      // 2026: July 1 is Wednesday, 3rd Sunday = July 19
      const result = resolveLiturgicalMeditation(d(2026, 7, 19), map)
      expect(result.feast).toBeDefined()
      expect(result.feast!.chapterId).toBe('solenidade-do-santissimo-redentor')
    })
  })

  // ── Full year coverage ──

  describe('full year coverage', () => {
    const years = [2024, 2025, 2026, 2027, 2028]

    for (const year of years) {
      it(`resolves every day of ${year} with a temporal meditation`, () => {
        let missing = 0
        const missingDates: string[] = []
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        let current = start

        while (current <= end) {
          const result = resolveLiturgicalMeditation(current, map)
          if (!result.temporal) {
            missing++
            missingDates.push(current.toISOString().slice(0, 10))
          }
          current = addDays(current, 1)
        }

        if (missing > 0) {
          console.log(
            `  ${year}: ${missing} days without temporal meditation:`,
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
      const result = resolveLiturgicalMeditation(d(2026, 2, 18), map)
      expect(result.temporal).toBeDefined()
      // Should resolve via septuagesima/3/3 key
    })

    it('handles Palm Sunday correctly', () => {
      // 2026: Palm Sunday = March 29
      const result = resolveLiturgicalMeditation(d(2026, 3, 29), map)
      expect(result.temporal).toBeDefined()
    })

    it('handles Good Friday correctly', () => {
      // 2026: Good Friday = April 3
      const result = resolveLiturgicalMeditation(d(2026, 4, 3), map)
      expect(result.temporal).toBeDefined()
    })

    it('handles last Sunday of the year (before Advent)', () => {
      // The last Sunday after Pentecost before Advent
      const adventStart = getFirstSundayOfAdvent(2026)
      const lastSunday = addDays(adventStart, -7)
      const result = resolveLiturgicalMeditation(lastSunday, map)
      expect(result.temporal).toBeDefined()
    })

    it('does not return feast when date has no feast', () => {
      const result = resolveLiturgicalMeditation(d(2026, 4, 15), map) // random Wednesday
      expect(result.feast).toBeUndefined()
    })
  })
})
