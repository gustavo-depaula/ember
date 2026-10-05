import type { Locale } from './locale'
import { addDays, today } from './today'

/** Days before and after the build day that get full Mass and Office pages. */
export const liturgyWindow = { past: 14, future: 120 }

export function liturgyDates(): Date[] {
  const out: Date[] = []
  for (let offset = -liturgyWindow.past; offset <= liturgyWindow.future; offset++) {
    out.push(addDays(today, offset))
  }
  return out
}

export function inLiturgyWindow(date: Date): boolean {
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  return days >= -liturgyWindow.past && days <= liturgyWindow.future
}

/** The calendar covers the current year and the next, month by month and day by day. */
export function calendarYears(): number[] {
  return [today.getFullYear(), today.getFullYear() + 1]
}

export function longDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function monthName(year: number, month: number, locale: Locale): string {
  const name = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function shortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date)
}
