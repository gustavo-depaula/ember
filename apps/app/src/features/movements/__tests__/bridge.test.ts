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

describe('petition → thanksgiving bridge', () => {
  it('thanksgiving can carry from_intention lineage to its source intention', () => {
    const s = replay([
      { type: 'IntentionRaised', id: 'i1', text: 'For Maria', cadence: 'goal', raised_at: 1 },
      { type: 'IntentionAnswered', id: 'i1', notes: 'surgery went well', answered_at: 2 },
      {
        type: 'ThanksgivingOffered',
        id: 't1',
        text: 'For Maria — answered',
        offered_at: 3,
        from_intention: 'i1',
      },
    ])

    const t = s.movements.get('t1')
    expect(t?.kind).toBe('thanksgiving')
    expect(t?.from_intention).toBe('i1')

    const source = s.movements.get(t?.from_intention ?? '')
    expect(source?.state).toBe('closed')
    expect(source?.closure_kind).toBe('answered')
  })

  it('thanksgivings without a bridge work as before', () => {
    const s = replay([
      { type: 'ThanksgivingOffered', id: 't1', text: 'a sunny day', offered_at: 1 },
    ])
    expect(s.movements.get('t1')?.from_intention).toBeUndefined()
  })
})
