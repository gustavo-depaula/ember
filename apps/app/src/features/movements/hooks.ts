import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import type { Movement, MovementKind } from '@/db/events/state'
import {
  markIntentionAnswered,
  type OfferThanksgivingInput,
  offerThanksgiving,
  pinMovement,
  type RaiseIntentionInput,
  raiseIntention,
  retireIntention,
  retireThanksgiving,
  type UpdateIntentionInput,
  unpinMovement,
  updateIntention,
  updateThanksgiving,
} from '@/db/repositories'

import { findExpiredIntentionIds } from './findExpired'

type MovementFilter = {
  kind?: MovementKind
  state?: Movement['state']
}

function* matching(filter: MovementFilter, movements: Map<string, Movement>): Generator<Movement> {
  const expired = filter.state ? new Set(findExpiredIntentionIds(movements, Date.now())) : undefined
  for (const m of movements.values()) {
    if (filter.kind && m.kind !== filter.kind) continue
    if (filter.state) {
      const state: Movement['state'] = expired?.has(m.id) ? 'closed' : m.state
      if (state !== filter.state) continue
    }
    yield m
  }
}

function selectMovements(filter: MovementFilter, movements: Map<string, Movement>): Movement[] {
  return [...matching(filter, movements)].sort((a, b) => {
    const aTs = a.state === 'closed' ? (a.closed_at ?? a.recorded_at) : a.recorded_at
    const bTs = b.state === 'closed' ? (b.closed_at ?? b.recorded_at) : b.recorded_at
    return bTs - aTs
  })
}

function countMovements(filter: MovementFilter, movements: Map<string, Movement>): number {
  let n = 0
  for (const _ of matching(filter, movements)) n++
  return n
}

export function useMovements(filter: MovementFilter = {}): Movement[] {
  return useEventStore(useShallow((s) => selectMovements(filter, s.movements)))
}

export function useActiveIntentions(): Movement[] {
  return useMovements({ kind: 'intention', state: 'active' })
}

export function useClosedIntentions(): Movement[] {
  return useMovements({ kind: 'intention', state: 'closed' })
}

export function useActiveIntentionsCount(): number {
  return useEventStore((s) => countMovements({ kind: 'intention', state: 'active' }, s.movements))
}

export function useActiveThanksgivings(): Movement[] {
  return useMovements({ kind: 'thanksgiving', state: 'active' })
}

export function useActiveThanksgivingsCount(): number {
  return useEventStore((s) =>
    countMovements({ kind: 'thanksgiving', state: 'active' }, s.movements),
  )
}

export function useRecentSubjects(limit = 8): string[] {
  return useEventStore(
    useShallow((s) => {
      const seen = new Set<string>()
      const ordered: string[] = []
      const all = [...s.movements.values()].sort((a, b) => b.recorded_at - a.recorded_at)
      for (const m of all) {
        if (m.subject && !seen.has(m.subject)) {
          seen.add(m.subject)
          ordered.push(m.subject)
          if (ordered.length >= limit) break
        }
      }
      return ordered
    }),
  )
}

// --- Mutations ---

export function useRaiseIntention() {
  return useMutation({ mutationFn: (input: RaiseIntentionInput) => raiseIntention(input) })
}

export function useUpdateIntention() {
  return useMutation({ mutationFn: (input: UpdateIntentionInput) => updateIntention(input) })
}

export function useMarkIntentionAnswered() {
  return useMutation({
    mutationFn: (args: { id: string; notes?: string }) =>
      markIntentionAnswered(args.id, args.notes),
  })
}

export function useRetireIntention() {
  return useMutation({ mutationFn: (id: string) => retireIntention(id) })
}

export function useOfferThanksgiving() {
  return useMutation({ mutationFn: (input: OfferThanksgivingInput) => offerThanksgiving(input) })
}

export function useUpdateThanksgiving() {
  return useMutation({
    mutationFn: (input: { id: string; text?: string; subject?: string | null }) =>
      updateThanksgiving(input),
  })
}

export function useRetireThanksgiving() {
  return useMutation({ mutationFn: (id: string) => retireThanksgiving(id) })
}

// --- Pins ---

export function usePinnedFor(practiceId: string, kind: MovementKind): Movement[] {
  return useEventStore(
    useShallow((s) => {
      const ids = s.pins.get(practiceId)
      if (!ids || ids.size === 0) return []
      const result: Movement[] = []
      for (const id of ids) {
        const m = s.movements.get(id)
        if (m && m.kind === kind && m.state === 'active') result.push(m)
      }
      return result.sort((a, b) => b.recorded_at - a.recorded_at)
    }),
  )
}

export function usePinnedPracticesFor(movementId: string): string[] {
  return useEventStore(
    useShallow((s) => {
      const result: string[] = []
      for (const [practiceId, ids] of s.pins) {
        if (ids.has(movementId)) result.push(practiceId)
      }
      return result
    }),
  )
}

export function usePinMovement() {
  return useMutation({
    mutationFn: (args: { practiceId: string; movementId: string }) =>
      pinMovement(args.practiceId, args.movementId),
  })
}

export function useUnpinMovement() {
  return useMutation({
    mutationFn: (args: { practiceId: string; movementId: string }) =>
      unpinMovement(args.practiceId, args.movementId),
  })
}
