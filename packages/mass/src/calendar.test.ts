import { describe, expect, it } from 'vitest'
import { pickCycle } from './calendar'
import type { Celebration } from './types'

function celebration(readings: Record<string, unknown>): Celebration {
  return {
    id: 'x',
    title: {},
    rite: 'mass',
    rank: 'solemnity',
    primary: { id: 'x', source: 'tempore', readings },
    alternates: [],
  }
}

describe('pickCycle', () => {
  // Corpus Christi 2026 = Thursday 2026-06-04. A Thursday solemnity must still
  // resolve to the Sunday cycle (A/B/C) — its formulary doesn't carry I/II keys,
  // so falling back to the weekday cycle would leave every reading slot empty.
  it('uses the Sunday cycle when the formulary keys readings under A/B/C', () => {
    const cycle = pickCycle(new Date(2026, 5, 4), celebration({ A: {}, B: {}, C: {} }))
    expect(['A', 'B', 'C']).toContain(cycle)
  })

  it("returns 'default' when the formulary has default-keyed readings", () => {
    const cycle = pickCycle(new Date(2026, 0, 6), celebration({ default: {} }))
    expect(cycle).toBe('default')
  })

  it('uses the weekday cycle when the formulary keys readings under I/II', () => {
    const cycle = pickCycle(new Date(2026, 5, 2), celebration({ I: {}, II: {} }))
    expect(['I', 'II']).toContain(cycle)
  })

  it('falls back to date-based cycle when no celebration is supplied', () => {
    expect(['A', 'B', 'C']).toContain(pickCycle(new Date(2026, 5, 7))) // Sunday
    expect(['I', 'II']).toContain(pickCycle(new Date(2026, 5, 4))) // Thursday
  })
})
