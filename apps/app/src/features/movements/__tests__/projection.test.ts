import { enableMapSet, produce } from 'immer'
import { describe, expect, it } from 'vitest'

enableMapSet()

import { applyEvent } from '@/db/events/projections'
import type { EventStoreState } from '@/db/events/state'
import type { AppEvent } from '@/db/events/types'

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
    confessions: new Map(),
    resolutions: new Map(),
    resolutionReviews: new Map(),
    resolutionsByLevel: new Map(),
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

describe('movement projection — IntentionRaised', () => {
  it('creates an active intention with cadence and indexes', () => {
    const s = replay([
      {
        type: 'IntentionRaised',
        id: 'i1',
        text: 'For my family',
        cadence: 'perpetual',
        raised_at: 100,
      },
    ])

    const m = s.movements.get('i1')
    expect(m).toBeDefined()
    expect(m?.kind).toBe('intention')
    expect(m?.text).toBe('For my family')
    expect(m?.cadence).toBe('perpetual')
    expect(m?.state).toBe('active')
    expect(m?.recorded_at).toBe(100)
    expect(s.movementsByKind.get('intention')?.has('i1')).toBe(true)
    expect(s.movementsByState.get('active')?.has('i1')).toBe(true)
  })

  it('captures subject and bounded_until', () => {
    const s = replay([
      {
        type: 'IntentionRaised',
        id: 'i2',
        text: 'During this novena',
        subject: 'parish',
        cadence: 'bounded',
        bounded_until: 9999,
        raised_at: 50,
      },
    ])

    const m = s.movements.get('i2')!
    expect(m.subject).toBe('parish')
    expect(m.cadence).toBe('bounded')
    expect(m.bounded_until).toBe(9999)
  })
})

describe('movement projection — IntentionAnswered', () => {
  it('closes the intention with answered closure_kind', () => {
    const s = replay([
      { type: 'IntentionRaised', id: 'i1', text: 'For job', cadence: 'goal', raised_at: 100 },
      { type: 'IntentionAnswered', id: 'i1', notes: 'got it', answered_at: 200 },
    ])

    const m = s.movements.get('i1')!
    expect(m.state).toBe('closed')
    expect(m.closure_kind).toBe('answered')
    expect(m.closed_at).toBe(200)
    expect(m.notes).toBe('got it')
    expect(s.movementsByState.get('active')?.has('i1') ?? false).toBe(false)
    expect(s.movementsByState.get('closed')?.has('i1')).toBe(true)
  })

  it('is idempotent — second answered for same id is a no-op', () => {
    const s = replay([
      { type: 'IntentionRaised', id: 'i1', text: 'x', cadence: 'goal', raised_at: 1 },
      { type: 'IntentionAnswered', id: 'i1', answered_at: 2 },
      { type: 'IntentionAnswered', id: 'i1', answered_at: 3 },
    ])

    const m = s.movements.get('i1')!
    expect(m.closed_at).toBe(2)
  })

  it('does nothing if id is unknown', () => {
    const s = replay([{ type: 'IntentionAnswered', id: 'ghost', answered_at: 1 }])
    expect(s.movements.size).toBe(0)
  })
})

describe('movement projection — IntentionExpired', () => {
  it('closes a bounded intention with expired closure_kind', () => {
    const s = replay([
      {
        type: 'IntentionRaised',
        id: 'i1',
        text: 'novena',
        cadence: 'bounded',
        bounded_until: 9000,
        raised_at: 100,
      },
      { type: 'IntentionExpired', id: 'i1', expired_at: 9000 },
    ])

    const m = s.movements.get('i1')!
    expect(m.state).toBe('closed')
    expect(m.closure_kind).toBe('expired')
    expect(m.closed_at).toBe(9000)
  })
})

describe('movement projection — IntentionRetired', () => {
  it('closes a perpetual intention with retired closure_kind', () => {
    const s = replay([
      { type: 'IntentionRaised', id: 'i1', text: 'family', cadence: 'perpetual', raised_at: 1 },
      { type: 'IntentionRetired', id: 'i1', retired_at: 200 },
    ])

    const m = s.movements.get('i1')!
    expect(m.state).toBe('closed')
    expect(m.closure_kind).toBe('retired')
    expect(m.closed_at).toBe(200)
  })
})

describe('movement projection — IntentionUpdated', () => {
  it('updates text, subject, cadence, bounded_until', () => {
    const s = replay([
      { type: 'IntentionRaised', id: 'i1', text: 'old', cadence: 'perpetual', raised_at: 1 },
      {
        type: 'IntentionUpdated',
        id: 'i1',
        text: 'new',
        subject: 'mom',
        cadence: 'bounded',
        bounded_until: 5000,
      },
    ])

    const m = s.movements.get('i1')!
    expect(m.text).toBe('new')
    expect(m.subject).toBe('mom')
    expect(m.cadence).toBe('bounded')
    expect(m.bounded_until).toBe(5000)
  })

  it('clears subject when explicitly set to null', () => {
    const s = replay([
      {
        type: 'IntentionRaised',
        id: 'i1',
        text: 't',
        subject: 'mom',
        cadence: 'perpetual',
        raised_at: 1,
      },
      { type: 'IntentionUpdated', id: 'i1', subject: null },
    ])

    expect(s.movements.get('i1')?.subject).toBeUndefined()
  })

  it('clears bounded_until when explicitly set to null', () => {
    const s = replay([
      {
        type: 'IntentionRaised',
        id: 'i1',
        text: 't',
        cadence: 'bounded',
        bounded_until: 5000,
        raised_at: 1,
      },
      { type: 'IntentionUpdated', id: 'i1', cadence: 'perpetual', bounded_until: null },
    ])

    const m = s.movements.get('i1')!
    expect(m.cadence).toBe('perpetual')
    expect(m.bounded_until).toBeUndefined()
  })
})

describe('movement projection — Thanksgiving lifecycle', () => {
  it('ThanksgivingOffered creates an active thanksgiving', () => {
    const s = replay([
      { type: 'ThanksgivingOffered', id: 't1', text: 'a sunny day', offered_at: 100 },
    ])

    const m = s.movements.get('t1')!
    expect(m.kind).toBe('thanksgiving')
    expect(m.text).toBe('a sunny day')
    expect(m.cadence).toBeUndefined()
    expect(m.state).toBe('active')
    expect(s.movementsByKind.get('thanksgiving')?.has('t1')).toBe(true)
  })

  it('ThanksgivingUpdated edits text and subject', () => {
    const s = replay([
      { type: 'ThanksgivingOffered', id: 't1', text: 'a', offered_at: 100 },
      { type: 'ThanksgivingUpdated', id: 't1', text: 'b', subject: 'parish' },
    ])

    const m = s.movements.get('t1')!
    expect(m.text).toBe('b')
    expect(m.subject).toBe('parish')
  })

  it('ThanksgivingRetired closes with retired closure', () => {
    const s = replay([
      { type: 'ThanksgivingOffered', id: 't1', text: 'a', offered_at: 100 },
      { type: 'ThanksgivingRetired', id: 't1', retired_at: 200 },
    ])

    const m = s.movements.get('t1')!
    expect(m.state).toBe('closed')
    expect(m.closure_kind).toBe('retired')
    expect(m.closed_at).toBe(200)
  })
})
