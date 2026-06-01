import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getDoSanctiId, getDoTemporaId } from './do-file-id'
import { chooseProperSourceByRank } from './resolve'

// DO occurrence values extracted by scripts/build-ef-ranks.mjs.
const ranks: Record<string, number> = JSON.parse(
  readFileSync(new URL('../../../content/propers/ef-ranks.json', import.meta.url), 'utf-8'),
)

const choose = (y: number, m: number, d: number) =>
  chooseProperSourceByRank(
    getDoTemporaId(new Date(y, m - 1, d)),
    getDoSanctiId(new Date(y, m - 1, d)),
    ranks,
  )

describe('EF rank extraction + DO-rank-based source choice', () => {
  it('extracts the 1962 (rubrica 1960) precedence values', () => {
    expect(ranks['08-15']).toBe(6.5) // Assumption — the rubrica-1960 override, not 7
    expect(ranks['01-21']).toBe(3) // St Agnes, Duplex
    expect(ranks['Pent01-0']).toBe(6.5) // Trinity Sunday
    expect(ranks['Pent01-1']).toBe(1) // a ferial weekday
  })

  it('a sanctoral solemnity (Assumption) takes its own Mass', () => {
    expect(choose(2026, 8, 15)).toBe('sancti')
  })

  it('a Duplex saint on a ferial weekday takes the saint’s Mass', () => {
    // 2026-01-21 St Agnes (Duplex, 3) vs the Epiphany-season feria (1).
    expect(choose(2026, 1, 21)).toBe('sancti')
  })

  it('an ordinary Sunday after Pentecost keeps the Sunday Mass', () => {
    // 2026-06-07 is the 2nd Sunday after Pentecost (no superseding feast).
    expect(choose(2026, 6, 7)).toBe('tempora')
  })

  it('Christmas resolves to the sancti Mass (DO files it under 12-25)', () => {
    expect(choose(2026, 12, 25)).toBe('sancti')
  })
})
