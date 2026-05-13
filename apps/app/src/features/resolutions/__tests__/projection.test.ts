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
    resolutions: new Map(),
    resolutionReviews: new Map(),
    resolutionsByLevel: new Map(),
    offeredDays: new Map(),
    confessions: new Map(),
    nextCompletionId: 1,
    nextConfessionId: 1,
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

describe('resolution projection — ResolutionSet', () => {
  it('creates a resolution and indexes by level', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'Pray the Rosary',
        starts_at: 100,
        ends_at: 200,
        source: 'examen',
        recorded_at: 50,
      },
    ])
    const r = s.resolutions.get('r1')
    expect(r?.text).toBe('Pray the Rosary')
    expect(r?.level).toBe('daily')
    expect(r?.starts_at).toBe(100)
    expect(s.resolutionsByLevel.get('daily')?.has('r1')).toBe(true)
  })
})

describe('resolution projection — ResolutionRevised', () => {
  it('updates text without changing window', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'old',
        starts_at: 100,
        ends_at: 200,
        source: 'examen',
        recorded_at: 50,
      },
      { type: 'ResolutionRevised', id: 'r1', text: 'new', revised_at: 60 },
    ])
    const r = s.resolutions.get('r1')!
    expect(r.text).toBe('new')
    expect(r.starts_at).toBe(100)
    expect(r.ends_at).toBe(200)
  })

  it('clears virtue when explicitly null', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'x',
        virtue: 'patience',
        starts_at: 1,
        ends_at: 2,
        source: 'examen',
        recorded_at: 1,
      },
      { type: 'ResolutionRevised', id: 'r1', virtue: null, revised_at: 2 },
    ])
    expect(s.resolutions.get('r1')?.virtue).toBeUndefined()
  })
})

describe('resolution projection — ResolutionReviewed', () => {
  it('appends a review with kind=review', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'x',
        starts_at: 1,
        ends_at: 2,
        source: 'examen',
        recorded_at: 1,
      },
      { type: 'ResolutionReviewed', resolution_id: 'r1', outcome: 'kept', reviewed_at: 3 },
    ])
    const reviews = s.resolutionReviews.get('r1')
    expect(reviews?.length).toBe(1)
    expect(reviews?.[0].kind).toBe('review')
    expect(reviews?.[0].outcome).toBe('kept')
  })
})

describe('resolution projection — ResolutionCheckin', () => {
  it('appends a review with kind=checkin', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'x',
        starts_at: 1,
        ends_at: 2,
        source: 'examen',
        recorded_at: 1,
      },
      { type: 'ResolutionCheckin', resolution_id: 'r1', outcome: 'partial', reviewed_at: 3 },
    ])
    const reviews = s.resolutionReviews.get('r1')!
    expect(reviews.length).toBe(1)
    expect(reviews[0].kind).toBe('checkin')
  })

  it('multiple checkins accumulate', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'x',
        starts_at: 1,
        ends_at: 2,
        source: 'examen',
        recorded_at: 1,
      },
      { type: 'ResolutionCheckin', resolution_id: 'r1', outcome: 'kept', reviewed_at: 2 },
      { type: 'ResolutionCheckin', resolution_id: 'r1', outcome: 'partial', reviewed_at: 3 },
    ])
    expect(s.resolutionReviews.get('r1')?.length).toBe(2)
  })
})

describe('resolution projection — ResolutionArchived', () => {
  it('sets archived_at', () => {
    const s = replay([
      {
        type: 'ResolutionSet',
        id: 'r1',
        level: 'daily',
        text: 'x',
        starts_at: 1,
        ends_at: 2,
        source: 'examen',
        recorded_at: 1,
      },
      { type: 'ResolutionArchived', id: 'r1', archived_at: 100 },
    ])
    expect(s.resolutions.get('r1')?.archived_at).toBe(100)
  })
})
