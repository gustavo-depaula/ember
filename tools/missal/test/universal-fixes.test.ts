import { describe, expect, it } from 'vitest'
import {
  fixDoubledAlleluia,
  fixDoublePeriod,
  fixTitleTypos,
  stripLeadingRomanLeak,
} from '../src/fixes/universal'

describe('stripLeadingRomanLeak', () => {
  it('strips concatenated roman verse markers', () => {
    expect(stripLeadingRomanLeak('IEn ce jour-là')).toBe('En ce jour-là')
    expect(stripLeadingRomanLeak('IVoici le Seigneur')).toBe('Voici le Seigneur')
  })

  it('preserves French century ordinals and real numerals', () => {
    expect(stripLeadingRomanLeak('IVe siècle')).toBe('IVe siècle')
    expect(stripLeadingRomanLeak('II Domingo')).toBe('II Domingo')
  })
})

describe('fixDoubledAlleluia', () => {
  it('adds the missing comma and lowercases the repetition', () => {
    expect(fixDoubledAlleluia('Aleluya Aleluya. Esta es')).toBe('Aleluya, aleluya. Esta es')
  })

  it('inserts a period when the doubled form runs into the verse', () => {
    expect(fixDoubledAlleluia('Aleluia Aleluia Vinde a mim')).toBe('Aleluia, aleluia. Vinde a mim')
  })
})

describe('fixDoublePeriod', () => {
  it('collapses exactly two periods, never ellipses', () => {
    expect(fixDoublePeriod('Senhor.. Ou:')).toBe('Senhor. Ou:')
    expect(fixDoublePeriod('espera… continua...')).toBe('espera… continua...')
  })
})

describe('fixTitleTypos', () => {
  it('fixes numeric prefixes and mid-word capitals', () => {
    expect(fixTitleTypos('8.THE MOST HOLY NAME')).toBe('8. THE MOST HOLY NAME')
    expect(fixTitleTypos('Corpus ChristI')).toBe('Corpus Christi')
    expect(fixTitleTypos('BeaTa Maria')).toBe('Beata Maria')
  })
})
