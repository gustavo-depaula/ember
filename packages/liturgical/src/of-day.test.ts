import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LiturgicalEntry } from './calendar-types'
import { resolveOfDay } from './of-day'

const entries: LiturgicalEntry[] = JSON.parse(
  readFileSync(new URL('../../../content/liturgical/of-calendar.json', import.meta.url), 'utf-8'),
)

const day = (y: number, m: number, d: number) => resolveOfDay(new Date(y, m - 1, d), entries)

describe('resolveOfDay — GIRM precedence', () => {
  it('Trinity Sunday (solemnity) beats the Visitation feast — 2026-05-31', () => {
    const r = day(2026, 5, 31)
    expect(r.principal.id).toBe('tempore.solemnity.most-holy-trinity')
    expect(r.principal.kind).toBe('temporal')
    // Visitation present but suppressed (not the principal, not an alternate).
    expect(r.others.some((c) => c.id === 'sanctorale.05-31')).toBe(true)
  })

  it('Mary, Mother of the Church (memorial) is celebrated on a ferial Monday — 2026-05-25', () => {
    const r = day(2026, 5, 25)
    expect(r.principal.id).toBe('sanctorale.movable.05-35')
    expect(r.principal.kind).toBe('sanctoral')
  })

  it("a saint's feast loses to the Ordinary Time Sunday it falls on — St Luke 2026-10-18", () => {
    const r = day(2026, 10, 18)
    expect(r.principal.kind).toBe('temporal')
    expect(r.principal.precedence).toBe(6) // Sunday of Ordinary Time
    expect(r.others.some((c) => c.id === 'sanctorale.10-18')).toBe(true) // St Luke suppressed
  })

  it('a Feast of the Lord outranks the Ordinary Time Sunday it falls on — Lateran 2025-11-09', () => {
    const r = day(2025, 11, 9)
    expect(r.principal.id).toBe('sanctorale.11-09')
    expect(r.principal.precedence).toBe(5) // Feast of the Lord
  })

  it('a sanctoral solemnity beats the Sunday it falls on — All Saints 2026-11-01', () => {
    const r = day(2026, 11, 1)
    expect(r.principal.kind).toBe('sanctoral')
    expect(r.principal.rank).toBe('solemnity')
  })

  it('a weekday memorial is celebrated over the ferial day', () => {
    // 2026-01-21 St Agnes (memorial), a Wednesday in Ordinary Time.
    const r = day(2026, 1, 21)
    expect(r.principal.id).toBe('sanctorale.01-21')
    expect(r.principal.rank).toBe('memorial')
  })

  it('an ordinary weekday with no saint resolves to the ferial Mass', () => {
    // 2026-01-15 Thursday, Ordinary Time, no universal celebration.
    const r = day(2026, 1, 15)
    expect(r.principal.kind).toBe('temporal')
    expect(r.principal.precedence).toBe(13)
  })
})
