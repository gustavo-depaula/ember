import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { bareId } from '@/content/contentIndex'
import type { EventStoreState } from '@/db/events'
import { resolveCompletions, useEventStore } from '@/db/events'
import { logCompletion, toggleCompletion } from '@/db/repositories'
import type { Completion } from '@/db/schema'
import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'

// Completion is recorded against a plan slot — `{practice_id, sub_id}`, the two
// halves of a slot key — but what the user prays is often not that practice:
// the plan keeps the base practice and prays its active variant, routes carry
// bare ids ('mass') while the plan holds canonical ones ('practice/mass'), and
// one practice can hold several slots. This module maps what was prayed onto
// the slot it fulfils, so no screen composes practice ids or slot keys.

type PlanState = Pick<EventStoreState, 'practices' | 'slots' | 'completions' | 'completionsByDate'>

function slotKeyOf(completion: Completion): string {
  return composeSlotKey(completion.practice_id, completion.sub_id ?? 'default')
}

function sameItem(a: string, b: string): boolean {
  return a === b || bareId(a) === bareId(b)
}

// The plan practice a prayed id belongs to: the practice itself, or the base
// practice whose active variant was prayed.
function planPracticeFor(prayedId: string, state: PlanState): string | undefined {
  if (state.practices.has(prayedId)) return prayedId
  const practices = [...state.practices.values()]
  return (
    practices.find((p) => sameItem(p.practice_id, prayedId)) ??
    practices.find((p) => p.active_variant && sameItem(p.active_variant, prayedId))
  )?.practice_id
}

function completedSlotKeys(completions: Completion[]): Set<string> {
  return new Set(completions.map(slotKeyOf))
}

function completionsOn(date: string, state: PlanState): Completion[] {
  return resolveCompletions(state.completionsByDate.get(date), state.completions)
}

/**
 * The slot a prayer completes. An explicit slot key (the Today row that was
 * tapped) wins; otherwise the practice's first enabled slot not yet done on
 * `date`, so praying a twice-daily practice twice fills both rows. A practice
 * outside the plan is logged under the prayed id, unslotted.
 */
export function completionTarget(
  prayedId: string,
  date: string,
  slotKey?: string,
  state: PlanState = useEventStore.getState(),
): { practiceId: string; subId: string } {
  if (slotKey && state.slots.has(slotKey)) {
    const { practiceId, slotId } = parseSlotKey(slotKey)
    return { practiceId, subId: slotId }
  }

  const practiceId = planPracticeFor(prayedId, state)
  if (!practiceId) return { practiceId: prayedId, subId: 'default' }
  if (state.practices.get(practiceId)?.archived) return { practiceId, subId: 'default' }

  const done = completedSlotKeys(completionsOn(date, state))
  const enabled = [...state.slots.values()]
    .filter((s) => s.practice_id === practiceId && s.enabled)
    .sort((a, b) => a.sort_order - b.sort_order)
  const slot = enabled.find((s) => !done.has(s.id)) ?? enabled[0]
  return { practiceId, subId: slot ? parseSlotKey(slot.id).slotId : 'default' }
}

export async function completePractice(
  prayedId: string,
  date: string,
  slotKey?: string,
): Promise<void> {
  const { practiceId, subId } = completionTarget(prayedId, date, slotKey)
  await logCompletion(practiceId, date, subId)
}

export async function setSlotDone(slotKey: string, date: string, done: boolean): Promise<void> {
  const { practiceId, slotId } = parseSlotKey(slotKey)
  await toggleCompletion(practiceId, date, done, slotId)
}

// --- Hooks ---

/** Slot keys completed on `date` — compare against `SlotState.id`. */
export function useCompletedSlots(date: string): Set<string> {
  const completions = useEventStore(useShallow((s) => completionsOn(date, s)))
  return useMemo(() => completedSlotKeys(completions), [completions])
}

export function useCompletionRange(startDate: string, endDate: string): Completion[] {
  return useEventStore(
    useShallow((s) => {
      const result: Completion[] = []
      for (const [date, ids] of s.completionsByDate) {
        if (date >= startDate && date <= endDate) {
          for (const c of resolveCompletions(ids, s.completions)) result.push(c)
        }
      }
      return result
    }),
  )
}

/** Every date each slot was completed on, keyed by slot key. */
export function useCompletionDatesBySlot(): Map<string, string[]> {
  const completions = useEventStore((s) => s.completions)

  return useMemo(() => {
    const result = new Map<string, string[]>()
    for (const c of completions.values()) {
      const key = slotKeyOf(c)
      const existing = result.get(key)
      if (existing) existing.push(c.date)
      else result.set(key, [c.date])
    }
    return result
  }, [completions])
}

export function useCompletePractice() {
  return useMutation({
    mutationFn: ({
      prayedId,
      date,
      slotKey,
    }: {
      prayedId: string
      date: string
      slotKey?: string
    }) => completePractice(prayedId, date, slotKey),
  })
}

export function useSetSlotDone() {
  return useMutation({
    mutationFn: ({ slotKey, date, done }: { slotKey: string; date: string; done: boolean }) =>
      setSlotDone(slotKey, date, done),
  })
}
