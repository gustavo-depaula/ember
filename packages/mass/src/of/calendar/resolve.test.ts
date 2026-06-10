import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { OfCalendarStatics, SanctoralEntry, TemporalEntry } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { resolveOfDay } from './resolve'
import { transferredDate } from './transfers'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const load = <T>(p: string): T =>
  JSON.parse(readFileSync(`${root}content/of/calendar/${p}`, 'utf-8'))
const statics: OfCalendarStatics = {
  temporal: load<TemporalEntry[]>('temporal.json'),
  sanctoral: load<SanctoralEntry[]>('sanctoral.json'),
}

const day = (y: number, m: number, d: number) =>
  resolveOfDay(new Date(y, m - 1, d), statics, { scope: 'brazil' })

describe('resolveOfDay', () => {
  it('resolves an Ordinary Time Sunday with its cycle', () => {
    // 2026-06-14 is a Sunday in Ordinary Time; liturgical year 2026 (began
    // Advent 2025) is Year A.
    const r = day(2026, 6, 14)
    expect(r.season).toBe('ordinary-time')
    expect(r.cycle).toBe('A')
    expect(r.celebrations[0].kind).toBe('temporal')
    expect(r.celebrations[0].rank).toBe('sunday')
  })

  it('suppresses sanctoral memorials on a Sunday', () => {
    const r = day(2026, 6, 14)
    expect(r.celebrations.every((c) => c.kind === 'temporal')).toBe(true)
  })

  it('offers ferial + saint on an Ordinary Time weekday with a memorial', () => {
    // Jan 17 — St Anthony, memorial.
    const r = day(2026, 1, 17)
    const refs = r.celebrations.map((c) => c.ref)
    expect(r.celebrations.some((c) => c.kind === 'sanctoral')).toBe(true)
    expect(r.celebrations.some((c) => c.kind === 'temporal')).toBe(true)
    // The memorial outranks the ferial → principal.
    expect(r.celebrations[0].kind).toBe('sanctoral')
    expect(refs).toContain(r.temporalRef)
  })

  it('expands Christmas into multiple Mass formularies on Dec 25', () => {
    const r = day(2025, 12, 25)
    expect(r.celebrations.length).toBeGreaterThan(1)
    expect(r.celebrations.every((c) => c.kind === 'temporal')).toBe(true)
  })
})

describe('transferredDate (impeded solemnities)', () => {
  it('transfers the Annunciation out of Holy Week in 2027', () => {
    // 2027: Easter is Mar 28, so Mar 25 falls in Holy Week → Monday after the
    // Second Sunday of Easter (Easter+8 = Apr 5).
    const observed = transferredDate(3, 25, 2027)
    expect(observed.getMonth() + 1).toBe(4)
    expect(observed.getDate()).toBe(5)
  })

  it('leaves the Annunciation on Mar 25 in an unimpeded year', () => {
    const observed = transferredDate(3, 25, 2026)
    expect(observed.getMonth() + 1).toBe(3)
    expect(observed.getDate()).toBe(25)
  })
})
