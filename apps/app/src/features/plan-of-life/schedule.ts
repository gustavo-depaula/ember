import { differenceInCalendarDays, parseISO } from 'date-fns'

import type { DayCalendar, LiturgicalSeason } from '@/lib/liturgical'

export type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  // `n` counts from the month's start (1–4) or, as -1, its last such weekday.
  | { type: 'nth-weekday'; n: number[]; day: number }
  | { type: 'fixed-program'; totalDays: number; startDate: string }
  | { type: 'periodic-series'; rule: ScheduleRule; totalOccurrences: number; startDate: string }
  | { type: 'holy-days-of-obligation' }

export type ScheduleContext = {
  season?: LiturgicalSeason
  dayCalendar?: DayCalendar
}

export function parseSchedule(json: string): Schedule {
  return normalizeSchedule(JSON.parse(json))
}

type LegacySchedule =
  | Schedule
  | ({ type: 'nth-weekday'; n: number; day: number } & Pick<Schedule, 'seasons'>)
  | ({ type: 'times-per'; count: number; period: 'week' | 'month' } & Pick<Schedule, 'seasons'>)

/**
 * Reads schedules stored before `nth-weekday` took a list of weeks and before
 * "N times a week/month" gave way to fixed days — a rule has to name its days
 * to land on the day's plan. The old quota becomes Saturdays: one a week, or
 * the 1st (and 3rd) of the month; the next edit stores the concrete rule.
 */
export function normalizeSchedule(raw: LegacySchedule): Schedule {
  if (raw.type === 'nth-weekday' && typeof raw.n === 'number') return { ...raw, n: [raw.n] }
  if (raw.type === 'periodic-series') {
    return { ...raw, rule: normalizeSchedule(raw.rule as LegacySchedule) as ScheduleRule }
  }
  if (raw.type !== 'times-per') return raw as Schedule
  const { count, period, seasons } = raw
  const base = seasons?.length ? { seasons } : {}
  if (period === 'week') {
    const spread = [[6], [2, 6], [1, 3, 5], [1, 3, 5, 6], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]]
    const days = spread[Math.min(count, 6) - 1]
    return days ? { type: 'days-of-week', days, ...base } : { type: 'daily', ...base }
  }
  return { type: 'nth-weekday', n: count >= 2 ? [1, 3] : [1], day: 6, ...base }
}

export function isApplicableOn(schedule: Schedule, date: Date, ctx?: ScheduleContext): boolean {
  if (schedule.seasons?.length && ctx?.season && !schedule.seasons.includes(ctx.season)) {
    return false
  }

  switch (schedule.type) {
    case 'daily':
      return true

    case 'days-of-week':
      return schedule.days.includes(date.getDay())

    case 'day-of-month':
      return schedule.days.includes(date.getDate())

    case 'nth-weekday':
      return schedule.n.some((n) => isNthWeekdayOfMonth(date, n, schedule.day))

    case 'fixed-program': {
      if (!schedule.startDate) return false
      const start = parseISO(schedule.startDate)
      const dayIndex = differenceInCalendarDays(date, start)
      return dayIndex >= 0 && dayIndex < schedule.totalDays
    }

    case 'periodic-series': {
      if (!schedule.startDate) return false
      const seriesStart = parseISO(schedule.startDate)
      if (date < seriesStart) return false
      return isApplicableOn({ ...schedule.rule, seasons: schedule.seasons } as Schedule, date, ctx)
    }

    case 'holy-days-of-obligation':
      return ctx?.dayCalendar?.principal?.entry.holyDayOfObligation === true

    default:
      return false
  }
}

export function getProgramDay(schedule: Schedule, date: Date): number | undefined {
  if (schedule.type !== 'fixed-program' || !schedule.startDate) return undefined
  const start = parseISO(schedule.startDate)
  const day = differenceInCalendarDays(date, start)
  return day >= 0 && day < schedule.totalDays ? day : undefined
}

function isNthWeekdayOfMonth(date: Date, n: number, weekday: number): boolean {
  if (date.getDay() !== weekday) return false

  const dayOfMonth = date.getDate()

  if (n > 0) {
    // Nth from start: 1st Friday means day 1-7, 2nd Friday means day 8-14, etc.
    const occurrence = Math.ceil(dayOfMonth / 7)
    return occurrence === n
  }

  if (n === -1) {
    // Last occurrence: check if adding 7 days would leave the month
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    return dayOfMonth + 7 > daysInMonth
  }

  return false
}

function getNthWeekdayDateOfMonth(year: number, month: number, n: number, weekday: number): Date {
  if (n === -1) {
    const last = new Date(year, month + 1, 0)
    return new Date(year, month, last.getDate() - ((last.getDay() - weekday + 7) % 7))
  }
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekdayOffset = (weekday - firstOfMonth.getDay() + 7) % 7
  const day = 1 + firstWeekdayOffset + (n - 1) * 7
  return new Date(year, month, day)
}

function generateOccurrences(schedule: Schedule, start: Date, count: number): Date[] {
  if (schedule.type !== 'nth-weekday') return []

  const occurrences: Date[] = []
  let year = start.getFullYear()
  let month = start.getMonth()
  const maxMonths = count + 12

  const weeks = [...schedule.n].sort((a, b) => a - b)
  for (let i = 0; i < maxMonths && occurrences.length < count; i++) {
    for (const n of weeks) {
      const occ = getNthWeekdayDateOfMonth(year, month, n, schedule.day)
      if (differenceInCalendarDays(occ, start) >= 0 && occurrences.length < count) {
        occurrences.push(occ)
      }
    }
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return occurrences
}

export function getOccurrenceBasedProgramDay(
  schedule: Schedule,
  startedAt: string,
  today: Date,
  totalOccurrences: number,
): number | undefined {
  const start = parseISO(startedAt)
  const occurrences = generateOccurrences(schedule, start, totalOccurrences)

  if (occurrences.length === 0) return undefined

  if (differenceInCalendarDays(today, occurrences[0]) < 0) return undefined

  // Count occurrences strictly before today (occurrences are chronological)
  let passed = 0
  for (const occ of occurrences) {
    if (differenceInCalendarDays(today, occ) <= 0) break
    passed++
  }

  // All occurrences have passed — program window ended
  if (passed >= totalOccurrences) return undefined

  return passed
}
