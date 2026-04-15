import { addDays, differenceInCalendarDays } from 'date-fns'

import {
  computeEaster,
  dateBefore,
  dateOnOrAfter,
  getAshWednesday,
  getBaptismOfTheLord,
  getFirstSundayOfAdvent,
  normalizeDate,
} from './season'

// ── Types ──

export type OfLiturgicalPosition = {
  season: OfSeason
  week: number
  dayOfWeek: number
  key: string
  specialDay?: string
}

export type OfSeason = 'advent' | 'christmas' | 'lent' | 'holy-week' | 'easter' | 'ordinary'

// ── Cycle computation ──

/**
 * Returns the liturgical year for a given date. The liturgical year starts
 * on the 1st Sunday of Advent, so dates from Advent onward belong to the
 * next calendar year's liturgical year.
 */
export function getLiturgicalYear(date: Date): number {
  const year = date.getFullYear()
  const adventStart = getFirstSundayOfAdvent(year)
  return dateOnOrAfter(normalizeDate(date), adventStart) ? year + 1 : year
}

/**
 * Sunday lectionary cycle: A, B, or C.
 * Year A = 2023, 2026, 2029 … (litYear % 3 === 2)
 * Year B = 2024, 2027, 2030 … (litYear % 3 === 0)
 * Year C = 2025, 2028, 2031 … (litYear % 3 === 1)
 */
export function getSundayCycle(litYear: number): 'A' | 'B' | 'C' {
  return (['C', 'A', 'B'] as const)[litYear % 3]
}

/**
 * Weekday lectionary cycle: I (odd years) or II (even years).
 * Only affects the First Reading on Ordinary Time weekdays.
 */
export function getWeekdayCycle(litYear: number): 'I' | 'II' {
  return litYear % 2 === 1 ? 'I' : 'II'
}

// ── Helpers ──

function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(normalizeDate(to), normalizeDate(from))
}

function weekAndDay(from: Date, to: Date): { week: number; dayOfWeek: number } {
  const days = daysBetween(from, to)
  return { week: Math.floor(days / 7) + 1, dayOfWeek: to.getDay() }
}

// ── Main function ──

export function getOfLiturgicalPosition(date: Date): OfLiturgicalPosition {
  const d = normalizeDate(date)
  const year = d.getFullYear()
  const month = d.getMonth()
  const day = d.getDate()

  const easter = computeEaster(year)
  const ashWed = getAshWednesday(year)
  const firstSundayOfLent = addDays(ashWed, 4)
  const palmSunday = addDays(easter, -7)
  const pentecost = addDays(easter, 49)
  const adventStart = getFirstSundayOfAdvent(year)
  const baptism = getBaptismOfTheLord(year)

  // ── Christmas Day ──
  if (month === 11 && day === 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key: 'fixed/12-25',
      specialDay: 'christmas',
    }
  }

  // ── Advent ──
  const dec25 = new Date(year, 11, 25)
  if (dateOnOrAfter(d, adventStart) && dateBefore(d, dec25)) {
    // Dec 17-24 have their own proper readings (fixed-date, not weekly cycle)
    if (month === 11 && day >= 17) {
      return {
        season: 'advent',
        week: 0,
        dayOfWeek: d.getDay(),
        key: `fixed/12-${String(day).padStart(2, '0')}`,
      }
    }
    const { week, dayOfWeek } = weekAndDay(adventStart, d)
    return { season: 'advent', week, dayOfWeek, key: `advent/${week}/${dayOfWeek}` }
  }

  // ── Christmas season: Dec 26-31 (fixed-date readings) ──
  if (month === 11 && day > 25) {
    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key: `fixed/12-${String(day).padStart(2, '0')}`,
    }
  }

  // ── Christmas season: Jan 1 through Baptism of the Lord ──
  const baptismNext = addDays(baptism, 1)
  if (dateBefore(d, baptismNext)) {
    let specialDay: string | undefined
    if (month === 0 && day === 1) specialDay = 'mary-mother-of-god'
    if (month === 0 && day === 6) specialDay = 'epiphany'
    if (daysBetween(baptism, d) === 0) specialDay = 'baptism-of-the-lord'

    return {
      season: 'christmas',
      week: 1,
      dayOfWeek: d.getDay(),
      key:
        specialDay === 'baptism-of-the-lord'
          ? 'fixed/baptism'
          : `fixed/${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      specialDay,
    }
  }

  // ── Ash Wednesday + days before 1st Sunday of Lent ──
  if (dateOnOrAfter(d, ashWed) && dateBefore(d, firstSundayOfLent)) {
    const dayOfWeek = d.getDay()
    return {
      season: 'lent',
      week: 0,
      dayOfWeek,
      key: `lent/0/${dayOfWeek}`,
      specialDay: daysBetween(ashWed, d) === 0 ? 'ash-wednesday' : undefined,
    }
  }

  // ── Holy Week (Palm Sunday through Holy Saturday) ──
  if (dateOnOrAfter(d, palmSunday) && dateBefore(d, easter)) {
    const dayOfWeek = d.getDay()
    let specialDay: string | undefined
    if (daysBetween(palmSunday, d) === 0) specialDay = 'palm-sunday'
    else if (daysBetween(addDays(easter, -3), d) === 0) specialDay = 'holy-thursday'
    else if (daysBetween(addDays(easter, -2), d) === 0) specialDay = 'good-friday'
    else if (daysBetween(addDays(easter, -1), d) === 0) specialDay = 'holy-saturday'

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

  // ── Pentecost Sunday ──
  if (daysBetween(pentecost, d) === 0) {
    return {
      season: 'easter',
      week: 8,
      dayOfWeek: 0,
      key: 'easter/8/0',
      specialDay: 'pentecost',
    }
  }

  // ── Easter season (Easter Monday through Saturday before Pentecost) ──
  if (dateOnOrAfter(d, addDays(easter, 1)) && dateBefore(d, pentecost)) {
    const { week, dayOfWeek } = weekAndDay(easter, d)
    let specialDay: string | undefined
    if (daysBetween(addDays(easter, 39), d) === 0) specialDay = 'ascension'
    return { season: 'easter', week, dayOfWeek, key: `easter/${week}/${dayOfWeek}`, specialDay }
  }

  // ── Ordinary Time I (day after Baptism through day before Ash Wednesday) ──
  // Count from Baptism Sunday so that the first Sunday after Baptism = Week 2
  // (there is no "1st Sunday of OT" — Baptism replaces it)
  if (dateOnOrAfter(d, baptismNext) && dateBefore(d, ashWed)) {
    const { week, dayOfWeek } = weekAndDay(baptism, d)
    return { season: 'ordinary', week, dayOfWeek, key: `ordinary/${week}/${dayOfWeek}` }
  }

  // ── Ordinary Time II (day after Pentecost through day before Advent) ──
  // Week numbering counts backward: the last week before Advent is always 34.
  const otIIStart = addDays(pentecost, 1)
  if (dateOnOrAfter(d, otIIStart) && dateBefore(d, adventStart)) {
    const dayOfWeek = d.getDay()
    // Find the Sunday of this liturgical week
    const weekSunday = addDays(d, -dayOfWeek)
    // Christ the King is always the 34th (last) Sunday of OT
    const lastOTSunday = addDays(adventStart, -7)
    const weeksFromEnd = daysBetween(weekSunday, lastOTSunday) / 7
    const week = 34 - weeksFromEnd

    let specialDay: string | undefined
    // Trinity Sunday: sunday after Pentecost (easter + 56)
    if (daysBetween(addDays(easter, 56), d) === 0) specialDay = 'trinity-sunday'
    // Corpus Christi: thursday after Trinity (easter + 60)
    if (daysBetween(addDays(easter, 60), d) === 0) specialDay = 'corpus-christi'
    // Sacred Heart: friday of 2nd week after Pentecost (easter + 68)
    if (daysBetween(addDays(easter, 68), d) === 0) specialDay = 'sacred-heart'

    return { season: 'ordinary', week, dayOfWeek, key: `ordinary/${week}/${dayOfWeek}`, specialDay }
  }

  // Fallback (should not be reached)
  return { season: 'ordinary', week: 1, dayOfWeek: d.getDay(), key: `ordinary/1/${d.getDay()}` }
}
