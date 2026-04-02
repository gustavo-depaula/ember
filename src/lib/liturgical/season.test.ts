import { describe, expect, it } from 'vitest'
import { computeEaster, getLiturgicalColor, getLiturgicalSeason } from './season'

describe('computeEaster', () => {
  it('returns correct Easter dates for known years', () => {
    expect(computeEaster(2024)).toEqual(new Date(2024, 2, 31))
    expect(computeEaster(2025)).toEqual(new Date(2025, 3, 20))
    expect(computeEaster(2026)).toEqual(new Date(2026, 3, 5))
  })
})

describe('getLiturgicalSeason', () => {
  it('returns advent for early December', () => {
    expect(getLiturgicalSeason(new Date(2025, 11, 10))).toBe('advent')
  })

  it('returns christmas for December 25', () => {
    expect(getLiturgicalSeason(new Date(2025, 11, 25))).toBe('christmas')
  })

  it('returns lent between Ash Wednesday and Easter', () => {
    expect(getLiturgicalSeason(new Date(2025, 2, 10))).toBe('lent')
  })

  it('returns easter on Easter Sunday', () => {
    expect(getLiturgicalSeason(new Date(2025, 3, 20))).toBe('easter')
  })

  it('returns ordinary time in summer', () => {
    expect(getLiturgicalSeason(new Date(2025, 6, 15))).toBe('ordinary')
  })

  it('returns ordinary time between Baptism and Ash Wednesday', () => {
    expect(getLiturgicalSeason(new Date(2025, 1, 15))).toBe('ordinary')
  })
})

describe('getLiturgicalColor', () => {
  it('maps seasons to correct colors', () => {
    expect(getLiturgicalColor('advent')).toBe('violet')
    expect(getLiturgicalColor('christmas')).toBe('white')
    expect(getLiturgicalColor('ordinary')).toBe('green')
    expect(getLiturgicalColor('lent')).toBe('violet')
    expect(getLiturgicalColor('easter')).toBe('white')
  })
})
