import { addDays, differenceInCalendarDays } from 'date-fns'

import {
  computeEaster,
  dateBefore,
  dateOnOrAfter,
  getFirstSundayOfAdvent,
  normalizeDate,
} from './season'

export type EfLiturgicalPosition = {
  season: EfSeason
  week: number
  dayOfWeek: number
  key: string
  specialDay?: string
}

export type EfSeason =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'septuagesima'
  | 'lent'
  | 'holy-week'
  | 'easter'
  | 'post-pentecost'

function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(normalizeDate(to), normalizeDate(from))
}

function weekAndDay(from: Date, to: Date): { week: number; dayOfWeek: number } {
  const days = daysBetween(from, to)
  return { week: Math.floor(days / 7) + 1, dayOfWeek: to.getDay() }
}

export function getEfLiturgicalPosition(date: Date): EfLiturgicalPosition {
  const year = date.getFullYear()
  const d = normalizeDate(date)
  const month = d.getMonth()
  const day = d.getDate()

  const easter = computeEaster(year)
  const ashWed = addDays(easter, -46)
  const palmSunday = addDays(easter, -7)
  const holyThursday = addDays(easter, -3)
  const goodFriday = addDays(easter, -2)
  const holySaturday = addDays(easter, -1)
  const pentecost = addDays(easter, 49)
  const trinitySunday = addDays(easter, 56)
  const adventStart = getFirstSundayOfAdvent(year)
  const septuagesima = addDays(easter, -63)
  const sexagesima = addDays(easter, -56)
  const quinquagesima = addDays(easter, -49)

  if (month === 11 && day === 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: 0,
      key: 'christmas/1/0',
      specialDay: 'christmas',
    }
  }

  const dec25 = new Date(year, 11, 25)
  if (dateOnOrAfter(d, adventStart) && dateBefore(d, dec25)) {
    const { week, dayOfWeek } = weekAndDay(adventStart, d)
    return { season: 'advent', week, dayOfWeek, key: `advent/${week}/${dayOfWeek}` }
  }

  if (month === 11 && day > 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key: `fixed/${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      specialDay: `dec-${day}`,
    }
  }

  // Jan 1-10 are keyed by fixed date in the book.
  if (month === 0 && day <= 10) {
    let specialDay: string | undefined
    if (day === 1) specialDay = 'circumcision'
    if (day === 6) specialDay = 'epiphany'
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key: `fixed/01-${String(day).padStart(2, '0')}`,
      specialDay,
    }
  }

  // Epiphany weeks: Jan 11 until Septuagesima.
  if (dateBefore(d, septuagesima)) {
    const jan6 = new Date(year, 0, 6)
    const firstSundayAfterEpiphany = addDays(jan6, jan6.getDay() === 0 ? 7 : 7 - jan6.getDay())
    const { week, dayOfWeek } = weekAndDay(firstSundayAfterEpiphany, d)
    return { season: 'epiphany', week, dayOfWeek, key: `epiphany/${week}/${dayOfWeek}` }
  }

  // In the book, Ash Wednesday falls within the Quinquagesima week (Wed-Sat),
  // so those days stay in the septuagesima season for mapping purposes.
  const firstSundayOfLent = addDays(ashWed, 4)
  if (dateBefore(d, firstSundayOfLent)) {
    let specialDay: string | undefined
    if (daysBetween(septuagesima, d) === 0) specialDay = 'septuagesima'
    else if (daysBetween(sexagesima, d) === 0) specialDay = 'sexagesima'
    else if (daysBetween(quinquagesima, d) === 0) specialDay = 'quinquagesima'
    else if (daysBetween(ashWed, d) === 0) specialDay = 'ash-wednesday'

    const { week, dayOfWeek } = weekAndDay(septuagesima, d)
    return {
      season: 'septuagesima',
      week,
      dayOfWeek,
      key: `septuagesima/${week}/${dayOfWeek}`,
      specialDay,
    }
  }

  if (dateOnOrAfter(d, palmSunday) && dateBefore(d, easter)) {
    const dayOfWeek = d.getDay()
    let specialDay: string | undefined
    if (daysBetween(palmSunday, d) === 0) specialDay = 'palm-sunday'
    else if (daysBetween(holyThursday, d) === 0) specialDay = 'holy-thursday'
    else if (daysBetween(goodFriday, d) === 0) specialDay = 'good-friday'
    else if (daysBetween(holySaturday, d) === 0) specialDay = 'holy-saturday'

    return {
      season: 'holy-week',
      week: 1,
      dayOfWeek,
      key: `holy-week/1/${dayOfWeek}`,
      specialDay,
    }
  }

  if (dateOnOrAfter(d, firstSundayOfLent) && dateBefore(d, palmSunday)) {
    const { week, dayOfWeek } = weekAndDay(firstSundayOfLent, d)
    return { season: 'lent', week, dayOfWeek, key: `lent/${week}/${dayOfWeek}` }
  }

  if (daysBetween(easter, d) === 0) {
    return {
      season: 'easter',
      week: 1,
      dayOfWeek: 0,
      key: 'easter/1/0',
      specialDay: 'easter-sunday',
    }
  }

  const pentecostSaturday = addDays(easter, 55)
  if (dateBefore(d, addDays(pentecostSaturday, 1))) {
    const { week, dayOfWeek } = weekAndDay(easter, d)
    let specialDay: string | undefined
    if (daysBetween(addDays(easter, 39), d) === 0) specialDay = 'ascension'
    if (daysBetween(pentecost, d) === 0) specialDay = 'pentecost'
    return {
      season: 'easter',
      week,
      dayOfWeek,
      key: `easter/${week}/${dayOfWeek}`,
      specialDay,
    }
  }

  if (dateOnOrAfter(d, trinitySunday)) {
    const { week: rawWeek, dayOfWeek } = weekAndDay(trinitySunday, d)
    const mapping = getPostPentecostWeekMapping(year)
    const mapped = mapping.get(rawWeek)

    let specialDay: string | undefined
    if (daysBetween(trinitySunday, d) === 0) specialDay = 'trinity-sunday'
    if (daysBetween(addDays(easter, 60), d) === 0) specialDay = 'corpus-christi'
    if (daysBetween(addDays(easter, 68), d) === 0) specialDay = 'sacred-heart'

    return {
      season: 'post-pentecost',
      week: rawWeek,
      dayOfWeek,
      key: mapped ? `${mapped}/${dayOfWeek}` : `post-pentecost/${rawWeek}/${dayOfWeek}`,
      specialDay,
    }
  }

  // Fallback (should not be reached)
  return {
    season: 'post-pentecost',
    week: 1,
    dayOfWeek: d.getDay(),
    key: `post-pentecost/1/${d.getDay()}`,
  }
}

/**
 * The EF calendar has 23 to 28 Sundays after Pentecost. The 24th's Mass is
 * always the last Sunday's; when there are more than 24, the Sundays after
 * Epiphany that Septuagesima cut short are resumed before it, ending with the
 * 6th: with 25 Sundays the 6th, with 26 the 5th and 6th, and so on back to the
 * 3rd. A meditation book keys them:
 * - `post-pentecost/1..23`: the Sundays after Pentecost and their weeks
 * - `epiphany-leftover/3..6`: the resumed Sundays after Epiphany
 * - `post-pentecost/25`: the last week before Advent
 *
 * Returns a map from raw week number → source key prefix (without day-of-week).
 */
export function getPostPentecostWeekMapping(year: number): Map<number, string> {
  const easter = computeEaster(year)
  const trinitySunday = addDays(easter, 56)
  const adventStart = getFirstSundayOfAdvent(year)
  const totalWeeks = Math.floor(daysBetween(trinitySunday, adventStart) / 7)

  const resumed = Math.max(0, totalWeeks - 24)
  const regular = totalWeeks - 1 - resumed

  const mapping = new Map<number, string>()
  for (let w = 1; w <= regular; w++) mapping.set(w, `post-pentecost/${w}`)
  for (let i = 0; i < resumed; i++) {
    mapping.set(regular + 1 + i, `epiphany-leftover/${7 - resumed + i}`)
  }
  mapping.set(totalWeeks, 'post-pentecost/25')
  return mapping
}
