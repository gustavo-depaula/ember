import { describe, expect, it } from 'vitest'

import { applyOutcome, initialCard } from './state'
import type { MemorizationCardState, ReviewOutcome } from './types'

const NOW_MS = Date.UTC(2026, 4, 9, 12, 0, 0) // 2026-05-09 12:00 UTC
const TODAY = '2026-05-09'

function makeCard(overrides: Partial<MemorizationCardState> = {}): MemorizationCardState {
  return {
    ...initialCard({
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      createdAt: NOW_MS,
      today: TODAY,
    }),
    ...overrides,
  }
}

function cued(result: 'got-it' | 'missed-it'): ReviewOutcome {
  return { mode: 'cued', kind: 'cued', result }
}

function tap(mode: 'letters' | 'cold', tappedLine: number): ReviewOutcome {
  return { mode, kind: 'tap', tappedLine }
}

describe('initialCard', () => {
  it('starts with mastery 0, ease 2.5, intervalDays 0', () => {
    const card = initialCard({
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      createdAt: NOW_MS,
      today: TODAY,
    })
    expect(card.mastery).toBe(0)
    expect(card.ease).toBe(2.5)
    expect(card.intervalDays).toBe(0)
    expect(card.dueAt).toBe(TODAY) // due today on creation
    expect(card.lastSeenAt).toBeNull()
    expect(card.lastMode).toBeNull()
    expect(card.coldSuccesses).toBe(0)
    expect(card.hasFirstColdBonus).toBe(false)
  })
})

describe('applyOutcome — Cued mode', () => {
  it('Got it advances mastery by 1', () => {
    const card = makeCard({ mastery: 2 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(3)
    expect(next.lastMode).toBe('cued')
    expect(next.lastSeenAt).toBe(NOW_MS)
  })

  it('Got it leaves ease unchanged', () => {
    const card = makeCard({ mastery: 2, ease: 2.5 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBe(2.5)
  })

  it('Got it caps mastery at totalLines', () => {
    const card = makeCard({ mastery: 5, totalLines: 5 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(5)
  })

  it('first Got it sets interval to 1 day', () => {
    const card = makeCard({ mastery: 0, intervalDays: 0 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.intervalDays).toBe(1)
    expect(next.dueAt).toBe('2026-05-10')
  })

  it('Missed it leaves mastery unchanged and reduces ease by 0.2', () => {
    const card = makeCard({ mastery: 3, ease: 2.5, intervalDays: 4 })
    const next = applyOutcome(card, cued('missed-it'), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(3)
    expect(next.ease).toBeCloseTo(2.3, 5)
    expect(next.intervalDays).toBe(1) // short reset
    expect(next.dueAt).toBe('2026-05-10')
  })
})

describe('applyOutcome — Letters / Cold mode', () => {
  it('tapping K above current mastery sets new mastery to K (growth)', () => {
    const card = makeCard({ mastery: 3, totalLines: 5 })
    const next = applyOutcome(card, tap('letters', 4), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(4)
    expect(next.ease).toBe(2.5) // growth: ease unchanged
  })

  it('tapping K equal to mastery is success at the same level', () => {
    const card = makeCard({ mastery: 3, totalLines: 5 })
    const next = applyOutcome(card, tap('letters', 3), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(3)
    expect(next.ease).toBe(2.5)
  })

  it('tapping K below mastery is a regression (mastery shrinks, ease drops)', () => {
    const card = makeCard({ mastery: 5, totalLines: 5, ease: 2.5 })
    const next = applyOutcome(card, tap('letters', 2), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(2)
    expect(next.ease).toBeCloseTo(2.3, 5)
    expect(next.intervalDays).toBe(1)
  })

  it('tap-nothing (K=0) floors mastery at 1 — never resets to zero', () => {
    const card = makeCard({ mastery: 5, totalLines: 5, ease: 2.5 })
    const next = applyOutcome(card, tap('letters', 0), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(1)
    expect(next.ease).toBeCloseTo(2.3, 5)
    expect(next.intervalDays).toBe(1)
  })

  it('Cold success at total lines first time bumps ease by 0.15', () => {
    const card = makeCard({
      mastery: 5,
      totalLines: 5,
      ease: 2.5,
      hasFirstColdBonus: false,
      coldSuccesses: 0,
    })
    const next = applyOutcome(card, tap('cold', 5), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBeCloseTo(2.65, 5)
    expect(next.hasFirstColdBonus).toBe(true)
    expect(next.coldSuccesses).toBe(1)
  })

  it('subsequent clean Cold reviews increment coldSuccesses but do not bump ease again', () => {
    const card = makeCard({
      mastery: 5,
      totalLines: 5,
      ease: 2.65,
      hasFirstColdBonus: true,
      coldSuccesses: 1,
    })
    const next = applyOutcome(card, tap('cold', 5), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBeCloseTo(2.65, 5)
    expect(next.coldSuccesses).toBe(2)
  })

  it('Cold regression resets coldSuccesses for re-stabilization', () => {
    const card = makeCard({
      mastery: 5,
      totalLines: 5,
      ease: 2.65,
      hasFirstColdBonus: true,
      coldSuccesses: 3,
    })
    const next = applyOutcome(card, tap('cold', 2), { now: NOW_MS, today: TODAY })
    expect(next.mastery).toBe(2)
    expect(next.coldSuccesses).toBe(0)
    // hasFirstColdBonus stays sticky — once awarded, never re-awarded
    expect(next.hasFirstColdBonus).toBe(true)
  })
})

describe('applyOutcome — ease bounds', () => {
  it('ease floors at 1.3', () => {
    const card = makeCard({ mastery: 5, totalLines: 5, ease: 1.4 })
    const next = applyOutcome(card, tap('letters', 1), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBe(1.3)
  })

  it('ease ceilings at 3.0 even with cold bonus', () => {
    const card = makeCard({
      mastery: 5,
      totalLines: 5,
      ease: 2.95,
      hasFirstColdBonus: false,
      coldSuccesses: 0,
    })
    const next = applyOutcome(card, tap('cold', 5), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBe(3.0)
  })

  it('ease never drops below 1.3 after repeated regressions', () => {
    const card = makeCard({ mastery: 5, totalLines: 5, ease: 1.3 })
    const next = applyOutcome(card, cued('missed-it'), { now: NOW_MS, today: TODAY })
    expect(next.ease).toBe(1.3)
  })
})

describe('applyOutcome — interval scheduling', () => {
  it('successful review with intervalDays=1 multiplies by ease', () => {
    const card = makeCard({ mastery: 3, ease: 2.5, intervalDays: 1 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.intervalDays).toBeCloseTo(2.5, 5)
  })

  it('successful review with intervalDays=2.5 multiplies by ease', () => {
    const card = makeCard({ mastery: 3, ease: 2.5, intervalDays: 2.5 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    expect(next.intervalDays).toBeCloseTo(6.25, 5)
  })

  it('any failure resets interval to 1 day', () => {
    const card = makeCard({ mastery: 4, ease: 2.5, intervalDays: 30 })
    const next = applyOutcome(card, cued('missed-it'), { now: NOW_MS, today: TODAY })
    expect(next.intervalDays).toBe(1)
  })

  it('dueAt is computed from today + ceil(intervalDays)', () => {
    const card = makeCard({ mastery: 3, ease: 2.5, intervalDays: 2.5 })
    const next = applyOutcome(card, cued('got-it'), { now: NOW_MS, today: TODAY })
    // intervalDays becomes 6.25, ceil → +7 days → 2026-05-16
    expect(next.dueAt).toBe('2026-05-16')
  })
})
