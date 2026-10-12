import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

enableMapSet()

import type {
  CheckIn,
  Completion,
  Cursor,
  FavoriteChurch,
  HolyCardCopy,
  SavedItem,
  Tier,
  TimeBlock,
  UserCollection,
  UserPractice,
} from '../schema'
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
  // The length the person gives a practice whose length is theirs to set
  // (manifest `duration: chosen`). Absent means the manifest's default.
  minutes?: number
}

/** A collection the user authors, with its member refs in order. */
export type CollectionState = UserCollection & { refs: { ref: string; addedAt: number }[] }

export type EventStoreState = {
  practices: Map<string, UserPractice>
  slots: Map<string, SlotState>
  completions: Map<string, Completion>
  completionsByDate: Map<string, Set<string>>
  completionsByPractice: Map<string, Set<string>>
  cursors: Map<string, Cursor>
  /** Redeemed holy cards, by the grant that won each. */
  holyCards: Map<string, HolyCardCopy>
  /** The library shelf, in the order saved. */
  savedItems: Map<string, SavedItem>
  collections: Map<string, CollectionState>
  favoriteChurches: Map<string, FavoriteChurch>
  checkIns: Map<string, CheckIn>
  /** Per book: the time read and the days it was read on. */
  reading: Map<string, { ms: number; days: Set<string> }>
  /** The preferences that follow the person: see `syncedPreferences`. */
  preferences: Map<string, string>

  apply: (event: AppEvent) => void
  applyBatch: (events: AppEvent[]) => void
  reset: () => void
}

function emptyState() {
  return {
    practices: new Map<string, UserPractice>(),
    slots: new Map<string, SlotState>(),
    completions: new Map<string, Completion>(),
    completionsByDate: new Map<string, Set<string>>(),
    completionsByPractice: new Map<string, Set<string>>(),
    cursors: new Map<string, Cursor>(),
    holyCards: new Map<string, HolyCardCopy>(),
    savedItems: new Map<string, SavedItem>(),
    collections: new Map<string, CollectionState>(),
    favoriteChurches: new Map<string, FavoriteChurch>(),
    checkIns: new Map<string, CheckIn>(),
    reading: new Map<string, { ms: number; days: Set<string> }>(),
    preferences: new Map<string, string>(),
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
