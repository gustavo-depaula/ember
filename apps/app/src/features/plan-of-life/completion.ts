import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { bareId } from '@/content/contentIndex'
import type { EventStoreState } from '@/db/events'
import { resolveCompletions, useEventStore } from '@/db/events'
import { logCompletion, removeSlotCompletion } from '@/db/repositories'
import type { Completion, CompletionVia } from '@/db/schema'
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

// What praying a plan practice prays: its active variant, or itself. A
// checklist tick has no prayer screen to say, so this is the best record of it;
// snapshotting it now keeps the record right if the variant changes later.
function prayedFor(practiceId: string, state: PlanState): string {
  return bareId(state.practices.get(practiceId)?.active_variant ?? practiceId)
}

/** The practice a completion prayed, falling back for those recorded before it was kept. */
export function prayedIdOf(completion: Completion, state: PlanState = useEventStore.getState()) {
  return completion.prayed_id ?? prayedFor(completion.practice_id, state)
}

export async function completePractice(
  prayedId: string,
  date: string,
  { slotKey, via = 'amen' }: { slotKey?: string; via?: CompletionVia } = {},
): Promise<void> {
  const { practiceId, subId } = completionTarget(prayedId, date, slotKey)
  await logCompletion(practiceId, date, subId, bareId(prayedId), via)
}

export async function setSlotDone(slotKey: string, date: string, done: boolean): Promise<void> {
  const { practiceId, slotId } = parseSlotKey(slotKey)
  if (!done) return removeSlotCompletion(practiceId, date, slotId)
  const prayedId = prayedFor(practiceId, useEventStore.getState())
  await logCompletion(practiceId, date, slotId, prayedId, 'checklist')
}

/** Slot keys completed on `date` — compare against `SlotState.id`. */
export function useCompletedSlots(date: string): Set<string> {
  const completions = useEventStore(useShallow((s) => completionsOn(date, s)))
  return useMemo(() => completedSlotKeys(completions), [completions])
}

/**
 * Bare ids of the practices prayed on `date`, whether or not they're in the
 * plan: a prayer outside it is logged under the prayed id itself.
 */
export function usePrayedOn(date: string): Set<string> {
  const completions = useEventStore(useShallow((s) => completionsOn(date, s)))
  return useMemo(() => new Set(completions.map((c) => bareId(c.practice_id))), [completions])
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
    }) => completePractice(prayedId, date, { slotKey }),
  })
}

export function useSetSlotDone() {
  return useMutation({
    mutationFn: ({ slotKey, date, done }: { slotKey: string; date: string; done: boolean }) =>
      setSlotDone(slotKey, date, done),
  })
}
