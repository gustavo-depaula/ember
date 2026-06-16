// Tests for buildDoYear — the EF display calendar built from resolveDay. Uses
// the imported content/do corpus (no Perl clone needed), so it runs in CI.

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import { contentDo } from '../node/testFixtures'
import { resolveDay } from './precedence'
import { num } from './state'
import { buildDoYear, type DoCalendarDay } from './year'

const version = 'Rubrics 1960 - 1960'
const year = 2025

describe.skipIf(!existsSync(contentDo))('buildDoYear', () => {
  const loader = createFsLoader(contentDo)
  let days: DoCalendarDay[]
  const on = (m: number, d: number) => days.filter((x) => x.month === m && x.day === d)

  it('builds the year', async () => {
    days = await buildDoYear({ loader, year, version })
    expect(days.length).toBeGreaterThan(200)
  })

  it('surfaces the great feasts with the right name, rank and HDO flag', () => {
    const christmas = on(12, 25)[0]
    expect(christmas?.kind).toBe('sanctoral')
    expect(christmas?.name).toMatch(/Nativitate Domini/)
    expect(christmas?.rank).toBeGreaterThanOrEqual(6)
    expect(christmas?.holyDayOfObligation).toBe(true)

    const assumption = on(8, 15)[0]
    expect(assumption?.name).toMatch(/Assumptione/)
    expect(assumption?.holyDayOfObligation).toBe(true)

    const convPaul = on(1, 25)[0]
    expect(convPaul?.kind).toBe('sanctoral')
    expect(convPaul?.name).toMatch(/Pauli/)
    expect(convPaul?.holyDayOfObligation).toBe(false)
  })

  it('places the Sacred Heart on Easter + 68 (Friday after the Corpus Christi octave)', () => {
    // Easter 2025 = Apr 20 → +68 = Jun 27.
    const sacredHeart = on(6, 27)[0]
    expect(sacredHeart?.kind).toBe('temporal')
    expect(sacredHeart?.rank).toBeGreaterThanOrEqual(6)
  })

  it('drops ordinary green Sundays and ferias (temporal entries are all privileged)', () => {
    for (const d of days) {
      if (d.kind === 'temporal') expect(d.rank).toBeGreaterThanOrEqual(6)
    }
  })

  it('names every sanctoral day and leaves temporal names to the UI', () => {
    for (const d of days) {
      if (d.kind === 'sanctoral') expect(d.name.length).toBeGreaterThan(0)
      else expect(d.name).toBe('')
    }
  })

  it('emits kind-prefixed ids', () => {
    for (const d of days) expect(d.id).toMatch(/^ef\//)
  })

  it('matches resolveDay on representative days', async () => {
    for (const [m, d] of [
      [1, 25],
      [8, 15],
      [11, 1],
      [12, 25],
    ] as const) {
      const r = await resolveDay({ loader, day: d, month: m, year, version, hora: '', missa: true })
      const principal = on(m, d)[0]
      // The surfaced sanctoral winner is the office winner.
      expect(principal?.winner).toBe(r.winner)
      expect(num(String(principal?.rank))).toBe(r.rank)
    }
  })
})
