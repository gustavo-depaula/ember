import { everyRegion, sanctoralIds, type Transfers } from '@ember/missal'
import { addDays, eachDay, isSunday, yearOf } from './dates'
import { celebrates, celebrationsFor } from './rules'
import { feastDays, seasonsStartingIn } from './seasons'
import type { Act, Calendar, CardId, Catalog, EmberSeason, IsoDate, Season } from './types'

/**
 * One way a card can still be won, as of a day: the door the rules would give
 * it through, and when that door next opens. Each mirrors a rule in rules.ts,
 * so a card's page never promises what the rules don't give.
 */
export type Way =
  /** Mass (or the Office) on `date`, the next day the card's feast falls. */
  | { door: 'mass' | 'office'; date: IsoDate }
  /** Mass on a date whose saints have no card draws one of the liturgical cards. */
  | { door: 'drawn' }
  | { door: 'novena'; novena: string }
  /** Mass on every Sunday of the season; `attended` of them so far. */
  | { door: 'seasonSunday'; season: Season; days: IsoDate[]; attended: number }
  /** Mass on `needed` of the season's weekdays; `attended` of them so far. */
  | {
      door: 'seasonWeekday'
      season: Season
      days: IsoDate[]
      needed: number
      attended: number
    }
  /** Mass on each of `days`. */
  | { door: 'triduum' | 'gaudete' | 'laetare'; days: IsoDate[] }
  | { door: 'emberDays'; ember: EmberSeason }
  | { door: 'book'; book: string }
  | { door: 'lineage'; practice: string }

/** How far ahead a feast is looked for: a year, and the days a feast can move. */
const horizon = 400

/** The first day from `today` the calendar puts `celebration` on, within the horizon. */
function nextCelebration(
  celebration: string,
  day: { month: number; day: number } | undefined,
  calendar: Calendar,
  today: IsoDate,
): IsoDate | undefined {
  const on = (date: IsoDate) =>
    celebrationsFor(date, calendar).some((c) => celebrates(celebration, c.id))
  // A fixed feast is almost always on its own day; try those before walking the year.
  if (day) {
    const mmdd = `${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
    const year = yearOf(today)
    const fixed = [`${year}-${mmdd}`, `${year + 1}-${mmdd}`].find((d) => d >= today && on(d))
    if (fixed) return fixed
  }
  for (let i = 0; i < horizon; i++) {
    const date = addDays(today, i)
    if (on(date)) return date
  }
  return undefined
}

function nextDay(day: { month: number; day: number }, today: IsoDate): IsoDate {
  const mmdd = `${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
  const thisYear = `${yearOf(today)}-${mmdd}`
  return thisYear >= today ? thisYear : `${yearOf(today) + 1}-${mmdd}`
}

/**
 * The season's window the card can still be won in: the current one while it
 * is still winnable, else the next. A Sunday card is lost with one missed
 * Sunday; a weekday card once too few weekdays remain.
 */
function seasonWay(
  season: Season,
  door: 'seasonSunday' | 'seasonWeekday',
  attended: Set<IsoDate>,
  today: IsoDate,
  transfers: Transfers | undefined,
): Way | undefined {
  const year = yearOf(today)
  const windows = [year - 1, year, year + 1, year + 2]
    .flatMap((y) => seasonsStartingIn(y, transfers))
    .filter((w) => w.season === season && w.end >= today)
  for (const w of windows) {
    const all = eachDay(w.start, w.end)
    const days = all.filter((d) => isSunday(d) === (door === 'seasonSunday'))
    const kept = days.filter((d) => attended.has(d)).length
    const past = days.filter((d) => d < today)
    if (door === 'seasonSunday') {
      if (past.some((d) => !attended.has(d))) continue
      return { door, season, days, attended: kept }
    }
    const needed = Math.ceil((days.length * 2) / 3)
    const left = days.filter((d) => d >= today).length
    if (kept >= needed || kept + left < needed) continue
    return { door, season, days, needed, attended: kept }
  }
  return undefined
}

/** The year's Triduum, Gaudete or Laetare days still to come in full, or next year's. */
function feastDayWay(
  door: 'triduum' | 'gaudete' | 'laetare',
  attended: Set<IsoDate>,
  today: IsoDate,
): Way {
  const year = yearOf(today)
  const days = feastDays(year)[door]
  const open = days[days.length - 1] >= today && days.every((d) => d >= today || attended.has(d))
  return { door, days: open ? days : feastDays(year + 1)[door] }
}

/**
 * Every way `card` can still be won, as of `today`, in the order a page shows
 * them: its feast first, then the devotions and seasons that give it. `acts`
 * (the Masses so far) only measure progress through a season.
 */
export function waysToReceive(
  card: CardId,
  {
    catalog,
    calendar,
    acts = [],
    today,
  }: { catalog: Catalog; calendar: Calendar; acts?: Act[]; today: IsoDate },
): Way[] {
  const ways: Way[] = []
  const saint = catalog.saints.find((s) => s.id === card)
  if (saint) {
    // As massRule and officeRule: Mass on whatever day the calendar puts the
    // celebration; the Office on the assigned day when the celebration isn't
    // in any region's sanctoral (which also never puts it on a date for Mass).
    const sanctoral = sanctoralIds(calendar.statics, everyRegion)
    const inSanctoral = !!saint.celebration && sanctoral.has(saint.celebration)
    const canBeOnCalendar =
      !!saint.celebration && (inSanctoral || !saint.celebration.startsWith('sanctorale.'))
    const massDate =
      canBeOnCalendar && saint.celebration
        ? nextCelebration(saint.celebration, saint.day, calendar, today)
        : undefined
    if (massDate) ways.push({ door: 'mass', date: massDate })
    if (saint.day && !inSanctoral) ways.push({ door: 'office', date: nextDay(saint.day, today) })
  }
  if (catalog.liturgical.includes(card)) ways.push({ door: 'drawn' })

  for (const [novena, cards] of Object.entries(catalog.novenas)) {
    if (cards.includes(card)) ways.push({ door: 'novena', novena })
  }

  const attended = new Set(acts.filter((a) => a.kind === 'mass').map((a) => a.date))
  for (const [season, cards] of Object.entries(catalog.seasons) as [
    Season,
    { sunday?: CardId; weekday?: CardId },
  ][]) {
    if (cards.sunday === card) {
      const way = seasonWay(season, 'seasonSunday', attended, today, calendar.transfers)
      if (way) ways.push(way)
    }
    if (cards.weekday === card) {
      const way = seasonWay(season, 'seasonWeekday', attended, today, calendar.transfers)
      if (way) ways.push(way)
    }
  }
  for (const door of ['triduum', 'gaudete', 'laetare'] as const) {
    if (catalog[door] === card) ways.push(feastDayWay(door, attended, today))
  }
  for (const [ember, c] of Object.entries(catalog.emberDays)) {
    if (c === card) ways.push({ door: 'emberDays', ember: ember as EmberSeason })
  }
  for (const [book, c] of Object.entries(catalog.books)) {
    if (c === card) ways.push({ door: 'book', book })
  }
  for (const [practice, cards] of Object.entries(catalog.lineages)) {
    if (cards.includes(card)) ways.push({ door: 'lineage', practice })
  }
  return ways
}
