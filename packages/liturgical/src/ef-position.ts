import { addDays, differenceInCalendarDays } from 'date-fns'

import {
  computeEaster,
  dateBefore,
  dateOnOrAfter,
  getFirstSundayOfAdvent,
  normalizeDate,
} from './season'

// ── Types ──

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

// ── Helpers ──

function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(normalizeDate(to), normalizeDate(from))
}

function weekAndDay(from: Date, to: Date): { week: number; dayOfWeek: number } {
  const days = daysBetween(from, to)
  return { week: Math.floor(days / 7) + 1, dayOfWeek: to.getDay() }
}

// ── Main function ──

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

  // ── Fixed-date: Christmas Day ──
  if (month === 11 && day === 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: 0,
      key: 'christmas/1/0',
      specialDay: 'christmas',
    }
  }

  // ── Advent (up to Dec 24) ──
  const dec25 = new Date(year, 11, 25)
  if (dateOnOrAfter(d, adventStart) && dateBefore(d, dec25)) {
    const { week, dayOfWeek } = weekAndDay(adventStart, d)
    return { season: 'advent', week, dayOfWeek, key: `advent/${week}/${dayOfWeek}` }
  }

  // ── Christmas season: Dec 26-31 ──
  if (month === 11 && day > 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key: `fixed/${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      specialDay: `dec-${day}`,
    }
  }

  // ── Christmas season: Jan 1-10 (fixed dates in the book) ──
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

  // ── Epiphany weeks: Jan 14 until Septuagesima ──
  if (dateBefore(d, septuagesima)) {
    const jan6 = new Date(year, 0, 6)
    const firstSundayAfterEpiphany = addDays(jan6, jan6.getDay() === 0 ? 7 : 7 - jan6.getDay())
    const { week, dayOfWeek } = weekAndDay(firstSundayAfterEpiphany, d)
    return { season: 'epiphany', week, dayOfWeek, key: `epiphany/${week}/${dayOfWeek}` }
  }

  // ── Septuagesima season (including Ash Wed through Sat before 1st Lent Sunday) ──
  // In the book, Ash Wednesday falls within the Quinquagesima week (Wed-Sat),
  // so we keep those days in the septuagesima season for mapping purposes.
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

  // ── Holy Week ──
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

  // ── Lent (1st Sunday through day before Palm Sunday) ──
  if (dateOnOrAfter(d, firstSundayOfLent) && dateBefore(d, palmSunday)) {
    const { week, dayOfWeek } = weekAndDay(firstSundayOfLent, d)
    return { season: 'lent', week, dayOfWeek, key: `lent/${week}/${dayOfWeek}` }
  }

  // ── Easter Sunday ──
  if (daysBetween(easter, d) === 0) {
    return {
      season: 'easter',
      week: 1,
      dayOfWeek: 0,
      key: 'easter/1/0',
      specialDay: 'easter-sunday',
    }
  }

  // ── Easter season (through Pentecost Saturday) ──
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

  // ── Post-Pentecost (Trinity Sunday onward) ──
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

// ── Post-Pentecost week mapping ──

/**
 * The EF calendar has a variable number of Sundays after Pentecost (23-28).
 * The book provides:
 * - 24 regular post-Pentecost weeks (weeks 1-24 in the book)
 * - A "last" week (25th in the book) that is always the final week before Advent
 * - 4 "leftover" Epiphany weeks (3rd-6th) used when there are more than 24 Sundays
 *
 * Layout rules:
 * - Weeks 1 through min(totalWeeks-1, 24) map to post-pentecost/1..N
 * - If totalWeeks > 25: extra weeks filled with epiphany-leftover/3, /4, /5, /6
 * - The final week always maps to post-pentecost/25 (the "last" week)
 *
 * Returns a map from raw week number → source key prefix (without day-of-week).
 */
export function getPostPentecostWeekMapping(year: number): Map<number, string> {
  const easter = computeEaster(year)
  const trinitySunday = addDays(easter, 56)
  const adventStart = getFirstSundayOfAdvent(year)
  const totalWeeks = Math.floor(daysBetween(trinitySunday, adventStart) / 7)

  const mapping = new Map<number, string>()

  if (totalWeeks <= 25) {
    // Weeks 1 through totalWeeks-1 map normally, last week = 25
    for (let w = 1; w < totalWeeks; w++) {
      mapping.set(w, `post-pentecost/${w}`)
    }
    mapping.set(totalWeeks, 'post-pentecost/25')
  } else {
    // More than 25 weeks: insert leftover Epiphany weeks before the last
    const regularWeeks = 24
    const leftoverCount = totalWeeks - 25
    const leftoverStart = 3 // Epiphany weeks 3-6 are the overflow source

    // First 24 weeks map normally
    for (let w = 1; w <= regularWeeks; w++) {
      mapping.set(w, `post-pentecost/${w}`)
    }

    // Insert leftover Epiphany weeks
    for (let i = 0; i < leftoverCount && i < 4; i++) {
      mapping.set(regularWeeks + 1 + i, `epiphany-leftover/${leftoverStart + i}`)
    }

    // Last week is always post-pentecost/25
    mapping.set(totalWeeks, 'post-pentecost/25')
  }

  return mapping
}
