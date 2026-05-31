export type {
  EventStoreState,
  Movement,
  MovementClosureKind,
  MovementKind,
  Resolution,
  ResolutionReview,
  SlotState,
} from './state'
export { useEventStore } from './state'
export { createEventsTable, emit, emitBatch, replayAll } from './store'
export type {
  AppEvent,
  Cadence,
  CompletionEvent,
  CursorEvent,
  MovementEvent,
  PracticeEvent,
  ResolutionEvent,
  ResolutionLevel,
  ResolutionOutcome,
  ResolutionSource,
  StoredEvent,
} from './types'

import type { Completion } from '../schema'

export function resolveCompletions(
  ids: Set<number> | undefined,
  completions: Map<number, Completion>,
): Completion[] {
  if (!ids) return []
  const result: Completion[] = []
  for (const id of ids) {
    const c = completions.get(id)
    if (c) result.push(c)
  }
  return result
}
