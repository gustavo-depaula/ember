import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

enableMapSet()

import type { Completion, Cursor, HolyCardCopy, Tier, TimeBlock, UserPractice } from '../schema'
import { applyEvent } from './projections'
import type { AppEvent } from './types'

export type SlotState = {
  id: string
  practice_id: string
  enabled: number
  sort_order: number
  tier: Tier
  time: string | null
  time_block: TimeBlock
  notify: string | null
  schedule: string
  // Top-level flow choices this slot fixes (`{ hour: 'Prima' }`), keyed by the
  // select's `as`. Absent means every choice stays automatic.
  pins?: Record<string, string>
}

export type EventStoreState = {
  practices: Map<string, UserPractice>
  slots: Map<string, SlotState>
  completions: Map<number, Completion>
  completionsByDate: Map<string, Set<number>>
  completionsByPractice: Map<string, Set<number>>
  cursors: Map<string, Cursor>
  nextCompletionId: number
  /** Redeemed holy cards, by the grant that won each. */
  holyCards: Map<string, HolyCardCopy>

  apply: (event: AppEvent) => void
  applyBatch: (events: AppEvent[]) => void
  reset: () => void
}

function emptyState() {
  return {
    practices: new Map<string, UserPractice>(),
    slots: new Map<string, SlotState>(),
    completions: new Map<number, Completion>(),
    completionsByDate: new Map<string, Set<number>>(),
    completionsByPractice: new Map<string, Set<number>>(),
    cursors: new Map<string, Cursor>(),
    nextCompletionId: 1,
    holyCards: new Map<string, HolyCardCopy>(),
  }
}

export const useEventStore = create<EventStoreState>()(
  immer((set) => ({
    ...emptyState(),

    apply: (event: AppEvent) =>
      set((draft) => {
        applyEvent(draft, event)
      }),

    applyBatch: (events: AppEvent[]) =>
      set((draft) => {
        for (const event of events) {
          applyEvent(draft, event)
        }
      }),

    reset: () => set(() => emptyState()),
  })),
)
