import { enableMapSet, produce } from 'immer'
import { describe, expect, it } from 'vitest'

import { applyEvent } from '@/db/events/projections'
import type { EventStoreState } from '@/db/events/state'
import type { AppEvent } from '@/db/events/types'

enableMapSet()

function emptyState(): EventStoreState {
  return {
    practices: new Map(),
    slots: new Map(),
    completions: new Map(),
    completionsByDate: new Map(),
    completionsByPractice: new Map(),
    cursors: new Map(),
    movements: new Map(),
    movementsByKind: new Map(),
    movementsByState: new Map(),
    pins: new Map(),
    offeredDays: new Map(),
    resolutions: new Map(),
    resolutionReviews: new Map(),
    resolutionsByLevel: new Map(),
    nextCompletionId: 1,
    apply: () => {},
    applyBatch: () => {},
    reset: () => {},
  }
}

function replay(events: AppEvent[]): EventStoreState {
  return produce(emptyState(), (draft) => {
    for (const e of events) applyEvent(draft, e)
  })
}

describe('pin projection', () => {
  it('MovementPinned adds movement_id to the practice set', () => {
    const s = replay([
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm1', pinned_at: 100 },
    ])
    expect(s.pins.get('rosary')?.has('m1')).toBe(true)
  })

  it('MovementPinned twice for the same pair is idempotent', () => {
    const s = replay([
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm1', pinned_at: 100 },
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm1', pinned_at: 200 },
    ])
    expect(s.pins.get('rosary')?.size).toBe(1)
  })

  it('MovementUnpinned removes the movement_id', () => {
    const s = replay([
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm1', pinned_at: 100 },
      { type: 'MovementUnpinned', practice_id: 'rosary', movement_id: 'm1', unpinned_at: 200 },
    ])
    expect(s.pins.get('rosary')?.has('m1') ?? false).toBe(false)
  })

  it('MovementUnpinned for an absent pair is a no-op', () => {
    const s = replay([
      { type: 'MovementUnpinned', practice_id: 'rosary', movement_id: 'ghost', unpinned_at: 200 },
    ])
    expect(s.pins.get('rosary') ?? new Set()).toEqual(new Set())
  })

  it('multiple practices and multiple movements coexist', () => {
    const s = replay([
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm1', pinned_at: 100 },
      { type: 'MovementPinned', practice_id: 'rosary', movement_id: 'm2', pinned_at: 110 },
      { type: 'MovementPinned', practice_id: 'mass', movement_id: 'm1', pinned_at: 120 },
    ])
    expect(new Set(s.pins.get('rosary'))).toEqual(new Set(['m1', 'm2']))
    expect(new Set(s.pins.get('mass'))).toEqual(new Set(['m1']))
  })
})
