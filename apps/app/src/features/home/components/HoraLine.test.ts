import { describe, expect, it } from 'vitest'

import { getCurrentHora } from './HoraLine'

describe('getCurrentHora', () => {
  it('maps the eight canonical hours across the day', () => {
    expect(getCurrentHora(0)).toBe('matins')
    expect(getCurrentHora(4)).toBe('matins')
    expect(getCurrentHora(5)).toBe('lauds')
    expect(getCurrentHora(7)).toBe('lauds')
    expect(getCurrentHora(8)).toBe('prime')
    expect(getCurrentHora(9)).toBe('terce')
    expect(getCurrentHora(11)).toBe('terce')
    expect(getCurrentHora(12)).toBe('sext')
    expect(getCurrentHora(14)).toBe('sext')
    expect(getCurrentHora(15)).toBe('none')
    expect(getCurrentHora(16)).toBe('none')
    expect(getCurrentHora(17)).toBe('vespers')
    expect(getCurrentHora(19)).toBe('vespers')
    expect(getCurrentHora(20)).toBe('compline')
    expect(getCurrentHora(23)).toBe('compline')
  })
})
