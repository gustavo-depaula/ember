import type { ProgramConfig } from '@/content/manifest-types'

import {
  type Schedule,
  getOccurrenceBasedProgramDay,
  getProgramDay,
} from './schedule'

// --- Types ---

export type ProgramProgress = {
  programDay: number
  totalDays: number
  isComplete: boolean
  policy: ProgramConfig['progressPolicy']
  completionBehavior: ProgramConfig['completionBehavior']
  missedDays: number
  shouldPromptRestart: boolean
}

export type DayState = {
  isMissed: boolean
  isCurrent: boolean
  isCompleted: boolean
  isFuture: boolean
}

// --- Calendar day resolution ---

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

// --- Progress computation ---

export function computeProgramProgress(params: {
  program: ProgramConfig
  completionCount: number
  calendarDay: number | undefined
  cursorStatus: 'active' | 'completed'
}): ProgramProgress {
  const { program, completionCount, calendarDay, cursorStatus } = params

  let programDay = completionCount
  if (
    (program.progressPolicy === 'continue' || program.progressPolicy === 'restart') &&
    calendarDay !== undefined
  ) {
    programDay = calendarDay
  }

  const missedDays = computeMissedDays(program.progressPolicy, calendarDay, completionCount)
  const shouldPromptRestart = computeShouldRestart(
    program.progressPolicy,
    missedDays,
    program.restartThreshold ?? 1,
  )

  return {
    programDay,
    totalDays: program.totalDays,
    isComplete: cursorStatus === 'completed',
    policy: program.progressPolicy,
    completionBehavior: program.completionBehavior,
    missedDays,
    shouldPromptRestart,
  }
}

// --- Missed days ---

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

// --- Day states ---

export function computeDayState(dayIndex: number, progress: ProgramProgress): DayState {
  const { programDay, missedDays, policy, isComplete, shouldPromptRestart } = progress
  const cursorDay = missedDays > 0 ? programDay - missedDays : programDay
  const isMissed =
    missedDays > 0 && policy !== 'wait' && dayIndex >= cursorDay && dayIndex < programDay
  const isCurrent = dayIndex === programDay && !isComplete && !shouldPromptRestart
  const isCompleted = (isComplete || dayIndex < programDay) && !isMissed
  const isFuture =
    (dayIndex > programDay && !isComplete) || (shouldPromptRestart && dayIndex >= programDay)
  return { isMissed, isCurrent, isCompleted, isFuture }
}

export function computeAllDayStates(progress: ProgramProgress): DayState[] {
  return Array.from({ length: progress.totalDays }, (_, i) => computeDayState(i, progress))
}

// --- Enrollment ---

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
