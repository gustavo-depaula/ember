import { type EmberSeason, type EmberWeek, efVersion, emberDays } from '@ember/divinum-officium'
import { format } from 'date-fns'

export type { EmberSeason, EmberWeek }

// A plan asks whether a day is an Ember day for every day it draws, and the
// reckoning walks the whole year, so each year is worked out once.
const weeksByYear = new Map<number, EmberWeek[]>()

/** The four Ember weeks of a civil year, as the 1962 missal keeps them. */
export function emberWeeks(year: number): EmberWeek[] {
  const known = weeksByYear.get(year)
  if (known) return known
  const weeks = emberDays(year, efVersion)
  weeksByYear.set(year, weeks)
  return weeks
}

/** The Ember week `date` is one of the three days of, and which of them it is. */
export function emberWeekOn(date: Date): (EmberWeek & { day: 0 | 1 | 2 }) | undefined {
  const key = format(date, 'yyyy-MM-dd')
  for (const week of emberWeeks(date.getFullYear())) {
    const day = week.days.indexOf(key)
    if (day !== -1) return { ...week, day: day as 0 | 1 | 2 }
  }
  return undefined
}

/** The Ember week under way on `date` or the next to come; of `season`, if one is named. */
export function nextEmberWeek(date: Date, season?: EmberSeason): EmberWeek {
  const key = format(date, 'yyyy-MM-dd')
  const year = date.getFullYear()
  const week = [...emberWeeks(year), ...emberWeeks(year + 1)].find(
    (w) => w.days[2] >= key && (!season || w.season === season),
  )
  // Every year has all four, so the year after always holds one still ahead.
  if (!week) throw new Error(`no Ember week after ${key}`)
  return week
}
