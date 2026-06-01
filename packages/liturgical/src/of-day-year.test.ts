import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LiturgicalEntry } from './calendar-types'
import { resolveOfDay } from './of-day'

// Year-coverage for the GIRM precedence: walk representative 2026 days across
// every season and celebration type and assert the principal's kind + position
// on the Table of Liturgical Days. Easter 2026 = Apr 5.
const entries: LiturgicalEntry[] = JSON.parse(
  readFileSync(new URL('../../../content/liturgical/of-calendar.json', import.meta.url), 'utf-8'),
)
const day = (m: number, d: number) => resolveOfDay(new Date(2026, m - 1, d), entries)

describe('resolveOfDay — full-year GIRM coverage (2026)', () => {
  const temporal: Array<[string, number, number, number]> = [
    // [label, month, day, expected precedence]
    ['Advent I Sunday', 11, 29, 2],
    ['Christmas Day', 12, 25, 2],
    ['Christmas Octave feria (Dec 29)', 12, 29, 9],
    ['Mary, Mother of God (Jan 1)', 1, 1, 3],
    ['Baptism of the Lord (Sun)', 1, 11, 5],
    ['Ordinary feria (Thu)', 1, 15, 13],
    ['Ordinary Sunday', 1, 18, 6],
    ['Ash Wednesday', 2, 18, 2],
    ['Lent I Sunday', 2, 22, 2],
    ['Lenten feria (Fri)', 2, 20, 9],
    ['Palm Sunday', 3, 29, 2],
    ['Holy Thursday', 4, 2, 1],
    ['Good Friday', 4, 3, 1],
    ['Easter Sunday', 4, 5, 2],
    ['Easter Octave (Tue)', 4, 7, 2],
    ['Ascension', 5, 14, 2],
    ['Pentecost', 5, 24, 2],
    ['Trinity Sunday', 5, 31, 3],
    ['Corpus Christi', 6, 4, 3],
    ['Sacred Heart', 6, 12, 3],
    ['Christ the King', 11, 22, 3],
  ]
  for (const [label, m, d, prec] of temporal) {
    it(`${label} → temporal, precedence ${prec}`, () => {
      const r = day(m, d)
      expect(r.principal.kind).toBe('temporal')
      expect(r.principal.precedence).toBe(prec)
    })
  }

  it('Holy Thursday carries both Masses (chrism + Lord’s Supper)', () => {
    expect(day(4, 2).principal.formularyIds).toEqual([
      'tempore.holy-week.chrism-mass',
      'tempore.holy-week.lords-supper',
    ])
  })

  const sanctoral: Array<[string, number, number, string, number]> = [
    // [label, month, day, expected id, expected precedence]
    ['Assumption (solemnity)', 8, 15, 'sanctorale.08-15', 3],
    ['Transfiguration (Feast of the Lord)', 8, 6, 'sanctorale.08-06', 5],
    ['St Agnes (memorial)', 1, 21, 'sanctorale.01-21', 10],
    ['Mary, Mother of the Church (memorial)', 5, 25, 'sanctorale.movable.05-35', 10],
  ]
  for (const [label, m, d, id, prec] of sanctoral) {
    it(`${label} → sanctoral ${id}, precedence ${prec}`, () => {
      const r = day(m, d)
      expect(r.principal.kind).toBe('sanctoral')
      expect(r.principal.id).toBe(id)
      expect(r.principal.precedence).toBe(prec)
    })
  }
})
