import { describe, expect, it } from 'vitest'

import { buildSession } from './queue'
import type { MemorizationCardState } from './types'

const TODAY = '2026-05-09'

function card(overrides: Partial<MemorizationCardState>): MemorizationCardState {
  return {
    prayerId: 'prayer/x',
    language: 'en-US',
    portionIndex: 0,
    totalLines: 5,
    mastery: 0,
    ease: 2.5,
    intervalDays: 0,
    dueAt: TODAY,
    lastSeenAt: null,
    lastMode: null,
    coldSuccesses: 0,
    hasFirstColdBonus: false,
    createdAt: 0,
    ...overrides,
  }
}

function reviewCards(count: number, baseDue = '2026-05-01'): MemorizationCardState[] {
  return Array.from({ length: count }, (_, i) =>
    card({
      prayerId: `prayer/r-${i}`,
      mastery: 1,
      dueAt: addDayString(baseDue, i),
    }),
  )
}

function newCards(count: number, baseCreatedAt = 1_000): MemorizationCardState[] {
  return Array.from({ length: count }, (_, i) =>
    card({ prayerId: `prayer/n-${i}`, mastery: 0, createdAt: baseCreatedAt + i }),
  )
}

function addDayString(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

describe('buildSession', () => {
  it('returns up to 8 review + 2 new at default cap=10', () => {
    const session = buildSession({
      allCards: [...reviewCards(20), ...newCards(20)],
      today: TODAY,
    })
    expect(session).toHaveLength(10)
    const reviewSelected = session.filter((c) => c.mastery > 0)
    const newSelected = session.filter((c) => c.mastery === 0)
    expect(reviewSelected).toHaveLength(8)
    expect(newSelected).toHaveLength(2)
  })

  it('orders reviews by dueAt ascending (oldest first)', () => {
    const cards = [
      card({ prayerId: 'a', mastery: 1, dueAt: '2026-05-08' }),
      card({ prayerId: 'b', mastery: 1, dueAt: '2026-05-01' }),
      card({ prayerId: 'c', mastery: 1, dueAt: '2026-05-05' }),
    ]
    const session = buildSession({ allCards: cards, today: TODAY })
    expect(session.map((c) => c.prayerId)).toEqual(['b', 'c', 'a'])
  })

  it('orders new cards by createdAt ascending (oldest opt-in first)', () => {
    const cards = [
      card({ prayerId: 'a', mastery: 0, createdAt: 3000 }),
      card({ prayerId: 'b', mastery: 0, createdAt: 1000 }),
      card({ prayerId: 'c', mastery: 0, createdAt: 2000 }),
    ]
    // With no review pool and 3 new cards, the relaxed cap fits all three.
    const session = buildSession({ allCards: cards, today: TODAY })
    expect(session.map((c) => c.prayerId)).toEqual(['b', 'c', 'a'])
  })

  it('skips review cards not yet due', () => {
    const cards = [
      card({ prayerId: 'past', mastery: 1, dueAt: '2026-05-01' }),
      card({ prayerId: 'today', mastery: 1, dueAt: TODAY }),
      card({ prayerId: 'future', mastery: 1, dueAt: '2026-05-20' }),
    ]
    const session = buildSession({ allCards: cards, today: TODAY })
    expect(session.map((c) => c.prayerId)).toEqual(['past', 'today'])
  })

  it('relaxes cap when review pool is empty — fills with new cards up to cap', () => {
    const session = buildSession({ allCards: newCards(15), today: TODAY })
    expect(session).toHaveLength(10)
    expect(session.every((c) => c.mastery === 0)).toBe(true)
  })

  it('extends new allocation when review pool falls short', () => {
    const session = buildSession({
      allCards: [...reviewCards(3), ...newCards(20)],
      today: TODAY,
    })
    expect(session).toHaveLength(10)
    expect(session.filter((c) => c.mastery > 0)).toHaveLength(3)
    expect(session.filter((c) => c.mastery === 0)).toHaveLength(7)
  })

  it('does not exceed cap when both pools are abundant', () => {
    const session = buildSession({
      allCards: [...reviewCards(50), ...newCards(50)],
      today: TODAY,
    })
    expect(session).toHaveLength(10)
  })

  it('returns fewer cards than cap when both pools are short', () => {
    const session = buildSession({
      allCards: [...reviewCards(2), ...newCards(1)],
      today: TODAY,
    })
    expect(session).toHaveLength(3)
  })

  it('handles empty card pool', () => {
    expect(buildSession({ allCards: [], today: TODAY })).toEqual([])
  })

  it('respects custom cap and newRatio', () => {
    const session = buildSession({
      allCards: [...reviewCards(20), ...newCards(20)],
      today: TODAY,
      cap: 5,
      newRatio: 0.4,
    })
    expect(session).toHaveLength(5)
    expect(session.filter((c) => c.mastery === 0)).toHaveLength(2)
    expect(session.filter((c) => c.mastery > 0)).toHaveLength(3)
  })

  it('caps new cards at the default 2 even when more new are available', () => {
    const session = buildSession({
      allCards: [...reviewCards(20), ...newCards(20)],
      today: TODAY,
    })
    // 20 review pool fully fills 8, no shortfall, so new cap stays at 2
    expect(session.filter((c) => c.mastery === 0)).toHaveLength(2)
  })
})
