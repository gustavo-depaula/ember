import { describe, expect, it } from 'vitest'

import type { Movement } from '@/db/events/state'

import { findExpiredIntentionIds } from '../findExpired'

function intent(partial: Partial<Movement> & { id: string }): Movement {
  return {
    id: partial.id,
    kind: 'intention',
    text: partial.text ?? 'x',
    cadence: partial.cadence,
    bounded_until: partial.bounded_until,
    state: partial.state ?? 'active',
    closure_kind: partial.closure_kind,
    recorded_at: partial.recorded_at ?? 0,
    closed_at: partial.closed_at,
    notes: partial.notes,
    subject: partial.subject,
  }
}

describe('findExpiredIntentionIds', () => {
  const now = 10_000

  it('returns ids of active bounded intentions past their bounded_until', () => {
    const movements = new Map<string, Movement>([
      ['a', intent({ id: 'a', cadence: 'bounded', bounded_until: 5_000, state: 'active' })],
      ['b', intent({ id: 'b', cadence: 'bounded', bounded_until: 9_999, state: 'active' })],
      ['c', intent({ id: 'c', cadence: 'bounded', bounded_until: 20_000, state: 'active' })],
    ])

    expect(new Set(findExpiredIntentionIds(movements, now))).toEqual(new Set(['a', 'b']))
  })

  it('ignores closed intentions (already eventized)', () => {
    const movements = new Map<string, Movement>([
      [
        'a',
        intent({
          id: 'a',
          cadence: 'bounded',
          bounded_until: 5_000,
          state: 'closed',
          closure_kind: 'expired',
        }),
      ],
    ])

    expect(findExpiredIntentionIds(movements, now)).toEqual([])
  })

  it('ignores non-bounded intentions', () => {
    const movements = new Map<string, Movement>([
      ['a', intent({ id: 'a', cadence: 'perpetual', state: 'active' })],
      ['b', intent({ id: 'b', cadence: 'goal', state: 'active' })],
    ])

    expect(findExpiredIntentionIds(movements, now)).toEqual([])
  })

  it('ignores thanksgivings', () => {
    const movements = new Map<string, Movement>([
      [
        'g',
        {
          id: 'g',
          kind: 'thanksgiving',
          text: 'x',
          state: 'active',
          recorded_at: 0,
        },
      ],
    ])

    expect(findExpiredIntentionIds(movements, now)).toEqual([])
  })
})
