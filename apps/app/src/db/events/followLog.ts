import { type EventStoreState, useEventStore } from './state'

/**
 * For a store that keeps its own copy of something the log holds: runs
 * `rehydrate` whenever `changed` says that part of the log moved — this
 * device's own write, another tab's, another device's events merged in.
 */
export function followLog(
  changed: (state: EventStoreState, previous: EventStoreState) => boolean,
  rehydrate: () => Promise<void>,
): void {
  useEventStore.subscribe((state, previous) => {
    if (changed(state, previous)) void rehydrate()
  })
}
