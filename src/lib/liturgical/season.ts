import { addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns'

export type LiturgicalSeason = 'advent' | 'christmas' | 'easter' | 'ordinary'

export function computeEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

export function getFirstSundayOfAdvent(year: number): Date {
  const nov27 = new Date(year, 10, 27)
  const dayOfWeek = nov27.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  return addDays(nov27, daysUntilSunday)
}

function dateOnOrBefore(date: Date, boundary: Date): boolean {
  return isBefore(date, boundary) || isEqual(startOfDay(date), startOfDay(boundary))
}

function dateOnOrAfter(date: Date, boundary: Date): boolean {
  return isAfter(date, boundary) || isEqual(startOfDay(date), startOfDay(boundary))
}

export function getLiturgicalSeason(date: Date): LiturgicalSeason {
  const year = date.getFullYear()
  const d = startOfDay(date)

  const feb1 = new Date(year, 1, 1)
  const feb2 = new Date(year, 1, 2)
  const easter = computeEaster(year)
  const holyWednesday = addDays(easter, -4)
  const pentecost = addDays(easter, 49)
  const adventStart = getFirstSundayOfAdvent(year)

  // Advent of current year through Feb 1 of next year
  if (dateOnOrAfter(d, adventStart)) return 'advent'

  // Jan 1 through Feb 1 — still in previous year's advent/Alma Redemptoris season
  if (dateOnOrBefore(d, feb1)) return 'advent'

  // Feb 2 through Holy Wednesday
  if (dateOnOrAfter(d, feb2) && dateOnOrBefore(d, holyWednesday)) return 'christmas'

  // Easter through Pentecost
  if (dateOnOrAfter(d, easter) && dateOnOrBefore(d, pentecost)) return 'easter'

  // Everything else
  return 'ordinary'
}
