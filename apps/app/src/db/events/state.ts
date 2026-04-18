import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

enableMapSet()

import type { Completion, Cursor, Tier, TimeBlock, UserPractice } from '../schema'
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
  variant: string | null
}

export type IntentionState = {
  id: number
  text: string
  created_at: number
  answered_at: number | null
  notes: string | null
}

export type GratitudeState = {
  id: number
  text: string
  recorded_at: number
}

export type ConfessionState = {
  id: number
  date: string
  recorded_at: number
}

export type EventStoreState = {
  // Practices
  practices: Map<string, UserPractice>
  slots: Map<string, SlotState>

  // Completions
  completions: Map<number, Completion>
  completionsByDate: Map<string, Set<number>>
  completionsByPractice: Map<string, Set<number>>

  // Cursors
  cursors: Map<string, Cursor>

  // Intentions
  intentions: Map<number, IntentionState>

  // Gratitudes
  gratitudes: Map<number, GratitudeState>

  // Oblatio (date → offered-at timestamp)
  offeredDays: Map<string, number>

  // Confessio (sacrament of penance records)
  confessions: Map<number, ConfessionState>

  // Angelus ("date:slot" → prayed-at timestamp)
  angelusPrayed: Map<string, number>

  // ID counters (for generating IDs during replay/emit)
  nextCompletionId: number
  nextIntentionId: number
  nextGratitudeId: number
  nextConfessionId: number

  // Actions
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
    intentions: new Map<number, IntentionState>(),
    gratitudes: new Map<number, GratitudeState>(),
    offeredDays: new Map<string, number>(),
    confessions: new Map<number, ConfessionState>(),
    angelusPrayed: new Map<string, number>(),
    nextCompletionId: 1,
    nextIntentionId: 1,
    nextGratitudeId: 1,
    nextConfessionId: 1,
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
