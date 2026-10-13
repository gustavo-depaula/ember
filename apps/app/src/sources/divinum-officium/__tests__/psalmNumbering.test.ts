import { describe, expect, it } from 'vitest'
import { alignPsalmNumbering, latinPsalmPath } from '../psalmNumbering'

// The opening of Psalm 39 as the two files have it: the Latin by the Vulgate
// verse, the Portuguese by the line.
const latin = [
  '39:2 Exspéctans exspectávi Dóminum, * et inténdit mihi.',
  '39:3 Et exaudívit preces meas: * et edúxit me de lacu misériæ, et de luto fæcis.',
  '39:3 Et státuit super petram pedes meos: * et diréxit gressus meos.',
  '39:4 Et immísit in os meum cánticum novum, * carmen Deo nostro.',
]
const portuguese = [
  '39:1 Aguardei expectante o Senhor, * e Ele me atendeu.',
  '39:2 Ouviu as minhas súplicas: * e tirou-me do abysmo da miséria e do lodo profundo.',
  '39:3 Meus pés pôs sobre pedra: * e dirigiu os meus passos.',
  '39:4 Um cântico novo pôs na minha boca, * uma canção ao nosso Deus.',
]

describe('alignPsalmNumbering', () => {
  it('numbers a psalm translated line for line as the Latin is numbered', () => {
    expect(alignPsalmNumbering(portuguese, latin)).toEqual([
      '39:2 Aguardei expectante o Senhor, * e Ele me atendeu.',
      '39:3 Ouviu as minhas súplicas: * e tirou-me do abysmo da miséria e do lodo profundo.',
      '39:3 Meus pés pôs sobre pedra: * e dirigiu os meus passos.',
      '39:4 Um cântico novo pôs na minha boca, * uma canção ao nosso Deus.',
    ])
  })

  it('leaves alone a file that is not the Latin line for line', () => {
    expect(alignPsalmNumbering(portuguese.slice(1), latin)).toEqual(portuguese.slice(1))
    const titled = ['(Canticum Sophoniæ * Soph 3:8-13)', ...latin.slice(1)]
    expect(alignPsalmNumbering(portuguese, titled)).toEqual(portuguese)
  })
})

describe('latinPsalmPath', () => {
  it('names the Latin of a vernacular psalm, and of nothing else', () => {
    expect(latinPsalmPath('horas/Portugues/Psalterium/Psalmorum/Psalm39')).toBe(
      'horas/Latin/Psalterium/Psalmorum/Psalm39',
    )
    expect(latinPsalmPath('horas/Latin/Psalterium/Psalmorum/Psalm39')).toBeUndefined()
    expect(latinPsalmPath('horas/Portugues/Psalterium/Psalmi/Psalmi minor')).toBeUndefined()
  })
})
