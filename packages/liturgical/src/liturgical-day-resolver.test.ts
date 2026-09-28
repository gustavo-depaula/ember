import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  type LiturgicalDayMap,
  type ResolvedDayEntry,
  resolveLiturgicalDay,
} from './liturgical-day-resolver'

const mapPath = resolve(
  __dirname,
  '../../..',
  'content/practices/meditacoes-ligorio/data/liturgical-map.json',
)
const map: LiturgicalDayMap = JSON.parse(readFileSync(mapPath, 'utf8'))

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

const byCategory = (entries: ResolvedDayEntry[], cat: ResolvedDayEntry['category']) =>
  entries.filter((e) => e.category === cat)
const ids = (entries: ResolvedDayEntry[]) => entries.map((e) => e.id)

describe('resolveLiturgicalDay', () => {
  describe('temporal resolution', () => {
    it('resolves 1st Sunday of Advent 2025', () => {
      const temporal = byCategory(resolveLiturgicalDay(d(2025, 11, 30), map), 'temporal')
      expect(temporal[0].id).toBe('temeridade-pecador-dia-juizo')
    })

    it('resolves Pentecost Sunday 2026 to the Pentecost meditation', () => {
      // 2026: Pentecost = May 24 (Easter+49), keyed easter/8/0.
      const temporal = byCategory(resolveLiturgicalDay(d(2026, 5, 24), map), 'temporal')
      expect(temporal[0].id).toBe('amor-deus-com-homens-missao-espirito-santo')
    })

    it('resolves Trinity Sunday 2026 to the Trinity meditation', () => {
      // Trinity Sunday opens the post-Pentecost season (Pentecost week itself is
      // easter/8), so the meditation here is the Trinity one, not the Pentecost one.
      const temporal = byCategory(resolveLiturgicalDay(d(2026, 5, 31), map), 'temporal')
      expect(temporal[0].id).toBe('festa-santissima-trindade')
    })
  })

  // On fixed-date-driven days (Dec 25–31, Jan 1–10) the temporal cycle has no
  // entry, so the fixed-date content IS the day's meditation (not a reserve).
  describe('fixed-date meditations (Christmas season)', () => {
    it('uses Christmas Day (Dec 25) Nativity as the day meditation', () => {
      const temporal = byCategory(resolveLiturgicalDay(d(2025, 12, 25), map), 'temporal')
      expect(temporal[0].id).toBe('natividade-nosso-senhor-jesus-cristo')
    })

    it('uses Dec 26 fixed-date entry with secondary as the day meditation', () => {
      const temporal = byCategory(resolveLiturgicalDay(d(2025, 12, 26), map), 'temporal')
      expect(ids(temporal)).toEqual(['festa-de-santo-estevao-protomartir', 'visita-gruta-belem'])
    })
  })

  // Regression: June 12–18 2026 fell through to reserves ("only additional
  // meditations"). The reserve pool is entirely santo-afonso-modelo-* (appendix)
  // meditations; a correct day never resolves to one here.
  describe('Sacred Heart octave week resolves to real meditations (no reserves)', () => {
    const isReserve = (id: string) => id.startsWith('santo-afonso-modelo-')

    const expected: Array<[number, string]> = [
      [12, 'festa-sagrado-coracao-jesus'], // Sacred Heart feast (Easter+68)
      [13, 'coracao-maria-imagem-fiel-coracao-jesus'],
      [14, 'ovelha-perdida-pastor-divino'], // 3rd Sunday after Pentecost
      [15, 'devemos-morrer'],
      [16, 'da-pureza-intencao'],
      [17, 'para-se-santificar-alma-deve-dar-se-toda-sem-reserva-deus'],
      [18, 'santa-comunhao-nos-faz-perseverar-graca-divina'],
    ]

    for (const [day, id] of expected) {
      it(`June ${day} 2026 → ${id}`, () => {
        const temporal = byCategory(resolveLiturgicalDay(d(2026, 6, day), map), 'temporal')
        expect(temporal[0].id).toBe(id)
        expect(isReserve(temporal[0].id)).toBe(false)
      })
    }
  })

  describe('feast day resolution', () => {
    it('returns both temporal and feast on feast days (Assumption)', () => {
      const result = resolveLiturgicalDay(d(2026, 8, 15), map)
      const temporal = byCategory(result, 'temporal')
      const feasts = byCategory(result, 'feast')
      expect(feasts[0].id).toBe('festa-da-assuncao-de-maria-santissima')
      expect(temporal.length).toBeGreaterThan(0)
      expect(temporal[0].id).not.toBe(feasts[0].id)
    })

    it('resolves All Saints (Nov 1) with secondary', () => {
      const feasts = byCategory(resolveLiturgicalDay(d(2026, 11, 1), map), 'feast')
      expect(ids(feasts)).toEqual(['festa-de-todos-os-santos-2', 'suspiros-pela-patria-celeste'])
    })

    it('returns no feast on non-feast days', () => {
      const result = resolveLiturgicalDay(d(2026, 1, 15), map)
      expect(byCategory(result, 'feast')).toHaveLength(0)
    })
  })

  describe('movable feasts', () => {
    it('resolves Sunday before June 24', () => {
      // 2026: June 24 is Wednesday, so Sunday before = June 21
      const feasts = byCategory(resolveLiturgicalDay(d(2026, 6, 21), map), 'feast')
      expect(feasts[0].id).toBe('festa-de-nossa-senhora-do-perpetuo-socorro')
    })

    it('resolves 3rd Sunday of July', () => {
      // 2026: July 1 is Wednesday, 3rd Sunday = July 19
      const feasts = byCategory(resolveLiturgicalDay(d(2026, 7, 19), map), 'feast')
      expect(feasts[0].id).toBe('solenidade-do-santissimo-redentor')
    })
  })

  describe('additional entry resolution', () => {
    it('keeps feast + fixed-date additions on March 25', () => {
      const result = resolveLiturgicalDay(d(2026, 3, 25), map)
      expect(byCategory(result, 'feast')[0].id).toBe('festa-anunciacao-maria-santissima')
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

  describe('novena resolution', () => {
    it('resolves Christmas Novena (Dec 16 = day 1)', () => {
      const temporal = byCategory(resolveLiturgicalDay(d(2025, 12, 16), map), 'temporal')
      expect(temporal[0].id).toBe(map.novenas['christmas/1'].primary)
    })

    it('resolves Holy Spirit Novena day 1', () => {
      // 2026: Ascension = May 14 (Thu), novena starts May 15 (Fri)
      const temporal = byCategory(resolveLiturgicalDay(d(2026, 5, 15), map), 'temporal')
      expect(temporal[0].id).toBe(map.novenas['holy-spirit/1'].primary)
    })

    it('resolves Holy Spirit Novena day 9', () => {
      const temporal = byCategory(resolveLiturgicalDay(d(2026, 5, 23), map), 'temporal')
      expect(temporal[0].id).toBe(map.novenas['holy-spirit/9'].primary)
    })

    it('resolves Sacred Heart Novena', () => {
      // 2026: Sacred Heart = June 12 (Easter+68), novena starts Easter+59 = June 3
      const temporal = byCategory(resolveLiturgicalDay(d(2026, 6, 3), map), 'temporal')
      expect(temporal[0].id).toBe(map.novenas['sacred-heart/1'].primary)
    })
  })
})
