import type { Transfers } from '@ember/liturgical'
import { type DayCalendar, getCelebrationsForDate, getLiturgicalSeason } from '@ember/liturgical'
import type { EventStoreState, SlotState } from '@/db/events'
import type { ScheduleContext } from './schedule'
import { filterSlotsForDate, isHiddenByProgram } from './utils'

// What the plan asks of a day, as plain functions of the log's state: the
// app's hooks wrap them, and the website calls them in a connected browser.

type PlanState = Pick<EventStoreState, 'slots' | 'practices'>

/** The plan's slots that are switched on, of practices still kept, in the plan's order. */
export function planSlots(state: PlanState): SlotState[] {
  return [...state.slots.values()]
    .filter((slot) => slot.enabled && !state.practices.get(slot.practice_id)?.archived)
    .sort((a, b) => a.sort_order - b.sort_order)
}

/** The slots a program keeps off `date` — not yet begun, finished, between rounds — though their schedule names it. */
export function programHides(state: PlanState, date: string, realToday: Date): Set<string> {
  const target = new Date(`${date}T00:00:00`)
  return new Set(
    planSlots(state)
      .filter((slot) => isHiddenByProgram(slot, target, realToday))
      .map((slot) => slot.id),
  )
}

/** The season and the celebrations of `day`, which a slot's schedule may name. */
export function scheduleContextFor(
  day: Date,
  transfers: Transfers,
  yearCalendar: Map<string, DayCalendar> | undefined,
): ScheduleContext | undefined {
  if (!yearCalendar) return undefined
  return {
    season: getLiturgicalSeason(day, 'of', transfers),
    dayCalendar: getCelebrationsForDate(yearCalendar, day),
  }
}

/** The plan's slots due on `date`: schedule and season applied, and programs' rests. */
export function slotsDueOn(
  state: PlanState,
  date: string,
  ctx: ScheduleContext | undefined,
  realToday: Date,
): SlotState[] {
  const hidden = programHides(state, date, realToday)
  return filterSlotsForDate(planSlots(state), date, ctx).filter((slot) => !hidden.has(slot.id))
}
