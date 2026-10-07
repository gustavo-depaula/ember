import { celebrationsOn, everyRegion, sanctoralIds } from '@ember/missal'
import { addDays, ascending, eachDay, isSunday, toDate, yearOf } from './dates'
import { feastDays, seasonsStartingIn } from './seasons'
import type { Act, CardId, Catalog, EngineInput, Grant, IsoDate } from './types'

/**
 * A rule reads the input and returns the cards its door gave. Rules are
 * independent: one act can complete several (the last Sunday of Advent gives
 * its Mass card and the Advent Sunday card), and each gives its own. Within a
 * rule, one act gives at most one card.
 *
 * `since` is a horizon: only cards won on or after it are needed, so a rule may
 * skip older acts rather than replay the user's whole history.
 */
export type Rule = (input: EngineInput, since: IsoDate) => Grant[]

/** The longest redeeming window, in days. */
export const longestWindow = 7

const nextDay = (date: IsoDate) => addDays(date, 1)

/** A single-card grant redeemable within a week. */
const weekGrant = (id: string, date: IsoDate, card: CardId) => ({
  id,
  date,
  choice: [card],
  deadline: addDays(date, longestWindow),
})

function datesOf(acts: Act[], kind: Act['kind'], since: IsoDate): IsoDate[] {
  return [...new Set(acts.filter((a) => a.kind === kind && a.date >= since).map((a) => a.date))]
}

/**
 * Whether a card's celebration is the calendar's `ref` for a day. A card may
 * name one of the day's variant formularies (the Ascension's card names
 * `tempore.easter.week-6.thursday.b`, the form whose collect it shows), which
 * the calendar lists under the day's own ref. A saint's ref only ever names
 * itself: `sanctorale.06-09.brazil` is Anchieta, not a form of Ephrem's
 * `sanctorale.06-09`.
 */
export function celebrates(celebration: string | undefined, ref: string): boolean {
  if (!celebration) return false
  if (celebration === ref) return true
  return !celebration.startsWith('sanctorale.') && celebration.startsWith(`${ref}.`)
}

/**
 * Mass gives one of the date's saints — every saint the calendar puts on the
 * date, outranked or not, in order of precedence — or, when none has a card,
 * a liturgical card drawn at redeem.
 */
export const massRule: Rule = ({ acts, calendar, catalog }, since) =>
  datesOf(acts, 'mass', since).flatMap((date): Grant[] => {
    const celebrations = celebrationsOn(toDate(date), calendar.statics, { regions: everyRegion })
    const saints = celebrations.flatMap((c) =>
      catalog.saints.filter((s) => celebrates(s.celebration, c.id)).map((s) => s.id),
    )
    const base = { id: `mass:${date}`, door: 'mass' as const, date, deadline: nextDay(date) }
    if (saints.length > 0) return [{ ...base, choice: saints }]
    if (catalog.liturgical.length === 0) return []
    return [{ ...base, choice: catalog.liturgical, drawn: true }]
  })

/**
 * The Office gives the saints who have no Mass on any region's calendar, each
 * on its assigned day.
 */
export const officeRule: Rule = ({ acts, calendar, catalog }, since) => {
  const dates = datesOf(acts, 'office', since)
  if (dates.length === 0) return []
  const onCalendar = sanctoralIds(calendar.statics, everyRegion)
  const byDay = new Map<string, CardId[]>()
  for (const s of catalog.saints) {
    if (!s.day || (s.celebration && onCalendar.has(s.celebration))) continue
    const key = `${String(s.day.month).padStart(2, '0')}-${String(s.day.day).padStart(2, '0')}`
    byDay.set(key, [...(byDay.get(key) ?? []), s.id])
  }
  return dates.flatMap((date): Grant[] => {
    const choice = byDay.get(date.slice(5))
    if (!choice) return []
    return [{ id: `office:${date}`, door: 'office', date, choice, deadline: nextDay(date) }]
  })
}

/**
 * A season's Sunday card: Mass on every Sunday, given with the last one. Its
 * weekday card: Mass on two thirds of its weekdays, given with the Mass that
 * reaches them.
 */
export const seasonRule: Rule = ({ acts, catalog }, since) => {
  const masses = acts.filter((a) => a.kind === 'mass').map((a) => a.date)
  const attended = new Set(masses)
  const years = new Set(masses.filter((d) => d >= since).flatMap((d) => [yearOf(d) - 1, yearOf(d)]))
  return [...years]
    .flatMap((year) => seasonsStartingIn(year).map((w) => ({ ...w, year })))
    .filter((w) => w.end >= since)
    .flatMap((w): Grant[] => {
      const cards = catalog.seasons[w.season]
      if (!cards) return []
      const key = `${w.season}-${w.year}`
      const days = eachDay(w.start, w.end)
      const sundays = days.filter(isSunday)
      const weekdays = days.filter((d) => !isSunday(d))
      const lastSunday = sundays.every((d) => attended.has(d)) ? sundays.at(-1) : undefined
      const reached = weekdays.filter((d) => attended.has(d))[
        Math.ceil((weekdays.length * 2) / 3) - 1
      ]
      const season = w.season
      return [
        cards.sunday && lastSunday
          ? {
              ...weekGrant(`season-sunday:${key}`, lastSunday, cards.sunday),
              door: 'seasonSunday' as const,
              season,
            }
          : undefined,
        cards.weekday && reached
          ? {
              ...weekGrant(`season-weekday:${key}`, reached, cards.weekday),
              door: 'seasonWeekday' as const,
              season,
            }
          : undefined,
      ].filter((g) => g !== undefined)
    })
}

/** The Triduum card, and the rose Sundays: Gaudete and Laetare. */
export const feastDayRule: Rule = ({ acts, catalog }, since) => {
  const masses = datesOf(acts, 'mass', since)
  const attended = new Set(acts.filter((a) => a.kind === 'mass').map((a) => a.date))
  return [...new Set(masses.map(yearOf))].flatMap((year) => {
    const days = feastDays(year)
    return (['triduum', 'gaudete', 'laetare'] as const).flatMap((door): Grant[] => {
      const card = catalog[door]
      const last = days[door].at(-1)
      if (!card || !last || !days[door].every((d) => attended.has(d))) return []
      return [{ ...weekGrant(`${door}:${year}`, last, card), door }]
    })
  })
}

/** A rule for an act that finishes something (a novena, the Ember Days, a book) naming its card. */
function finishedRule<K extends 'novenaFinished' | 'emberDaysFinished' | 'bookFinished'>(
  kind: K,
  grant: (act: Extract<Act, { kind: K }>, catalog: Catalog) => Grant | undefined,
): Rule {
  return ({ acts, catalog }, since) =>
    acts.flatMap((a) =>
      a.kind === kind && a.date >= since
        ? (grant(a as Extract<Act, { kind: K }>, catalog) ?? [])
        : [],
    )
}

export const novenaRule = finishedRule('novenaFinished', (a, catalog) => {
  const cards = catalog.novenas[a.novena]
  if (!cards?.[0]) return undefined
  return {
    ...weekGrant(`novena:${a.novena}:${a.date}`, a.date, cards[0]),
    choice: cards,
    door: 'novena',
    novena: a.novena,
  }
})

export const emberDaysRule = finishedRule('emberDaysFinished', (a, catalog) => {
  const card = catalog.emberDays[a.ember]
  if (!card) return undefined
  const id = `ember-days:${a.ember}:${yearOf(a.date)}`
  return { ...weekGrant(id, a.date, card), door: 'emberDays', ember: a.ember }
})

export const bookRule = finishedRule('bookFinished', (a, catalog) => {
  const card = catalog.books[a.book]
  if (!card) return undefined
  return { ...weekGrant(`book:${a.book}:${a.date}`, a.date, card), door: 'book', book: a.book }
})

const lineageWindow = 30
const lineageKept = 20

/**
 * A practice kept on 20 of its last 30 scheduled days gives the next saint of
 * its lineage. Windows don't overlap: after a card, counting starts afresh.
 * After the last saint the lineage starts over. Which saint comes next depends
 * on every earlier window, so this rule reads the whole history (in one pass).
 */
export const lineageRule: Rule = ({ occurrences, catalog }) => {
  const byPractice = new Map<string, EngineInput['occurrences']>()
  for (const o of occurrences) {
    if (!catalog.lineages[o.practice]?.length) continue
    const list = byPractice.get(o.practice) ?? []
    list.push(o)
    byPractice.set(o.practice, list)
  }
  return [...byPractice].flatMap(([practice, list]) => {
    const lineage = catalog.lineages[practice]
    const days = list.sort((a, b) => ascending(a.date, b.date))
    const grants: Grant[] = []
    let from = 0
    let kept = 0
    for (let i = 0; i < days.length; i++) {
      if (days[i].kept) kept++
      const leaving = i - lineageWindow
      if (leaving >= from && days[leaving].kept) kept--
      if (kept < lineageKept) continue
      const card = lineage[grants.length % lineage.length]
      const date = days[i].date
      grants.push({
        ...weekGrant(`lineage:${practice}:${date}`, date, card),
        door: 'lineage',
        practice,
      })
      from = i + 1
      kept = 0
    }
    return grants
  })
}

/** Two different starter cards, picked from the pool, with no window. */
export const starterRule: Rule = ({ catalog, firstOpened }) => {
  if (!firstOpened || catalog.starters.length === 0) return []
  return [1, 2].map((n) => ({
    id: `starter:${n}`,
    door: 'starter',
    date: firstOpened,
    choice: catalog.starters,
    group: 'starter',
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
