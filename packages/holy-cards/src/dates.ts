import type { IsoDate } from './types'

// Dates are local civil days. Parsing builds a local-midnight Date, so the
// calendar (which reads getFullYear/getMonth/getDate) sees the same day.
export function toDate(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Hand-rolled rather than date-fns `format`, which tokenizes its pattern on
// every call: season windows format every day of the year.
export function toIso(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = toDate(date)
  d.setDate(d.getDate() + days)
  return toIso(d)
}

export function yearOf(date: IsoDate): number {
  return Number(date.slice(0, 4))
}

/** Every day from `start` to `end`, both included. */
export function eachDay(start: IsoDate, end: IsoDate): IsoDate[] {
  const days: IsoDate[] = []
  for (const d = toDate(start); toIso(d) <= end; d.setDate(d.getDate() + 1)) days.push(toIso(d))
  return days
}

export function isSunday(date: IsoDate): boolean {
  return toDate(date).getDay() === 0
}

/** Ascending order for ISO dates and ASCII ids; `localeCompare` is slow on Hermes. */
export function ascending(a: string, b: string): number {
  if (a < b) return -1
  return a > b ? 1 : 0
}
