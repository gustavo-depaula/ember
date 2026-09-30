import { addDays as addDaysToDate, format } from 'date-fns'
import type { IsoDate } from './types'

// Dates are local civil days. Parsing builds a local-midnight Date, so the
// calendar (which reads getFullYear/getMonth/getDate) sees the same day.
export function toDate(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIso(date: Date): IsoDate {
  return format(date, 'yyyy-MM-dd')
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return toIso(addDaysToDate(toDate(date), days))
}

export function yearOf(date: IsoDate): number {
  return Number(date.slice(0, 4))
}

/** Every day from `start` to `end`, both included. */
export function daysBetween(start: IsoDate, end: IsoDate): IsoDate[] {
  const days: IsoDate[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  return days
}

export function isSunday(date: IsoDate): boolean {
  return toDate(date).getDay() === 0
}
