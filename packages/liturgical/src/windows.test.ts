import { describe, expect, it } from 'vitest'
import { logicalDay, windowFor } from './windows'

const date = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h)

describe('logicalDay', () => {
  it('1am with cutoff 4 returns previous day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 1, 30), 4)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(4)
    expect(result.getDate()).toBe(6)
    expect(result.getHours()).toBe(0)
  })

  it('4am returns same day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 4, 0), 4)
    expect(result.getDate()).toBe(7)
  })

  it('4:01am returns same day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 4, 1), 4)
    expect(result.getDate()).toBe(7)
  })

  it('cutoff 0 (midnight) is identity (start of civil day)', () => {
    const result = logicalDay(new Date(2026, 4, 7, 23, 59), 0)
    expect(result.getDate()).toBe(7)
  })

  it('default cutoff is 4', () => {
    const result = logicalDay(new Date(2026, 4, 7, 3, 0))
    expect(result.getDate()).toBe(6)
  })
})

describe('windowFor — daily', () => {
  it('current returns logical day start..end', () => {
    const w = windowFor('daily', date(2026, 5, 7), 'current')
    expect(new Date(w.starts_at).getDate()).toBe(7)
    expect(new Date(w.ends_at).getDate()).toBe(7)
    expect(new Date(w.ends_at).getHours()).toBe(23)
  })

  it('next returns the next day', () => {
    const w = windowFor('daily', date(2026, 5, 7), 'next')
    expect(new Date(w.starts_at).getDate()).toBe(8)
  })

  it('next across month boundary', () => {
    const w = windowFor('daily', date(2026, 5, 31), 'next')
    expect(new Date(w.starts_at).getMonth()).toBe(5)
    expect(new Date(w.starts_at).getDate()).toBe(1)
  })

  it('next anchored at a logicalDay midnight resolves to tomorrow', () => {
    // Regression: the engine calls `windowFor(level, ec.logicalDay(), 'next')`
    // where `ec.logicalDay()` returns the logical-day midnight. Anchoring at
    // a midnight Date is a routine input — windowFor must not re-bucket it
    // back a day (the original implementation called `logicalDay` internally,
    // which mapped midnight → previous day → "next" landed on today instead
    // of tomorrow).
    const todayMidnight = new Date(2026, 4, 7) // May 7 00:00 local
    const w = windowFor('daily', todayMidnight, 'next')
    expect(new Date(w.starts_at).getMonth()).toBe(4)
    expect(new Date(w.starts_at).getDate()).toBe(8)
  })
})
