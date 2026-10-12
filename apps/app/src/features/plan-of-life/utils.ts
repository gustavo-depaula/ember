import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { resolveCompletions, useEventStore } from '@/db/events'
import type { Completion } from '@/db/schema'

import { programCursor, projectProgramAtDate } from './program'
import { isApplicableOn, parseSchedule, type ScheduleContext } from './schedule'

export function isSlotApplicableOnDate(
  slot: SlotState,
  date: string,
  ctx?: ScheduleContext,
): boolean {
  return isApplicableOn(parseSchedule(slot.schedule), new Date(`${date}T00:00:00`), ctx)
}

export function filterSlotsForDate(
  slots: SlotState[],
  date: string,
  ctx?: ScheduleContext,
): SlotState[] {
  return slots.filter((s) => isSlotApplicableOnDate(s, date, ctx))
}

export function sortedCompletionDates(
  ids: Set<string> | undefined,
  completions: Map<string, Completion>,
): string[] {
  const dates = new Set<string>()
  for (const c of resolveCompletions(ids, completions)) dates.add(c.date)
  return [...dates].sort()
}

/**
 * Whether a program's own course — not yet begun, finished, between rounds —
 * keeps its slot off the plan on `targetDate`, though the schedule names the day.
 */
export function isHiddenByProgram(slot: SlotState, targetDate: Date, realToday: Date): boolean {
  const program = getManifest(slot.practice_id)?.program
  if (!program) return false
  const { cursors, completionsByPractice, completions } = useEventStore.getState()
  const schedule = parseSchedule(slot.schedule)
  const projection = projectProgramAtDate({
    program,
    schedule,
    cursor: programCursor(
      program,
      schedule,
      cursors.get(`program/${slot.practice_id}`),
      targetDate,
    ),
    completionDatesAsc: sortedCompletionDates(
      completionsByPractice.get(slot.practice_id),
      completions,
    ),
    realToday,
    targetDate,
  })
  return !projection.visible
}
