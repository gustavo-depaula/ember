import { useEventStore } from '@/db/events'
import { deletePractice, deleteSlot, getSlotsForPractice } from '@/db/repositories'
import { planSlots } from '@/features/plan-of-life/due'
import { resyncReminders } from '@/features/plan-of-life/hooks'

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
