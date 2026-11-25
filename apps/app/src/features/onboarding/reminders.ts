import type { SlotState } from '@/db/events'
import { updateSlots } from '@/db/repositories'
import type { NotifyConfig } from '@/db/schema'
import { parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'
import { getActiveDayParts } from '@/features/plan-of-life/timeBlocks'
import { requestNotificationPermission, rescheduleAllReminders } from '@/lib/notifications'

/**
 * The weekday a reminder's day control moves, when it has one: a practice kept
 * one day a week, or one day of the month. Sunday Mass keeps its Sunday, and a
 * practice kept on several days has no single day to move.
 */
export function movableDay(slot: SlotState, schedule: Schedule): number | undefined {
  if (schedule.type === 'nth-weekday') return schedule.day
  if (schedule.type !== 'days-of-week' || schedule.days.length !== 1) return undefined
  const [day] = schedule.days
  if (slot.practice_id === 'practice/mass' && day === 0) return undefined
  return day
}

/** The schedule with its one weekday moved to `day` (0 = Sunday). */
export function onWeekday(schedule: Schedule, day: number): Schedule {
  if (schedule.type === 'nth-weekday') return { ...schedule, day }
  if (schedule.type === 'days-of-week') return { ...schedule, days: [day] }
  return schedule
}

/**
 * The plan as reminders lists it: each daily prayer under its part of the day,
 * as the plan's string divides the day, then the weekly and monthly ones.
 */
export function reminderGroups(slots: SlotState[]) {
  const daily = slots.filter((s) => parseSchedule(s.schedule).type === 'daily')
  const weekly = slots
    .filter((s) => parseSchedule(s.schedule).type !== 'daily')
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  return { parts: getActiveDayParts(daily), weekly }
}

/**
 * Turns on a reminder at the hour of every prayer not muted, then asks the
 * device's leave and schedules them. Resolves whether reminders may be sent.
 */
export async function confirmReminders(
  slots: SlotState[],
  muted: ReadonlySet<string>,
): Promise<boolean> {
  const on: NotifyConfig = { enabled: true }
  await updateSlots(
    slots
      .filter((s) => !muted.has(s.id))
      .map((s) => ({ id: s.id, data: { notify: JSON.stringify(on) } })),
  )
  const granted = await requestNotificationPermission()
  await rescheduleAllReminders()
  return granted
}
