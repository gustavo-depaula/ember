import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfDay,
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

/**
 * Whether a rule's occurrences can be laid out from a start date alone. The rest
 * need the liturgical calendar (`holy-days-of-obligation`, and any rule limited
 * to seasons) or don't fall on determinate days at all (`times-per`), so a
 * program running on one of those has no calendar day — the caller falls back to
 * counting completions.
 */
const enumerableByType = {
  daily: true,
  'days-of-week': true,
  'day-of-month': true,
  'nth-weekday': true,
  // Needs the liturgical calendar.
  'holy-days-of-obligation': false,
  // Falls on no determinate day.
  'times-per': false,
  // Carry their own start date and window; the caller resolves them directly.
  'fixed-program': false,
  'periodic-series': false,
} satisfies Record<ScheduleRule['type'], boolean>

function isEnumerable(schedule: Schedule): boolean {
  // A season-limited rule needs the calendar even when its base rule doesn't.
  if (schedule.seasons?.length) return false
  return enumerableByType[schedule.type]
}

function generateNthWeekdayOccurrences(
  schedule: Extract<ScheduleRule, { type: 'nth-weekday' }>,
  start: Date,
  count: number,
): Date[] {
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

function generateOccurrences(schedule: Schedule, start: Date, count: number): Date[] {
  if (!isEnumerable(schedule)) return []
  // Month-stepping is much cheaper than walking every day for a monthly rule.
  if (schedule.type === 'nth-weekday') return generateNthWeekdayOccurrences(schedule, start, count)

  // Walk forward from the start, keeping the days the rule falls on. The bound
  // stops a rule that matches rarely — or never, e.g. `day-of-month: [31]` — from
  // spinning: no month-based rule needs more than ~31 days per occurrence.
  const occurrences: Date[] = []
  const from = startOfDay(start)
  const maxDays = count * 31 + 366
  for (let i = 0; i < maxDays && occurrences.length < count; i++) {
    const day = addDays(from, i)
    if (isApplicableOn(schedule, day)) occurrences.push(day)
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
