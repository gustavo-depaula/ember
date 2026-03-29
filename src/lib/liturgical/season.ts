import { addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns'

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'septuagesima'
  | 'lent'
  | 'easter'
  | 'ordinary'
  | 'post-pentecost'

export type LiturgicalCalendarForm = 'of' | 'ef'

export type LiturgicalColor = 'violet' | 'white' | 'green' | 'rose' | 'red'

const seasonToColor: Record<LiturgicalSeason, LiturgicalColor> = {
  advent: 'violet',
  christmas: 'white',
  epiphany: 'green',
  septuagesima: 'violet',
  lent: 'violet',
  easter: 'white',
  ordinary: 'green',
  'post-pentecost': 'green',
}

export function getLiturgicalColor(season: LiturgicalSeason): LiturgicalColor {
  return seasonToColor[season]
}

export function normalizeDate(date: Date): Date {
  return startOfDay(date)
}

export function dateInRange(d: Date, start: Date, end: Date): boolean {
  const day = normalizeDate(d)
  const s = normalizeDate(start)
  const e = normalizeDate(end)
  return (isAfter(day, s) || isEqual(day, s)) && (isBefore(day, e) || isEqual(day, e))
}

export function dateBefore(d: Date, boundary: Date): boolean {
  return isBefore(normalizeDate(d), normalizeDate(boundary))
}

export function dateOnOrAfter(d: Date, boundary: Date): boolean {
  const day = normalizeDate(d)
  const b = normalizeDate(boundary)
  return isAfter(day, b) || isEqual(day, b)
}

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

export function getAshWednesday(year: number): Date {
  return addDays(computeEaster(year), -46)
}

export function getBaptismOfTheLord(year: number): Date {
  const jan6 = new Date(year, 0, 6)
  const dayOfWeek = jan6.getDay()
  // If Epiphany is Sunday, Baptism is the following Sunday
  if (dayOfWeek === 0) return new Date(year, 0, 13)
  return addDays(jan6, 7 - dayOfWeek)
}

export function getSeptuagesimaSunday(year: number): Date {
  return addDays(computeEaster(year), -63)
}

function getOfSeason(date: Date): LiturgicalSeason {
  const year = date.getFullYear()
  const d = normalizeDate(date)

  const adventStart = getFirstSundayOfAdvent(year)
  const dec25 = new Date(year, 11, 25)
  const easter = computeEaster(year)
  const ashWed = addDays(easter, -46)
  const pentecost = addDays(easter, 49)

  if (dateOnOrAfter(d, dec25)) return 'christmas'
  if (dateOnOrAfter(d, adventStart)) return 'advent'

  const baptism = getBaptismOfTheLord(year)
  if (dateBefore(d, addDays(baptism, 1))) return 'christmas'
  if (dateBefore(d, ashWed)) return 'ordinary'
  if (dateBefore(d, easter)) return 'lent'
  if (dateInRange(d, easter, pentecost)) return 'easter'

  return 'ordinary'
}

function getEfSeason(date: Date): LiturgicalSeason {
  const year = date.getFullYear()
  const d = normalizeDate(date)

  const adventStart = getFirstSundayOfAdvent(year)
  const dec25 = new Date(year, 11, 25)
  const easter = computeEaster(year)
  const ashWed = addDays(easter, -46)
  const septuagesima = addDays(easter, -63)
  const pentecostSaturday = addDays(easter, 55)

  if (dateOnOrAfter(d, dec25)) return 'christmas'
  if (dateOnOrAfter(d, adventStart)) return 'advent'

  const jan13 = new Date(year, 0, 13)
  if (dateInRange(d, new Date(year, 0, 1), jan13)) return 'christmas'
  if (dateBefore(d, septuagesima)) return 'epiphany'
  if (dateBefore(d, ashWed)) return 'septuagesima'
  if (dateBefore(d, easter)) return 'lent'
  if (dateInRange(d, easter, pentecostSaturday)) return 'easter'

  return 'post-pentecost'
}

export function getLiturgicalSeason(
  date: Date,
  form: LiturgicalCalendarForm = 'of',
): LiturgicalSeason {
  return form === 'ef' ? getEfSeason(date) : getOfSeason(date)
}
