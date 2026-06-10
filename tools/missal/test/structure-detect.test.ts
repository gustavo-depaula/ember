import { describe, expect, it } from 'vitest'
import { assignSectionToPart, detectStructure } from '../src/enrich/structure-detect'

describe('detectStructure', () => {
  it('detects the five classic special rites', () => {
    expect(detectStructure({ 'pt-BR': 'Domingo de Ramos da Paixão do Senhor' })).toBe(
      'mass-with-blessing-and-procession',
    )
    expect(detectStructure({ 'pt-BR': 'Missa do Crisma' })).toBe('chrism-mass')
    expect(detectStructure({ 'pt-BR': 'Missa Vespertina da Santa Ceia do Senhor' })).toBe('lords-supper')
    expect(detectStructure({ 'pt-BR': 'Sexta-feira Santa da Paixão do Senhor' })).toBe('good-friday')
    expect(detectStructure({ la: 'VIGILIA PASCHALIS IN NOCTE SANCTA' })).toBe('easter-vigil')
  })

  it('detects the census extensions: ashes, Candlemas, vigil-mass', () => {
    expect(detectStructure({ 'pt-BR': 'Quarta-feira de Cinzas' })).toBe('mass-with-ashes')
    expect(detectStructure({ 'pt-BR': 'Apresentação do Senhor' })).toBe(
      'mass-with-blessing-and-procession',
    )
    expect(detectStructure({ 'pt-BR': 'Natal do Senhor' }, { 'pt-BR': 'Missa da Vigília' })).toBe(
      'vigil-mass',
    )
    expect(
      detectStructure({ 'en-US': 'Pentecost Sunday' }, { 'en-US': 'Solemnity At the Vigil Mass' }),
    ).toBe('vigil-mass')
  })

  it('defaults to mass', () => {
    expect(detectStructure({ 'pt-BR': 'Primeiro Domingo do Advento' })).toBe('mass')
    expect(detectStructure()).toBe('mass')
  })
})

describe('assignSectionToPart', () => {
  it('routes Easter Vigil headings to their typed parts', () => {
    expect(
      assignSectionToPart('easter-vigil', { 'pt-BR': 'Primeira Parte: Liturgia da Luz' }),
    ).toBe('serviceOfLight')
    expect(
      assignSectionToPart('easter-vigil', { 'pt-BR': 'Terceira Parte: Liturgia Batismal' }),
    ).toBe('baptismalLiturgy')
  })

  it('routes Good Friday parts', () => {
    expect(
      assignSectionToPart('good-friday', { 'pt-BR': 'Segunda Parte: Adoração da Santa Cruz' }),
    ).toBe('adorationOfTheCross')
  })

  it('returns undefined for unknown headings and plain masses', () => {
    expect(assignSectionToPart('easter-vigil', { 'pt-BR': 'Algo Desconhecido' })).toBeUndefined()
    expect(assignSectionToPart('mass', { 'pt-BR': 'Qualquer' })).toBeUndefined()
  })
})
