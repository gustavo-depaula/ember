import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { bareId } from '@/content/contentIndex'
import type { EventStoreState, SlotState } from '@/db/events'
import { resolveCompletions, useEventStore } from '@/db/events'
import {
  logCompletion,
  moveCompletion,
  removeCompletion,
  removeSlotCompletion,
} from '@/db/repositories'
import type { Completion, CompletionVia } from '@/db/schema'
import { getLiturgicalSeason } from '@/lib/liturgical'
import { transfersForJurisdiction } from '@/lib/missal/loaders'
import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'

import { usePreferencesStore } from '@/stores/preferencesStore'
import { parseSchedule } from './schedule'
import { filterSlotsForDate } from './utils'

// Completion is recorded against a plan slot — `{practice_id, sub_id}`, the two
// halves of a slot key — but what the user prays is often not that practice:
// the plan keeps the base practice and prays its active variant, routes carry
// bare ids ('mass') while the plan holds canonical ones ('practice/mass'), and
// one practice can hold several slots, each kept on its own days. This module
// maps what was prayed onto the slot it fulfils, so no screen composes practice
// ids or slot keys.

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

// The day's calendar isn't to hand here, so a holy-days-of-obligation slot
// never reads as due; the season is, and keeps a Lent-only slot to Lent.
function slotsDueOn(slots: SlotState[], date: string): SlotState[] {
  const transfers = transfersForJurisdiction(usePreferencesStore.getState().jurisdiction)
  const season = getLiturgicalSeason(new Date(`${date}T00:00:00`), 'of', transfers)
  return filterSlotsForDate(slots, date, { season })
}

function completedSlotKeys(completions: Completion[]): Set<string> {
  return new Set(completions.map(slotKeyOf))
}

function completionsOn(date: string, state: PlanState): Completion[] {
  return resolveCompletions(state.completionsByDate.get(date), state.completions)
}

/**
 * The slot a prayer completes. An explicit slot key (the Today row that was
 * tapped) wins; otherwise the practice's first enabled slot due on `date` and
 * not yet done, so a weekday Mass fills the weekday row rather than Sunday's,
 * and praying a twice-daily practice twice fills both rows. A practice outside
 * the plan is logged under the prayed id, unslotted.
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
  const due = slotsDueOn(enabled, date)
  const candidates = due.length > 0 ? due : enabled
  const slot = candidates.find((s) => !done.has(s.id)) ?? candidates[0]
  return { practiceId, subId: slot ? parseSlotKey(slot.id).slotId : 'default' }
}

// What praying a plan practice prays: its active variant, or itself. A
// checklist tick has no prayer screen to say, so this is the best record of it;
// snapshotting it now keeps the record right if the variant changes later.
function prayedFor(practiceId: string, state: PlanState): string {
  return bareId(state.practices.get(practiceId)?.active_variant ?? practiceId)
}

/** A day a program filled in after missing it, not a prayer the user marked. */
export function isBackfill(completion: Completion): boolean {
  return completion.sub_id === 'backfill'
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

/**
 * Refiles completions sitting where Today doesn't look for them while the
 * practice has a slot due that day. A prayer with no tapped row — a Mass
 * check-in — used to land on the practice's first slot whatever its days, or
 * unslotted beside the plan's own practice, so the Mass was counted and the
 * day's row stayed open. Each moves to the open due slot; if that row was since
 * ticked by hand, the misfiled one is the same prayer counted twice and is
 * dropped. Run at startup; a no-op once the record is straight.
 */
export async function refileMisplacedCompletions(): Promise<void> {
  const { practices, slots, completions } = useEventStore.getState()
  const enabledByPractice = new Map<string, SlotState[]>()
  for (const slot of [...slots.values()].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!slot.enabled || practices.get(slot.practice_id)?.archived) continue
    enabledByPractice.set(slot.practice_id, [
      ...(enabledByPractice.get(slot.practice_id) ?? []),
      slot,
    ])
  }

  const byPracticeDay = new Map<string, Completion[]>()
  for (const completion of completions.values()) {
    if (!enabledByPractice.has(completion.practice_id) || isBackfill(completion)) continue
    const key = `${completion.practice_id}\n${completion.date}`
    byPracticeDay.set(key, [...(byPracticeDay.get(key) ?? []), completion])
  }

  for (const day of byPracticeDay.values()) {
    const { practice_id: practiceId, date } = day[0]
    const enabled = enabledByPractice.get(practiceId) ?? []
    const slotOf = (c: Completion) => enabled.find((s) => s.id === slotKeyOf(c))
    // With one slot and every completion on it there is nowhere else to file.
    if (enabled.length < 2 && day.every(slotOf)) continue
    const due = slotsDueOn(enabled, date)
    if (due.length === 0) continue
    const dueKeys = new Set(due.map((s) => s.id))
    const done = completedSlotKeys(day)
    const lastHandTick = Math.max(
      0,
      ...day
        .filter((c) => c.via === 'checklist' && dueKeys.has(slotKeyOf(c)))
        .map((c) => c.completed_at),
    )

    for (const completion of day) {
      const slot = slotOf(completion)
      if (slot && dueKeys.has(slot.id)) continue
      if (slot && parseSchedule(slot.schedule).type === 'holy-days-of-obligation') continue
      const open = due.find((s) => !done.has(s.id))
      if (open) {
        done.add(open.id)
        await moveCompletion(completion.id, open.id)
      } else if (slot && lastHandTick >= completion.completed_at) {
        await removeCompletion(completion.id)
      }
    }
  }
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

/**
 * Bare ids of the practices prayed on `date` beyond the slots due that day —
 * one outside the plan, or a plan practice on a day it isn't due — in the order
 * they were first prayed.
 */
export function usePrayedBeyond(date: string, dueSlots: SlotState[]): string[] {
  const completions = useEventStore(useShallow((s) => completionsOn(date, s)))
  return useMemo(() => {
    const due = new Set(dueSlots.map((s) => s.id))
    const beyond = completions
      .filter((c) => !isBackfill(c) && !due.has(slotKeyOf(c)))
      .sort((a, b) => a.completed_at - b.completed_at)
    return [...new Set(beyond.map((c) => bareId(prayedIdOf(c))))]
  }, [completions, dueSlots])
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
