import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import type { LiturgicalSeason } from '@/lib/liturgical/season'

// --- Types ---

export type Notification = {
  at: string // 'HH:MM'
  days?: number[] // optional: only on these days (subset of schedule days)
}

export type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]
  notify?: Notification[]
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  | { type: 'nth-weekday'; n: number; day: number }
  | { type: 'times-per'; count: number; period: 'week' | 'month' }
  | { type: 'fixed-program'; totalDays: number; startDate: string }

// --- Parsing ---

export function parseSchedule(json: string): Schedule {
  return JSON.parse(json) as Schedule
}

// --- Evaluation ---

export function isApplicableOn(schedule: Schedule, date: Date, season?: LiturgicalSeason): boolean {
  if (schedule.seasons?.length && season && !schedule.seasons.includes(season)) {
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

// --- Nth weekday helper ---

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

// --- Migration helper ---

export function migrateFrequencyToSchedule(
  frequency: string,
  frequencyDays: string,
  notifyEnabled: number,
  notifyTime: string | null,
): Schedule {
  const days: number[] = JSON.parse(frequencyDays || '[]')
  const notify: Notification[] | undefined =
    notifyEnabled && notifyTime ? [{ at: notifyTime }] : undefined

  if (frequency === 'daily' || days.length === 0) {
    return { type: 'daily', ...(notify ? { notify } : {}) }
  }

  return {
    type: 'days-of-week',
    days,
    ...(notify ? { notify } : {}),
  }
}
