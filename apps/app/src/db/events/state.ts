import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

enableMapSet()

import type { Completion, Cursor, Tier, TimeBlock, UserPractice } from '../schema'
import { applyEvent } from './projections'
import type {
  AppEvent,
  Cadence,
  ResolutionLevel,
  ResolutionOutcome,
  ResolutionSource,
} from './types'

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

export type MovementKind = 'intention' | 'thanksgiving'
export type MovementClosureKind = 'answered' | 'expired' | 'retired'

export type Movement = {
  id: string
  kind: MovementKind
  text: string
  subject?: string
  cadence?: Cadence
  bounded_until?: number
  state: 'active' | 'closed'
  closure_kind?: MovementClosureKind
  recorded_at: number
  closed_at?: number
  notes?: string
  /** Lineage: the intention this thanksgiving was bridged from (if any). */
  from_intention?: string
}

export type Resolution = {
  id: string
  text: string
  level: ResolutionLevel
  virtue?: string
  parent_id?: string
  starts_at: number
  ends_at: number
  recorded_at: number
  source: ResolutionSource
  archived_at?: number
}

export type ResolutionReview = {
  resolution_id: string
  kind: 'checkin' | 'review'
  outcome: ResolutionOutcome
  notes?: string
  reviewed_at: number
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

  // Movements (intentions + thanksgivings)
  movements: Map<string, Movement>
  movementsByKind: Map<MovementKind, Set<string>>
  movementsByState: Map<Movement['state'], Set<string>>

  // Practice ↔ movement pins (practice_id → set of movement_ids)
  pins: Map<string, Set<string>>

  // Resolutions (Plan of Life rule of life — daily through annual)
  resolutions: Map<string, Resolution>
  resolutionReviews: Map<string, ResolutionReview[]>
  resolutionsByLevel: Map<ResolutionLevel, Set<string>>

  // Oblatio (date → offered-at timestamp)
  offeredDays: Map<string, number>

  // ID counters (for generating IDs during replay/emit)
  nextCompletionId: number

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
    movements: new Map<string, Movement>(),
    movementsByKind: new Map<MovementKind, Set<string>>(),
    movementsByState: new Map<Movement['state'], Set<string>>(),
    pins: new Map<string, Set<string>>(),
    resolutions: new Map<string, Resolution>(),
    resolutionReviews: new Map<string, ResolutionReview[]>(),
    resolutionsByLevel: new Map<ResolutionLevel, Set<string>>(),
    offeredDays: new Map<string, number>(),
    nextCompletionId: 1,
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
