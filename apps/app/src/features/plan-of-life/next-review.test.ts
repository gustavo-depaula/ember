import { describe, expect, it } from 'vitest'
import type { SlotState } from '@/db/events'
import { nextReviewDate } from './next-review'

function slot(practice_id: string, schedule: object, time = '20:00'): SlotState {
  return {
    id: `${practice_id}::default`,
    practice_id,
    enabled: 1,
    sort_order: 0,
    tier: 'essential',
    time,
    time_block: 'evening',
    notify: null,
    schedule: JSON.stringify(schedule),
    variant: null,
  }
}

describe('nextReviewDate', () => {
  it('returns undefined when no review slots are configured', () => {
    expect(nextReviewDate([], new Date())).toBeUndefined()
  })

  it('returns tomorrow when today is over', () => {
    // 22:00 Wed — Examen at 21:00 already passed. Next is Thursday 21:00.
    const result = nextReviewDate(
      [slot('examination-of-conscience', { type: 'daily' }, '21:00')],
      new Date(2026, 4, 6, 22, 0),
    )
    expect(result?.practiceId).toBe('examination-of-conscience')
    expect(result?.date.getDate()).toBe(7)
  })

  it('returns today when the scheduled time has not yet passed', () => {
    const result = nextReviewDate(
      [slot('examination-of-conscience', { type: 'daily' }, '21:00')],
      new Date(2026, 4, 6, 12, 0),
    )
    expect(result?.date.getDate()).toBe(6)
    expect(result?.date.getHours()).toBe(21)
  })

  it('ignores non-review practices', () => {
    const result = nextReviewDate(
      [slot('rosary', { type: 'daily' }, '18:00')],
      new Date(2026, 4, 6, 12, 0),
    )
    expect(result).toBeUndefined()
  })

  it('ignores disabled slots', () => {
    const result = nextReviewDate(
      [{ ...slot('examination-of-conscience', { type: 'daily' }, '21:00'), enabled: 0 }],
      new Date(2026, 4, 6, 12, 0),
    )
    expect(result).toBeUndefined()
  })
})
