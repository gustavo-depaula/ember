import { getHourSelect } from '@/content/pins'
import { loadFlow } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { createPracticeWithSlots, deleteSlot } from '@/db/repositories'

import { planSlots } from './due'
import { resyncReminders } from './hooks'

/**
 * The Offices kept hour by hour, each a practice whose flow picks its hour.
 * `hours` are the ones proposed at first; the rest wait one tap away.
 */
export const offices = [
  {
    key: 'lh',
    practiceId: 'practice/liturgy-of-the-hours',
    hours: ['lauds', 'vespers', 'compline'],
  },
  {
    key: 'da',
    practiceId: 'practice/breviary-divino-afflatu',
    hours: ['Laudes', 'Vespera', 'Completorium'],
  },
  {
    key: 'mon',
    practiceId: 'practice/breviary-monastic',
    hours: ['Laudes', 'Vespera', 'Completorium'],
  },
  {
    key: 'bvm',
    practiceId: 'practice/breviary-little-office-bvm',
    hours: ['Laudes', 'Vespera', 'Completorium'],
  },
] as const

export type Office = (typeof offices)[number]
export type OfficeKey = Office['key']

/** An Office's hours, in the day's order, each with its own time. */
export async function officeHours(practiceId: string) {
  const select = getHourSelect(await loadFlow(practiceId))
  if (!select) return []
  return select.options
    .filter((o) => o.pin !== false)
    .map((o) => ({ id: o.id, label: o.label, time: o.time, as: select.as }))
}

/** The hours of an Office the plan keeps, by the hour each slot pins. */
export function keptHours(
  slots: { practice_id: string; pins?: Record<string, string> }[],
  practiceId: string,
) {
  return slots
    .filter((s) => s.practice_id === practiceId)
    .flatMap((s) => Object.values(s.pins ?? {}))
}

/**
 * Makes the plan keep exactly these hours of an Office, one slot each, pinned
 * and timed: hours newly chosen are added, hours let go leave the plan, and the
 * ones still kept keep their slot — with whatever time the person gave it.
 */
export async function setOfficeHours(practiceId: string, hourIds: readonly string[]) {
  const slots = planSlots(useEventStore.getState()).filter((s) => s.practice_id === practiceId)
  const hours = await officeHours(practiceId)
  const kept = new Set(slots.flatMap((s) => Object.values(s.pins ?? {})))
  const added = hours.filter((h) => hourIds.includes(h.id) && !kept.has(h.id))
  const keys = added.length
    ? await createPracticeWithSlots(
        { id: practiceId, activeVariant: practiceId },
        added.map((h) => ({ tier: 'essential', time: h.time, pins: { [h.as]: h.id } })),
      )
    : []
  for (const s of slots) {
    if (!Object.values(s.pins ?? {}).some((id) => hourIds.includes(id))) await deleteSlot(s.id)
  }
  resyncReminders()
  return keys
}
