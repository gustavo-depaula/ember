// The Ember days of a year, from the same week reckoning that picks the day's
// Mass and Office (getweek, monthday) — the one place the app learns their
// dates. Needs no data files, so a program or the fast can ask for a year's
// twelve days without resolving the calendar.

import { dayOfWeek, getweek, monthday, ydaysToDate } from './date'

export type EmberSeason = 'lent' | 'pentecost' | 'september' | 'advent'

export type EmberWeek = {
  season: EmberSeason
  // Wednesday, Friday and Saturday of the one week, as 'yyyy-MM-dd'.
  days: [string, string, string]
}

const seasonOfWeek: Record<string, EmberSeason> = {
  Quad1: 'lent',
  Pasc7: 'pentecost',
  Adv3: 'advent',
}

function emberSeason(
  day: number,
  month: number,
  year: number,
  version: string,
): EmberSeason | undefined {
  const season = seasonOfWeek[getweek(day, month, year)]
  if (season) return season
  // September keeps them in the week of its third Sunday; which Sunday is the
  // month's first changed in 1960, and monthday follows the version.
  return monthday(day, month, year, /196/.test(version)).startsWith('093-')
    ? 'september'
    : undefined
}

function dateKey(ydays: number, year: number): string {
  const { day, month } = ydaysToDate(ydays, year)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// The four Ember weeks of a civil year, in order.
export function emberDays(year: number, version: string): EmberWeek[] {
  const weeks: EmberWeek[] = []
  for (let ydays = 1; ydays <= 365; ydays++) {
    const { day, month } = ydaysToDate(ydays, year)
    if (dayOfWeek(day, month, year) !== 3) continue
    const season = emberSeason(day, month, year, version)
    if (!season) continue
    weeks.push({
      season,
      days: [dateKey(ydays, year), dateKey(ydays + 2, year), dateKey(ydays + 3, year)],
    })
  }
  return weeks
}
