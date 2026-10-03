import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { OfCalendarStatics, SanctoralEntry, TemporalEntry } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { grants } from '../engine'
import type { Act, Catalog, EngineInput } from '../types'
import { waysToReceive } from '../ways'

// The real calendar and the real cards, as in engine.test.ts.
const root = fileURLToPath(new URL('../../../../', import.meta.url))
const read = <T>(p: string): T => JSON.parse(readFileSync(`${root}${p}`, 'utf-8'))
const statics: OfCalendarStatics = {
  temporal: read<TemporalEntry[]>('content/of/calendar/temporal.json'),
  sanctoral: read<SanctoralEntry[]>('content/of/calendar/sanctoral.json'),
}
const cardsDir = 'content/practices/saint-of-the-day/data/holy-cards'
const cards = readdirSync(`${root}${cardsDir}`)
  .sort()
  .map((f) =>
    read<{ id: string; kind?: string; proper?: string; feast?: { month: number; day: number } }>(
      `${cardsDir}/${f}`,
    ),
  )

const catalog: Catalog = {
  saints: cards
    .filter((c) => c.feast || c.kind === 'moveable')
    .map((c) => ({ id: c.id, celebration: c.proper, day: c.feast })),
  liturgical: ['kyrie', 'chalice'],
  seasons: { advent: { sunday: 'advent_sunday', weekday: 'advent_weekday' } },
  triduum: 'triduum',
  gaudete: 'gaudete',
  laetare: 'laetare',
  emberDays: {},
  novenas: { 'ss-peter-and-paul-novena': ['peter', 'paul'] },
  books: {},
  lineages: {},
  starters: [],
}
const calendar = { statics, scope: 'brazil' }
const ways = (card: string, today: string, acts: Act[] = []) =>
  waysToReceive(card, { catalog, calendar, acts, today })
const input = (acts: Act[]): EngineInput => ({ acts, occurrences: [], calendar, catalog })
const mass = (...dates: string[]): Act[] => dates.map((date) => ({ kind: 'mass', date }))

describe('A feast', () => {
  it('names the next Mass of the feast, even on a Sunday that outranks it', () => {
    // 4 Oct 2026 is the 27th Sunday in Ordinary Time.
    expect(ways('francis_assisi', '2026-10-02')).toEqual([{ door: 'mass', date: '2026-10-04' }])
  })

  it("names next year's once this year's has passed", () => {
    expect(ways('francis_assisi', '2026-10-05')).toEqual([{ door: 'mass', date: '2027-10-04' }])
  })

  it('names the Office on the assigned day for a saint with no Mass on the calendar', () => {
    expect(ways('philip_benizi', '2026-10-02')).toEqual([{ door: 'office', date: '2027-08-23' }])
  })

  it('finds the date of a moveable feast', () => {
    const [way] = ways('corpus_christi', '2026-10-02')
    expect(way.door).toBe('mass')
  })

  it('names, for every saint card, a day on which the rules give it', () => {
    // The page promises these days; each must be one the engine honours.
    const today = '2026-10-02'
    for (const saint of catalog.saints) {
      const found = ways(saint.id, today).filter((w) => w.door === 'mass' || w.door === 'office')
      expect(found.length, saint.id).toBeGreaterThan(0)
      for (const way of found) {
        if (way.door !== 'mass' && way.door !== 'office') continue
        const given = grants(input([{ kind: way.door, date: way.date }]))
        expect(
          given.some((g) => g.choice.includes(saint.id)),
          `${saint.id} by ${way.door} on ${way.date}`,
        ).toBe(true)
      }
    }
  })
})

describe('Other doors', () => {
  it('lists a novena to several saints on each of their cards', () => {
    expect(ways('paul', '2026-10-02')).toContainEqual({
      door: 'novena',
      novena: 'ss-peter-and-paul-novena',
    })
  })

  it('says a liturgical card is drawn at Mass', () => {
    expect(ways('chalice', '2026-10-02')).toEqual([{ door: 'drawn' }])
  })

  it("counts a season's Sundays kept so far", () => {
    // Advent 2026: 29 Nov, 6, 13 and 20 Dec.
    const [way] = ways('advent_sunday', '2026-12-08', mass('2026-11-29', '2026-12-06'))
    expect(way).toMatchObject({ door: 'seasonSunday', attended: 2 })
    expect(way.door === 'seasonSunday' && way.days[0]).toBe('2026-11-29')
  })

  it("moves to next year's season once a Sunday is missed", () => {
    const [way] = ways('advent_sunday', '2026-12-08', mass('2026-11-29'))
    expect(way.door === 'seasonSunday' && way.days[0]).toBe('2027-11-28')
  })

  it('asks for two thirds of the weekdays', () => {
    const [way] = ways('advent_weekday', '2026-10-02')
    expect(way).toMatchObject({ door: 'seasonWeekday', attended: 0 })
    if (way.door !== 'seasonWeekday') return
    expect(way.needed).toBe(Math.ceil((way.days.length * 2) / 3))
  })

  it('names the coming Triduum', () => {
    expect(ways('triduum', '2026-10-02')).toEqual([
      { door: 'triduum', days: ['2027-03-25', '2027-03-26', '2027-03-27'] },
    ])
  })
})
