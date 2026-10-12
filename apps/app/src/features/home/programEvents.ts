import type { Transfers } from '@ember/liturgical'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'

import type { PracticeManifest } from '@/content/manifestTypes'
import {
  computeAllDayStates,
  projectProgramAtDate,
  traditionalStart,
} from '@/features/plan-of-life/program'
import type { Schedule } from '@/features/plan-of-life/schedule'

// A novena is shown once its first day is this near.
export const eventsAheadDays = 14

// The longest thing kept as an event is the 54-day rosary novena; a course of
// months is the plan's business, and would sit in the row for half a year.
const longestEventDays = 54

/**
 * A program on Today's events row: one in the plan, under way or about to
 * begin, or one the calendar is about to bring that could be joined.
 */
export type ProgramEvent = {
  manifest: PracticeManifest
  joined: boolean
  /** Its first day, 'yyyy-MM-dd'; absent for one prayed in turn, which keeps no dates. */
  start?: string
  /** Days until the first; 0 once begun. */
  away: number
  total: number
  /** Once begun: today's day, counted from 1, the days kept, and whether today's is. */
  day?: number
  kept: number
  prayedToday: boolean
  /** A day can be prayed from the row; otherwise its page says what it needs. */
  canPray: boolean
}

/** What the plan holds of a program: the rule it was joined with and its prayers. */
export type JoinedProgram = {
  manifest: PracticeManifest
  schedule: Schedule
  cursor: { started_at: string } | null
  completionDatesAsc: string[]
}

/**
 * The row's programs, those begun first and then by the day each begins. Of
 * the plan's, the novenas and other programs of days in a row not yet
 * finished; of the rest, those whose feast sets a first day within two weeks.
 * A program dated by a rule (the Ember days) keeps its own page of rounds.
 */
export function programEvents({
  joined,
  manifests,
  today,
  transfers,
}: {
  joined: JoinedProgram[]
  /** Every program that could be joined; those in `joined` are passed over. */
  manifests: PracticeManifest[]
  today: Date
  transfers?: Transfers
}): ProgramEvent[] {
  const todayStr = format(today, 'yyyy-MM-dd')
  const inPlan = new Set(joined.map((j) => j.manifest.id))

  const mine = joined.flatMap(
    ({ manifest, schedule, cursor, completionDatesAsc }): ProgramEvent[] => {
      const program = manifest.program
      if (!program || program.days || program.totalDays > longestEventDays) return []
      const waits = program.progressPolicy === 'wait'
      if (schedule.type !== 'fixed-program' && !waits) return []
      const total = program.totalDays
      const start = schedule.type === 'fixed-program' ? schedule.startDate : undefined
      const away = start ? Math.max(0, differenceInCalendarDays(parseISO(start), today)) : 0
      if (away > eventsAheadDays) return []
      const base = { manifest, joined: true, start, away, total }
      if (away > 0) return [{ ...base, kept: 0, prayedToday: false, canPray: false }]

      const state = projectProgramAtDate({
        program,
        schedule,
        cursor,
        completionDatesAsc,
        realToday: today,
        targetDate: today,
      })
      const days = computeAllDayStates(state)
      if (state.isComplete || days.every((d) => d.isCompleted || d.isMissed)) return []
      const kept = days.filter((d) => d.isCompleted).length
      const prayedToday = completionDatesAsc.includes(todayStr)
      // One that waits counts its prayers, so today's prayer already moved it on.
      const day = waits ? Math.min(kept + (prayedToday ? 0 : 1), total) : state.programDay + 1
      const canPray = !prayedToday && !state.shouldPromptRestart
      return [{ ...base, day, kept, prayedToday, canPray }]
    },
  )

  const coming = manifests.flatMap((manifest): ProgramEvent[] => {
    const program = manifest.program
    if (!program || program.days || inPlan.has(manifest.id)) return []
    const start = traditionalStart(program, today, transfers)
    if (!start) return []
    const away = differenceInCalendarDays(parseISO(start), today)
    if (away > eventsAheadDays) return []
    return [
      {
        manifest,
        joined: false,
        start,
        away,
        total: program.totalDays,
        kept: 0,
        prayedToday: false,
        canPray: false,
      },
    ]
  })

  const begun = (e: ProgramEvent) => (e.day === undefined ? 1 : 0)
  return [...mine, ...coming].sort(
    (a, b) =>
      begun(a) - begun(b) ||
      (a.start ?? '').localeCompare(b.start ?? '') ||
      a.manifest.id.localeCompare(b.manifest.id),
  )
}
