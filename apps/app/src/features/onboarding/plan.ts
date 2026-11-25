import { getHourSelect } from '@/content/pins'
import { loadFlow } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import {
  createPracticeWithSlots,
  deletePractice,
  deleteSlot,
  getSlotsForPractice,
} from '@/db/repositories'
import { planSlots } from '@/features/plan-of-life/due'
import { resyncReminders } from '@/features/plan-of-life/hooks'

/**
 * The Offices onboarding offers, each a practice whose flow picks its hour.
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

export type OfficeKey = (typeof offices)[number]['key']

/** An Office's hours, in the day's order, each with its own time. */
export async function officeHours(practiceId: string) {
  const select = getHourSelect(await loadFlow(practiceId))
  if (!select) return []
  return select.options
    .filter((o) => o.pin !== false)
    .map((o) => ({ id: o.id, label: o.label, time: o.time, as: select.as }))
}

/** Puts the chosen hours of an Office in the plan, one slot each, pinned and timed. */
export async function addOfficeHours(practiceId: string, hourIds: readonly string[]) {
  const hours = (await officeHours(practiceId)).filter((h) => hourIds.includes(h.id))
  if (hours.length === 0) return []
  const keys = await createPracticeWithSlots(
    { id: practiceId, activeVariant: practiceId },
    hours.map((h) => ({ tier: 'essential', time: h.time, pins: { [h.as]: h.id } })),
  )
  resyncReminders()
  return keys
}

/**
 * Undoes what onboarding put in the plan, so a step back to the first question
 * starts clean. Only slots added since it began go — `kept` are the ones the
 * plan already held, and a plan that arrived by sync meanwhile is not its own
 * to undo. A practice made for onboarding goes whole.
 */
export async function clearOnboardingPlan(kept: ReadonlySet<string>) {
  const added = planSlots(useEventStore.getState()).filter((s) => !kept.has(s.id))
  if (added.length === 0) return
  for (const practiceId of new Set(added.map((s) => s.practice_id))) {
    const own = getSlotsForPractice(practiceId)
    if (own.every((s) => !kept.has(s.id) && s.enabled)) await deletePractice(practiceId)
    else for (const s of added.filter((s) => s.practice_id === practiceId)) await deleteSlot(s.id)
  }
  resyncReminders()
}

/** The slots the plan holds now, by id. */
export function planSlotIds(): string[] {
  return planSlots(useEventStore.getState()).map((s) => s.id)
}
