import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { computeEaster } from '@ember/liturgical'
import type { OfCalendarStatics, SanctoralEntry, TemporalEntry } from '@ember/missal-schema'
import { addDays, format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { resolveOfDay } from './resolve'
import { buildOfYearCalendar } from './year'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const load = <T>(p: string): T =>
  JSON.parse(readFileSync(`${root}content/of/calendar/${p}`, 'utf-8'))
const statics: OfCalendarStatics = {
  temporal: load<TemporalEntry[]>('temporal.json'),
  sanctoral: load<SanctoralEntry[]>('sanctoral.json'),
}

const key = (d: Date) => format(d, 'yyyy-MM-dd')

describe('buildOfYearCalendar', () => {
  const calendar = buildOfYearCalendar({ year: 2026, statics, scope: 'universal' })

  it('surfaces the Sacred Heart on Easter+68 (the bug the display used to miss)', () => {
    const sacredHeart = addDays(computeEaster(2026), 68)
    const day = calendar.get(key(sacredHeart))
    expect(day?.principal).toBeDefined()
    expect(day?.principal?.entry.id).toBe('tempore.solemnity.sacred-heart-of-jesus')
    expect(day?.principal?.entry.name['en-US']).toMatch(/Sacred Heart/i)
    expect(day?.principal?.rank).toBe('solemnity')
  })

  // Each principal must match resolveOfDay's principal (modulo skipped ordinary
  // days), so the card/grid never disagree with the Mass.
  const easter = computeEaster(2026)
  const parity: Array<[string, Date]> = [
    ['Christmas', new Date(2026, 11, 25)],
    ['Assumption', new Date(2026, 7, 15)],
    ['a saint memorial (St Anthony)', new Date(2026, 5, 13)],
    ['Trinity Sunday', addDays(easter, 56)],
    ['Corpus Christi', addDays(easter, 60)],
    ['Easter Sunday', easter],
    ['Pentecost', addDays(easter, 49)],
    ['Ascension', addDays(easter, 39)],
  ]
  for (const [label, date] of parity) {
    it(`principal matches resolveOfDay on ${label}`, () => {
      const day = calendar.get(key(date))
      const resolved = resolveOfDay(date, statics, { scope: 'universal' })
      expect(day?.principal?.entry.id).toBe(resolved.celebrations[0].ref)
    })
  }

  it('omits ordinary Sundays and ferias (season header conveys them)', () => {
    // 2026-06-14 is a plain Ordinary Time Sunday; nothing should be surfaced.
    expect(calendar.get('2026-06-14')).toBeUndefined()
    // A plain Ordinary Time weekday with no saint.
    expect(calendar.get('2026-06-15')).toBeUndefined()
  })

  it('normalizes ranks to the underscore form and never leaves a principal unnamed', () => {
    for (const day of calendar.values()) {
      for (const c of day.celebrations) {
        expect(c.rank).not.toContain('-')
        expect(
          (c.entry.name['en-US'] ?? c.entry.name['pt-BR'] ?? c.entry.name.la ?? '').length,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('flags the universal Holy Days of Obligation', () => {
    expect(calendar.get(key(new Date(2026, 7, 15)))?.principal?.entry.holyDayOfObligation).toBe(
      true,
    ) // Assumption
    expect(calendar.get(key(new Date(2026, 10, 1)))?.principal?.entry.holyDayOfObligation).toBe(
      true,
    ) // All Saints
    expect(calendar.get(key(new Date(2026, 11, 25)))?.principal?.entry.holyDayOfObligation).toBe(
      true,
    ) // Christmas
    expect(calendar.get(key(new Date(2026, 5, 13)))?.principal?.entry.holyDayOfObligation).toBe(
      false,
    ) // St Anthony (memorial)
  })
})
