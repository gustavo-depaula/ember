export { nextId } from './clock'
export { dropPlaceholders } from './compact'
export type {
  EventStoreState,
  SlotState,
} from './state'
export { useEventStore } from './state'
export { createEventsTable, emit, emitBatch, replayAll } from './store'
export { exportLog, mergeLog } from './transfer'
export type {
  AppEvent,
  CompletionEvent,
  CursorEvent,
  PracticeEvent,
  StoredEvent,
} from './types'

import type { Completion } from '../schema'

export function resolveCompletions(
  ids: Set<string> | undefined,
  completions: Map<string, Completion>,
): Completion[] {
  if (!ids) return []
  const result: Completion[] = []
  for (const id of ids) {
    const c = completions.get(id)
    if (c) result.push(c)
  }
  return result
}
