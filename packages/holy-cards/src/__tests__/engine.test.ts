import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { OfCalendarStatics, SanctoralEntry, TemporalEntry } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { addDays, eachDay, isSunday } from '../dates'
import { drawCard, grants, historyStart, pendingCards, redeem } from '../engine'
import type { Act, Catalog, Copy, Door, EngineInput, Grant, Occurrence } from '../types'

// The real calendar and the real saint cards; the non-saint cards (seasons,
// liturgical) aren't drawn yet, so they're stand-in ids.
const root = fileURLToPath(new URL('../../../../', import.meta.url))
const read = <T>(p: string): T => JSON.parse(readFileSync(`${root}${p}`, 'utf-8'))
const statics: OfCalendarStatics = {
  temporal: read<TemporalEntry[]>('content/of/calendar/temporal.json'),
  sanctoral: read<SanctoralEntry[]>('content/of/calendar/sanctoral.json'),
}
const cardsDir = 'content/practices/saint-of-the-day/data/holy-cards'
const saints = readdirSync(`${root}${cardsDir}`)
  .sort()
  .map((f) =>
    read<{ id: string; proper?: string; feast?: { month: number; day: number } }>(
      `${cardsDir}/${f}`,
    ),
  )
  .map((c) => ({ id: c.id, celebration: c.proper, day: c.feast }))

const catalog: Catalog = {
  saints,
  liturgical: ['kyrie', 'gloria', 'chalice', 'chasuble'],
  seasons: {
    advent: { sunday: 'advent-sunday', weekday: 'advent-weekday' },
    lent: { sunday: 'lent-sunday', weekday: 'lent-weekday' },
  },
  triduum: 'triduum',
  gaudete: 'gaudete',
  laetare: 'laetare',
  emberDays: { advent: 'ember-advent' },
  novenas: { 'st-joseph-novena': 'joseph' },
  books: { 'book/story-of-a-soul': 'therese' },
  lineages: { 'practice/rosary': ['dominic', 'louis_de_montfort'] },
  starters: ['peter', 'paul', 'augustine'],
}

const input = (acts: Act[], extra: Partial<EngineInput> = {}): EngineInput => ({
  acts,
  occurrences: [],
  calendar: { statics, scope: 'brazil' },
  catalog,
  ...extra,
})
const mass = (...dates: string[]): Act[] => dates.map((date) => ({ kind: 'mass', date }))
const office = (date: string): Act => ({ kind: 'office', date })
const only = (gs: Grant[], door: Door) => gs.filter((g) => g.door === door)
const pending = (
  acts: Act[],
  today: string,
  copies: Copy[] = [],
  extra: Partial<EngineInput> = {},
) => pendingCards({ ...input(acts, extra), copies, today })
/** Copies of `cards`, as if redeemed long ago. */
const held = (cards: string[]): Copy[] =>
  cards.map((card, i) => ({ grant: `x${i}`, card, date: '2026-01-01' }))
const sundaysIn = (start: string, end: string) => eachDay(start, end).filter(isSunday)
const weekdaysIn = (start: string, end: string) => eachDay(start, end).filter((d) => !isSunday(d))

describe('Mass', () => {
  it("gives the date's saint even when a Sunday outranks him", () => {
    // 4 Oct 2026 is the 27th Sunday in Ordinary Time: Francis isn't celebrated.
    const [g] = grants(input(mass('2026-10-04')))
    expect(g).toMatchObject({ door: 'mass', choice: ['francis_assisi'], deadline: '2026-10-05' })
  })

  it('offers every saint of the date to pick from', () => {
    const [g] = grants(input(mass('2027-06-29')))
    expect(g.door).toBe('mass')
    expect([...g.choice].sort()).toEqual(['paul', 'peter'])
  })

  it('gives a liturgical card on a date with no saint', () => {
    // 1 July has no celebration, universal or Brazilian.
    const [g] = grants(input(mass('2026-07-01')))
    expect(g).toMatchObject({ door: 'mass', drawn: true, choice: catalog.liturgical })
  })

  it('gives one card however many times Mass is marked that day', () => {
    expect(grants(input([...mass('2026-10-04'), ...mass('2026-10-04')]))).toHaveLength(1)
  })

  it('gives nothing without a liturgical pool on a date with no saint', () => {
    const noPool = { ...catalog, liturgical: [] }
    expect(grants(input(mass('2026-07-01'), { catalog: noPool }))).toEqual([])
  })
})

describe('The Divine Office', () => {
  it("gives a saint without a Mass on the calendar on the saint's assigned day", () => {
    const [g] = grants(input([office('2026-08-11')]))
    expect(g.door).toBe('office')
    expect(g.choice).toContain('philomena')
    // Clare has her Mass on 11 August: only Mass gives her.
    expect(g.choice).not.toContain('clare_assisi')
  })

  it('gives nothing on a day with no assigned saint', () => {
    expect(grants(input([office('2026-07-01')]))).toEqual([])
  })

  it('treats a regional saint as an Office saint outside that region', () => {
    // Frei Galvão has a Mass on Brazil's calendar only.
    const galvao = {
      id: 'frei_galvao',
      celebration: 'sanctorale.10-25.brazil',
      day: { month: 10, day: 25 },
    }
    const withGalvao = { ...catalog, saints: [...saints.filter((s) => s.id !== galvao.id), galvao] }
    const at = (scope: string, act: Act) =>
      grants(input([act], { catalog: withGalvao, calendar: { statics, scope } })).flatMap(
        (g) => g.choice,
      )
    expect(at('universal', office('2026-10-25'))).toContain('frei_galvao')
    expect(at('brazil', office('2026-10-25'))).not.toContain('frei_galvao')
    expect(at('brazil', mass('2026-10-25')[0])).toContain('frei_galvao')
  })
})

describe('Seasons', () => {
  const advent = { start: '2026-11-29', end: '2026-12-24' }

  it('gives the Sunday card with the last Sunday, alongside that Mass', () => {
    const sundays = sundaysIn(advent.start, advent.end)
    const gs = grants(input(mass(...sundays)))
    const [sunday] = only(gs, 'seasonSunday')
    expect(sunday).toMatchObject({
      season: 'advent',
      date: '2026-12-20',
      choice: ['advent-sunday'],
    })
    // The same Mass on 20 December also gives its own card.
    expect(
      gs
        .filter((g) => g.date === '2026-12-20')
        .map((g) => g.door)
        .sort(),
    ).toEqual(['mass', 'seasonSunday'])
  })

  it('still offers the Sunday card when the early Sundays are long past', () => {
    const sundays = sundaysIn(advent.start, advent.end)
    const ids = pending(mass(...sundays), '2026-12-22').map((g) => g.id)
    expect(ids).toContain('season-sunday:advent-2026')
  })

  it('gives no Sunday card when a Sunday is missed', () => {
    const [, ...rest] = sundaysIn(advent.start, advent.end)
    expect(only(grants(input(mass(...rest))), 'seasonSunday')).toEqual([])
  })

  it('gives the weekday card with the Mass that reaches two thirds', () => {
    const weekdays = weekdaysIn(advent.start, advent.end)
    const needed = Math.ceil((weekdays.length * 2) / 3)
    const [g] = only(grants(input(mass(...weekdays.slice(0, needed)))), 'seasonWeekday')
    expect(g).toMatchObject({ season: 'advent', date: weekdays[needed - 1] })
    expect(only(grants(input(mass(...weekdays.slice(0, needed - 1)))), 'seasonWeekday')).toEqual([])
  })

  it("counts Palm Sunday among Lent's Sundays", () => {
    // Lent 2027: Ash Wednesday 10 Feb, Palm Sunday 21 Mar.
    const sundays = sundaysIn('2027-02-10', '2027-03-21')
    expect(sundays.at(-1)).toBe('2027-03-21')
    const [g] = only(grants(input(mass(...sundays))), 'seasonSunday')
    expect(g).toMatchObject({ season: 'lent', date: '2027-03-21' })
    expect(only(grants(input(mass(...sundays.slice(0, -1)))), 'seasonSunday')).toEqual([])
  })

  it('gives the Triduum card for all three liturgies', () => {
    const [g] = only(grants(input(mass('2027-03-25', '2027-03-26', '2027-03-27'))), 'triduum')
    expect(g).toMatchObject({ date: '2027-03-27', choice: ['triduum'] })
    expect(only(grants(input(mass('2027-03-25', '2027-03-27'))), 'triduum')).toEqual([])
  })

  it('gives Gaudete and Laetare for Mass on those Sundays', () => {
    expect(only(grants(input(mass('2026-12-13'))), 'gaudete')).toHaveLength(1)
    expect(only(grants(input(mass('2027-03-07'))), 'laetare')).toHaveLength(1)
    expect(only(grants(input(mass('2026-12-06'))), 'gaudete')).toEqual([])
  })
})

describe('Novenas, Ember Days, books', () => {
  it('gives the card the novena is prayed to', () => {
    const [g] = grants(
      input([{ kind: 'novenaFinished', date: '2027-03-18', novena: 'st-joseph-novena' }]),
    )
    expect(g).toMatchObject({ door: 'novena', choice: ['joseph'], deadline: '2027-03-25' })
  })

  it('gives nothing for a novena without a card', () => {
    expect(
      grants(input([{ kind: 'novenaFinished', date: '2027-03-18', novena: 'any-saint-novena' }])),
    ).toEqual([])
  })

  it("gives the season's Ember Days card", () => {
    const [g] = grants(input([{ kind: 'emberDaysFinished', date: '2026-12-19', ember: 'advent' }]))
    expect(g).toMatchObject({ door: 'emberDays', choice: ['ember-advent'] })
  })

  it("gives a saint's book's saint", () => {
    const [g] = grants(
      input([{ kind: 'bookFinished', date: '2026-10-01', book: 'book/story-of-a-soul' }]),
    )
    expect(g).toMatchObject({ door: 'book', choice: ['therese'] })
  })
})

describe('Practice lineages', () => {
  const days = (n: number, kept: (i: number) => boolean): Occurrence[] =>
    eachDay('2026-01-01', addDays('2026-01-01', n - 1)).map((date, i) => ({
      practice: 'practice/rosary',
      date,
      kept: kept(i),
    }))

  it('gives the next saint for 20 of the last 30, with no overlapping windows', () => {
    // Kept two days of every three: 20 kept by day 30, again by day 60, 90.
    const gs = only(grants(input([], { occurrences: days(90, (i) => i % 3 !== 2) })), 'lineage')
    expect(gs.map((g) => g.choice[0])).toEqual(['dominic', 'louis_de_montfort', 'dominic'])
  })

  it('gives nothing for 19 of 30', () => {
    expect(grants(input([], { occurrences: days(30, (i) => i < 19) }))).toEqual([])
  })
})

describe('Redeeming', () => {
  it('keeps a Mass card until the end of the next day', () => {
    const acts = mass('2026-10-04')
    expect(pending(acts, '2026-10-05')).toHaveLength(1)
    expect(pending(acts, '2026-10-06')).toEqual([])
  })

  it('stops offering a redeemed card', () => {
    const acts = mass('2026-10-04')
    const [g] = grants(input(acts))
    const copies = [redeem(g, '2026-10-04', [])]
    expect(copies[0].card).toBe('francis_assisi')
    expect(pending(acts, '2026-10-04', copies)).toEqual([])
  })

  it('brings a lapsed saint back the next time the act comes round', () => {
    const acts = mass('2026-10-04', '2027-10-04')
    expect(pending(acts, '2027-10-04').map((g) => g.id)).toEqual(['mass:2027-10-04'])
  })

  it('makes the user pick when the envelope offers several', () => {
    const [g] = grants(input(mass('2027-06-29')))
    expect(() => redeem(g, '2027-06-29', [])).toThrow()
    expect(redeem(g, '2027-06-29', [], 'peter').card).toBe('peter')
    expect(() => redeem(g, '2027-06-29', [], 'francis_assisi')).toThrow()
  })

  it('draws an unheld liturgical card, the same one while it waits', () => {
    const [g] = grants(input(mass('2026-07-01')))
    const three = held(catalog.liturgical.slice(0, 3))
    expect(drawCard(g, three)).toBe('chasuble')
    expect(drawCard(g, [])).toBe(drawCard(g, []))
    expect(redeem(g, '2026-07-01', three).card).toBe('chasuble')
  })

  it('draws a copy once every liturgical card is held', () => {
    const [g] = grants(input(mass('2026-07-01')))
    expect(catalog.liturgical).toContain(drawCard(g, held(catalog.liturgical)))
  })

  it('offers two different starter cards with no window', () => {
    const extra = { firstOpened: '2026-01-01' }
    const [first, second] = grants(input([], extra))
    expect([first.deadline, second.deadline]).toEqual([undefined, undefined])
    const copies = [redeem(first, '2026-01-01', [], 'peter')]
    const waiting = pending([], '2030-01-01', copies, extra)
    expect(waiting).toHaveLength(1)
    expect(waiting[0].choice).toEqual(['paul', 'augustine'])
  })
})

describe('History horizon', () => {
  it('gives the same envelopes from acts since historyStart as from the whole history', () => {
    const withOrdinary = {
      ...catalog,
      seasons: { ...catalog.seasons, ordinary2: { sunday: 'ot2-sunday', weekday: 'ot2-weekday' } },
    }
    const everyMass = mass(...eachDay('2025-01-01', '2026-12-31'))
    for (const today of ['2026-06-10', '2026-11-30', '2026-12-22', '2026-12-31']) {
      const ids = (acts: Act[]) =>
        pending(acts, today, [], { catalog: withOrdinary }).map((g) => g.id)
      const upToToday = everyMass.filter((a) => a.date <= today)
      const recent = upToToday.filter((a) => a.date >= historyStart(today))
      expect(ids(recent), today).toEqual(ids(upToToday))
    }
  })
})
