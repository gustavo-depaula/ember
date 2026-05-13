import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useEventStore } from '@/db/events/state'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { subscribeChanges } from './manager'

/**
 * Listens for cross-tab change broadcasts (from the leader tab's DB writes)
 * and applies them to local in-memory state — Zustand stores, the content
 * registry, and the React Query cache. Must be mounted inside the
 * `QueryClientProvider` tree.
 *
 * Native: no-op (each app process owns its DB; no cross-tab concept).
 */
export function useCrossTabSync(): void {
  useEffect(() => {
    if (Platform.OS !== 'web') return

    return subscribeChanges((payload) => {
      if (payload.kind === 'event') {
        useEventStore.getState().apply(payload.event)
        return
      }
      if (payload.kind === 'event-batch') {
        useEventStore.getState().applyBatch(payload.events)
        return
      }
      if (payload.kind === 'invalidate') {
        for (const tag of payload.tags) {
          if (tag === 'preferences') {
            usePreferencesStore
              .getState()
              .hydrate()
              .catch((err) => {
                console.warn('[cross-tab] failed to re-hydrate preferences:', err)
              })
          }
        }
      }
    })
  }, [])
}
