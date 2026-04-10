import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import type { DayCalendar, LiturgicalSeason } from '@/lib/liturgical'

// --- Types ---

export type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  | { type: 'nth-weekday'; n: number; day: number }
  | { type: 'times-per'; count: number; period: 'week' | 'month' }
  | { type: 'fixed-program'; totalDays: number; startDate: string }
  | { type: 'periodic-series'; rule: ScheduleRule; totalOccurrences: number; startDate: string }
  | { type: 'holy-days-of-obligation' }

export type ScheduleContext = {
  season?: LiturgicalSeason
  dayCalendar?: DayCalendar
}

// --- Parsing ---

export function parseSchedule(json: string): Schedule {
  return JSON.parse(json) as Schedule
}

// --- Evaluation ---

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
      return isNthWeekdayOfMonth(date, schedule.n, schedule.day)

    case 'times-per':
      return true

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

export function isFaithful(
  schedule: Schedule,
  completionsOnDate: number,
  completionsInPeriod: number,
): boolean {
  if (schedule.type === 'times-per') {
    return completionsInPeriod >= schedule.count
  }
  return completionsOnDate > 0
}

// --- Period helpers ---

export function getPeriodBounds(date: Date, period: 'week' | 'month'): { start: Date; end: Date } {
  if (period === 'week') {
    return {
      start: startOfWeek(date, { weekStartsOn: 0 }),
      end: endOfWeek(date, { weekStartsOn: 0 }),
    }
  }
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

// --- Program helpers ---

export function getProgramDay(schedule: Schedule, date: Date): number | undefined {
  if (schedule.type !== 'fixed-program' || !schedule.startDate) return undefined
  const start = parseISO(schedule.startDate)
  const day = differenceInCalendarDays(date, start)
  return day >= 0 && day < schedule.totalDays ? day : undefined
}

// --- Nth weekday helpers ---

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
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekdayOffset = (weekday - firstOfMonth.getDay() + 7) % 7
  const day = 1 + firstWeekdayOffset + (n - 1) * 7
  return new Date(year, month, day)
}

// --- Occurrence-based program helpers ---

function generateOccurrences(schedule: Schedule, start: Date, count: number): Date[] {
  if (schedule.type !== 'nth-weekday') return []

  const occurrences: Date[] = []
  let year = start.getFullYear()
  let month = start.getMonth()
  const maxMonths = count + 12

  for (let i = 0; i < maxMonths && occurrences.length < count; i++) {
    const occ = getNthWeekdayDateOfMonth(year, month, schedule.n, schedule.day)
    if (differenceInCalendarDays(occ, start) >= 0) {
      occurrences.push(occ)
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

  // Before first occurrence
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
