import { ofDateCelebrations } from '@ember/mass'
import { addDays, daysBetween, isSunday, toDate, yearOf } from './dates'
import { gaudete, laetare, seasonsStartingIn, triduum } from './seasons'
import type { Act, CardId, EngineInput, Grant, IsoDate } from './types'

/**
 * A rule reads the whole input and returns every card its door has ever given.
 * Rules are independent: one act can complete several (the last Sunday of
 * Advent gives its Mass card and the Advent Sunday card), and each gives its
 * own. Within a rule, one act gives at most one card.
 */
export type Rule = (input: EngineInput) => Grant[]

const nextDay = (date: IsoDate) => addDays(date, 1)
const aWeek = (date: IsoDate) => addDays(date, 7)

function datesOf(acts: Act[], kind: Act['kind']): IsoDate[] {
  return [...new Set(acts.filter((a) => a.kind === kind).map((a) => a.date))].sort()
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

/**
 * Mass gives one of the date's saints — every saint the calendar puts on the
 * date, outranked or not, in order of precedence — or, when none has a card,
 * a liturgical card drawn at redeem.
 */
export const massRule: Rule = ({ acts, calendar, catalog }) => {
  const byCelebration = new Map<string, CardId[]>()
  for (const s of catalog.saints) {
    if (!s.celebration) continue
    byCelebration.set(s.celebration, [...(byCelebration.get(s.celebration) ?? []), s.id])
  }
  return datesOf(acts, 'mass').flatMap((date): Grant[] => {
    const celebrations = ofDateCelebrations(toDate(date), calendar.statics, {
      scope: calendar.scope,
    })
    const saints = unique(celebrations.flatMap((c) => byCelebration.get(c.ref) ?? []))
    const base = { id: `mass:${date}`, date, deadline: nextDay(date) }
    if (saints.length > 0) return [{ ...base, door: 'mass', choice: saints }]
    if (catalog.liturgical.length === 0) return []
    return [{ ...base, door: 'liturgical', choice: catalog.liturgical }]
  })
}

/**
 * The Office gives the saints who have no Mass on the user's calendar, each on
 * its assigned day.
 */
export const officeRule: Rule = ({ acts, calendar, catalog }) => {
  const onCalendar = new Set(
    calendar.statics.sanctoral
      .filter((e) => e.scope === 'universal' || e.scope === calendar.scope)
      .map((e) => e.formularyRef),
  )
  const officeSaints = catalog.saints.filter(
    (s) => s.day && !(s.celebration && onCalendar.has(s.celebration)),
  )
  return datesOf(acts, 'office').flatMap((date): Grant[] => {
    const d = toDate(date)
    const choice = officeSaints
      .filter((s) => s.day?.month === d.getMonth() + 1 && s.day.day === d.getDate())
      .map((s) => s.id)
    if (choice.length === 0) return []
    return [{ id: `office:${date}`, door: 'office', date, choice, deadline: nextDay(date) }]
  })
}

/**
 * A season's Sunday card: Mass on every Sunday, given with the last one. Its
 * weekday card: Mass on two thirds of its weekdays, given with the Mass that
 * reaches them.
 */
export const seasonRule: Rule = ({ acts, catalog }) => {
  const masses = datesOf(acts, 'mass')
  if (masses.length === 0) return []
  const attended = new Set(masses)
  const years = unique(masses.flatMap((d) => [yearOf(d) - 1, yearOf(d)]))
  return years.flatMap(seasonsStartingIn).flatMap((w): Grant[] => {
    const cards = catalog.seasons[w.season]
    if (!cards) return []
    const days = daysBetween(w.start, w.end)
    const grants: Grant[] = []

    const sundays = days.filter(isSunday)
    const last = sundays.at(-1)
    if (cards.sunday && last && sundays.every((d) => attended.has(d))) {
      grants.push({
        id: `season-sunday:${w.key}`,
        door: 'seasonSunday',
        season: w.season,
        date: last,
        choice: [cards.sunday],
        deadline: aWeek(last),
      })
    }

    const weekdays = days.filter((d) => !isSunday(d))
    const reached = weekdays.filter((d) => attended.has(d))[
      Math.ceil((weekdays.length * 2) / 3) - 1
    ]
    if (cards.weekday && reached) {
      grants.push({
        id: `season-weekday:${w.key}`,
        door: 'seasonWeekday',
        season: w.season,
        date: reached,
        choice: [cards.weekday],
        deadline: aWeek(reached),
      })
    }
    return grants
  })
}

/** The Triduum card, and the rose Sundays: Gaudete and Laetare. */
export const feastDayRule: Rule = ({ acts, catalog }) => {
  const masses = datesOf(acts, 'mass')
  const attended = new Set(masses)
  return unique(masses.map(yearOf)).flatMap((year): Grant[] => {
    const grants: Grant[] = []
    const days = triduum(year)
    const vigil = days[2]
    if (catalog.triduum && days.every((d) => attended.has(d))) {
      grants.push({
        id: `triduum:${year}`,
        door: 'triduum',
        date: vigil,
        choice: [catalog.triduum],
        deadline: aWeek(vigil),
      })
    }
    for (const [door, card, date] of [
      ['gaudete', catalog.gaudete, gaudete(year)],
      ['laetare', catalog.laetare, laetare(year)],
    ] as const) {
      if (!card || !attended.has(date)) continue
      grants.push({ id: `${door}:${year}`, door, date, choice: [card], deadline: aWeek(date) })
    }
    return grants
  })
}

export const emberDaysRule: Rule = ({ acts, catalog }) =>
  acts.flatMap((a): Grant[] => {
    if (a.kind !== 'emberDaysFinished') return []
    const card = catalog.emberDays[a.ember]
    if (!card) return []
    return [
      {
        id: `ember-days:${a.ember}:${yearOf(a.date)}`,
        door: 'emberDays',
        ember: a.ember,
        date: a.date,
        choice: [card],
        deadline: aWeek(a.date),
      },
    ]
  })

export const novenaRule: Rule = ({ acts, catalog }) =>
  acts.flatMap((a): Grant[] => {
    if (a.kind !== 'novenaFinished') return []
    const card = catalog.novenas[a.novena]
    if (!card) return []
    return [
      {
        id: `novena:${a.novena}:${a.date}`,
        door: 'novena',
        novena: a.novena,
        date: a.date,
        choice: [card],
        deadline: aWeek(a.date),
      },
    ]
  })

export const bookRule: Rule = ({ acts, catalog }) =>
  acts.flatMap((a): Grant[] => {
    if (a.kind !== 'bookFinished') return []
    const card = catalog.books[a.book]
    if (!card) return []
    return [
      {
        id: `book:${a.book}:${a.date}`,
        door: 'book',
        book: a.book,
        date: a.date,
        choice: [card],
        deadline: aWeek(a.date),
      },
    ]
  })

const lineageWindow = 30
const lineageKept = 20

/**
 * A practice kept on 20 of its last 30 scheduled days gives the next saint of
 * its lineage. Windows don't overlap: after a card, counting starts afresh.
 * After the last saint the lineage starts over.
 */
export const lineageRule: Rule = ({ occurrences, catalog }) =>
  Object.entries(catalog.lineages).flatMap(([practice, lineage]) => {
    if (lineage.length === 0) return []
    const days = occurrences
      .filter((o) => o.practice === practice)
      .sort((a, b) => a.date.localeCompare(b.date))
    const grants: Grant[] = []
    let from = 0
    for (let i = 0; i < days.length; i++) {
      const window = days.slice(Math.max(from, i - lineageWindow + 1), i + 1)
      if (window.filter((o) => o.kept).length < lineageKept) continue
      const date = days[i].date
      grants.push({
        id: `lineage:${practice}:${date}`,
        door: 'lineage',
        practice,
        date,
        choice: [lineage[grants.length % lineage.length]],
        deadline: aWeek(date),
      })
      from = i + 1
    }
    return grants
  })

/** Two starter cards, picked from the pool, with no window. */
export const starterRule: Rule = ({ catalog, firstOpened }) => {
  if (!firstOpened || catalog.starters.length === 0) return []
  return [1, 2].map((n) => ({
    id: `starter:${n}`,
    door: 'starter',
    date: firstOpened,
    choice: catalog.starters,
  }))
}

export const rules: Rule[] = [
  massRule,
  officeRule,
  seasonRule,
  feastDayRule,
  emberDaysRule,
  novenaRule,
  bookRule,
  lineageRule,
  starterRule,
]
