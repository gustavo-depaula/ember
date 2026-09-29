import type { SlotState } from '@/db/events'

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
