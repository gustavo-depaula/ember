import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns'

import type { ProgramConfig } from '@/content/manifestTypes'

import {
  getOccurrenceBasedProgramDay,
  getOccurrencesPassed,
  getProgramDay,
  isApplicableOn,
  type Schedule,
} from './schedule'

export type ProgramProgress = {
  programDay: number
  totalDays: number
  completionCount: number
  isComplete: boolean
  policy: ProgramConfig['progressPolicy']
  completionBehavior: ProgramConfig['completionBehavior']
  missedDays: number
  shouldPromptRestart: boolean
  isProjection: boolean
}

export type ProjectedProgramState = ProgramProgress & {
  visible: boolean
}

export type DayState = {
  isMissed: boolean
  isCurrent: boolean
  isCompleted: boolean
  isFuture: boolean
}

export function resolveCalendarDay(
  schedule: Schedule,
  cursor: { started_at: string } | null,
  today: Date,
  totalDays: number,
): number | undefined {
  if (schedule.type === 'fixed-program') return getProgramDay(schedule, today)
  if (cursor) return getOccurrenceBasedProgramDay(schedule, cursor.started_at, today, totalDays)
  return undefined
}

export function computeProgramProgress(params: {
  program: ProgramConfig
  completionCount: number
  calendarDay: number | undefined
}): ProgramProgress {
  const { program, completionCount, calendarDay } = params
  const isComplete = completionCount >= program.totalDays

  let programDay = completionCount
  if (
    (program.progressPolicy === 'continue' || program.progressPolicy === 'restart') &&
    calendarDay !== undefined
  ) {
    programDay = calendarDay
  }
  programDay = Math.min(programDay, program.totalDays - 1)

  const missedDays = computeMissedDays(program.progressPolicy, calendarDay, completionCount)
  const shouldPromptRestart = isComplete
    ? false
    : computeShouldRestart(program.progressPolicy, missedDays, program.restartThreshold ?? 1)

  return {
    programDay,
    totalDays: program.totalDays,
    completionCount,
    isComplete,
    policy: program.progressPolicy,
    completionBehavior: program.completionBehavior,
    missedDays,
    shouldPromptRestart,
    isProjection: false,
  }
}

/**
 * Compute a program's state as it would appear on `targetDate`, given the
 * user's real present (`realToday`). Forward dates project on the assumption
 * the user stays on track — for `wait` policy this means today's completion
 * count plus the gap to the target. Diagnostics that describe real state
 * (`missedDays`, `shouldPromptRestart`) are zeroed on projected dates.
 *
 * `visible` answers the plan-of-life filter: hide before start, hide after
 * the program's projected end.
 */
export function projectProgramAtDate(args: {
  program: ProgramConfig
  schedule: Schedule
  cursor: { started_at: string } | null
  completionDatesAsc: string[]
  realToday: Date
  targetDate: Date
}): ProjectedProgramState {
  const { program, schedule, cursor, completionDatesAsc, realToday, targetDate } = args
  const totalDays = program.totalDays
  const target = startOfDay(targetDate)
  const today = startOfDay(realToday)
  const isProjection = differenceInCalendarDays(target, today) > 0
  const policy = program.progressPolicy

  const empty: ProjectedProgramState = {
    visible: false,
    programDay: 0,
    totalDays,
    completionCount: 0,
    isComplete: false,
    policy,
    completionBehavior: program.completionBehavior,
    missedDays: 0,
    shouldPromptRestart: false,
    isProjection,
  }

  if (!cursor) return empty
  const startedAt = parseISO(cursor.started_at)
  if (differenceInCalendarDays(target, startedAt) < 0) return empty

  // A program bound to dates of its own (the First Fridays) is kept only on
  // those dates: a prayer on another day doesn't make up for one missed.
  const onItsDays = schedule.type === 'nth-weekday' || schedule.type === 'day-of-month'
  const countUpTo = (d: Date) => {
    const startStr = cursor.started_at
    const upTo = format(d, 'yyyy-MM-dd')
    const kept = completionDatesAsc.filter(
      (c) => c >= startStr && c <= upTo && (!onItsDays || isApplicableOn(schedule, parseISO(c))),
    )
    return onItsDays ? new Set(kept).size : kept.length
  }

  if (policy === 'wait') {
    const baseCount = countUpTo(today)
    const rawProgramDay = isProjection
      ? baseCount + differenceInCalendarDays(target, today)
      : countUpTo(target)
    const isComplete = rawProgramDay >= totalDays
    const programDay = Math.min(rawProgramDay, totalDays - 1)
    return {
      ...empty,
      visible: !isComplete,
      programDay,
      completionCount: baseCount,
      isComplete,
    }
  }

  // continue / restart: calendar-anchored — the days already gone by. Past the
  // program's window every day has gone by, and it rests on its last: complete
  // once every day was kept, otherwise with the days it missed.
  const daysPassed = (() => {
    if (schedule.type === 'fixed-program') {
      const since = differenceInCalendarDays(target, parseISO(schedule.startDate))
      return since < 0 ? undefined : Math.min(since, totalDays)
    }
    return getOccurrencesPassed(schedule, cursor.started_at, target, totalDays)
  })()
  if (daysPassed === undefined) return empty
  const pastWindow = daysPassed >= totalDays
  const calendarDay = daysPassed

  const baseCount = countUpTo(today)
  const programDay = Math.min(calendarDay, totalDays - 1)
  const isComplete = baseCount >= totalDays

  let missedDays = 0
  let shouldPromptRestart = false
  if (!isProjection && !isComplete) {
    missedDays = computeMissedDays(policy, calendarDay, baseCount)
    shouldPromptRestart = computeShouldRestart(policy, missedDays, program.restartThreshold ?? 1)
  }

  return {
    ...empty,
    visible: !isComplete && !pastWindow,
    programDay,
    completionCount: baseCount,
    isComplete,
    missedDays,
    shouldPromptRestart,
  }
}

export function computeMissedDays(
  policy: ProgramConfig['progressPolicy'],
  calendarDay: number | undefined,
  completionCount: number,
): number {
  if (policy === 'wait') return 0
  if (calendarDay === undefined) return 0
  const gap = calendarDay - completionCount
  return gap > 0 ? gap : 0
}

export function computeShouldRestart(
  policy: ProgramConfig['progressPolicy'],
  missedDays: number,
  restartThreshold: number,
): boolean {
  return policy === 'restart' && missedDays >= restartThreshold
}

// The days kept come first, then the days missed, then today's: a count of
// prayers can't say which day each one was, only how many.
export function computeDayState(dayIndex: number, progress: ProgramProgress): DayState {
  const { programDay, missedDays, policy, isComplete, shouldPromptRestart, completionCount } =
    progress
  const kept = Math.min(completionCount, progress.totalDays)
  const isMissed =
    policy !== 'wait' && !isComplete && dayIndex >= kept && dayIndex < kept + missedDays
  const isCompleted = isComplete || (!isMissed && dayIndex < Math.max(kept, programDay))
  const isCurrent = dayIndex === programDay && !isComplete && !shouldPromptRestart && !isMissed
  const isFuture = !isCompleted && !isMissed && !isCurrent
  return { isMissed, isCurrent, isCompleted, isFuture }
}

export function computeAllDayStates(progress: ProgramProgress): DayState[] {
  return Array.from({ length: progress.totalDays }, (_, i) => computeDayState(i, progress))
}

export function selectEnrollmentSchedule(
  policy: ProgramConfig['progressPolicy'],
  defaultSchedule: Schedule,
  totalDays: number,
  startDate: string,
): Schedule {
  if (policy === 'wait') return defaultSchedule
  if (defaultSchedule.type === 'nth-weekday' || defaultSchedule.type === 'day-of-month')
    return defaultSchedule
  return { type: 'fixed-program', totalDays, startDate }
}

// Long enough for a monthly devotion of a few dozen days; a holy-day rule can't
// be decided without the calendar and leaves its days undated.
const dateSearchDays = 3 * 366

/**
 * The date each of a program's days falls on, 'yyyy-MM-dd'. A program that
 * waits for its prayers dates the days already prayed by their prayer and the
 * rest from today on; a calendar-bound one counts its days from the start.
 */
export function programDayDates(args: {
  program: ProgramConfig
  schedule: Schedule
  startedAt: string | undefined
  completionDatesAsc: string[]
  today: Date
}): (string | undefined)[] {
  const { program, schedule, startedAt, completionDatesAsc, today } = args
  const key = (d: Date) => format(d, 'yyyy-MM-dd')
  const walk = (from: Date, count: number) => {
    const dates: string[] = []
    for (let i = 0; dates.length < count && i < dateSearchDays; i++) {
      const d = addDays(from, i)
      if (isApplicableOn(schedule, d)) dates.push(key(d))
    }
    return dates
  }
  const pad = (dates: string[]) =>
    Array.from({ length: program.totalDays }, (_, i) => dates[i] as string | undefined)

  if (program.progressPolicy !== 'wait') {
    const anchor = schedule.type === 'fixed-program' ? schedule.startDate : startedAt
    return pad(walk(anchor ? parseISO(anchor) : startOfDay(today), program.totalDays))
  }
  const prayed = completionDatesAsc.filter((d) => !startedAt || d >= startedAt)
  const from = prayed.includes(key(today)) ? addDays(startOfDay(today), 1) : startOfDay(today)
  return pad([...prayed, ...walk(from, Math.max(program.totalDays - prayed.length, 0))])
}

// A program finished or ended stays under way this long past its last day.
const settledAfterDays = 7

/**
 * Whether a program still belongs among those under way: running, or finished
 * or ended within the last week, so its end is seen before it goes.
 */
export function isUnderWay(args: {
  program: ProgramConfig
  schedule: Schedule
  cursor: { started_at: string } | null
  completionDatesAsc: string[]
  today: Date
}): boolean {
  const { program, schedule, cursor, completionDatesAsc, today } = args
  const state = projectProgramAtDate({ ...args, realToday: today, targetDate: today })
  const settled =
    state.isComplete || computeAllDayStates(state).every((d) => d.isCompleted || d.isMissed)
  if (!settled) return true
  const dates = programDayDates({
    program,
    schedule,
    startedAt: cursor?.started_at,
    completionDatesAsc,
    today,
  })
  const last = [dates.at(-1), completionDatesAsc.at(-1)].filter(Boolean).sort().at(-1)
  return !last || differenceInCalendarDays(today, parseISO(last)) <= settledAfterDays
}
