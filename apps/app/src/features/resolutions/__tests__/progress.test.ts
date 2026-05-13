import { describe, expect, it } from 'vitest'
import type { Resolution, ResolutionReview } from '@/db/events'
import { resolutionProgress } from '../progress'

function res(starts: number, ends: number): Resolution {
  return {
    id: 'r1',
    text: 'x',
    level: 'daily',
    starts_at: starts,
    ends_at: ends,
    recorded_at: starts,
    source: 'examen',
  }
}

function review(
  kind: 'checkin' | 'review',
  outcome: 'kept' | 'partial' | 'broken',
  ts: number,
): ResolutionReview {
  return { resolution_id: 'r1', kind, outcome, reviewed_at: ts }
}

describe('resolutionProgress', () => {
  it('daily with no reviews returns 0/1', () => {
    const p = resolutionProgress(res(0, 1000), [])
    expect(p.kept).toBe(0)
    expect(p.total).toBe(1)
  })

  it('daily with a kept checkin returns 1/1', () => {
    const p = resolutionProgress(res(0, 1000), [review('checkin', 'kept', 500)])
    expect(p.kept).toBe(1)
  })
})
