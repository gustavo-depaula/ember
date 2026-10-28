import { addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns'
import { computeEaster, getFirstSundayOfAdvent } from './computus'
import { baptismOfTheLord, type Transfers, temporalDay, universalTransfers } from './of-temporal'

export { computeEaster, getFirstSundayOfAdvent }

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

export function getAshWednesday(year: number): Date {
  return addDays(computeEaster(year), -46)
}

// The Baptism of the Lord in the General Calendar: the Sunday after 6 January.
export function getBaptismOfTheLord(year: number): Date {
  return startOfDay(baptismOfTheLord(year, universalTransfers))
}

export function getSeptuagesimaSunday(year: number): Date {
  return addDays(computeEaster(year), -63)
}

// The Ordinary Form's season is read off its temporal cycle, the same one the
// Mass of the day comes from. Holy Week is part of Lent here.
function getOfSeason(date: Date, transfers: Transfers): LiturgicalSeason {
  const season = temporalDay(date, transfers).season
  if (season === 'holy-week') return 'lent'
  return season === 'ordinary-time' ? 'ordinary' : season
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
  transfers: Transfers = universalTransfers,
): LiturgicalSeason {
  return form === 'ef' ? getEfSeason(date) : getOfSeason(date, transfers)
}
