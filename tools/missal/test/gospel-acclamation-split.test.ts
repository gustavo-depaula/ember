import type { Line } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { splitGospelAcclamation } from '../src/enrich/gospel-acclamation-split'

const t = (text: string): Line[number] => ({ type: 'text', text })
const ref = (text: string): Line[number] => ({ type: 'reference', text })

describe('splitGospelAcclamation', () => {
  it('peels header, refrain wrap, and citation (pt-BR alleluia)', () => {
    const split = splitGospelAcclamation({
      'pt-BR': [
        [t('Aclamação ao Evangelho'), ref('Sl 84, 8')],
        [t('Aleluia, aleluia. Mostrai-nos, Senhor, a vossa misericórdia. Aleluia.')],
      ],
    })
    expect(split).toBeDefined()
    expect(split!.mode).toBe('alleluia')
    expect(split!.citation['pt-BR']).toBe('Sl 84, 8')
    expect(split!.acclamation['pt-BR']).toEqual([[{ type: 'response', text: 'Aleluia, aleluia.' }]])
    const verseSegs = split!.verse['pt-BR']![0]
    expect(verseSegs[0]).toEqual({ type: 'response', text: 'Aleluia, aleluia.' })
    expect(verseSegs[1].text).toContain('Mostrai-nos, Senhor')
    expect(verseSegs[2]).toEqual({ type: 'response', text: 'Aleluia.' })
  })

  it('derives versus-ante-evangelium from the Latin header (Lent)', () => {
    const split = splitGospelAcclamation({
      la: [[t('Versus ante Evangelium Verbum tuum, Dómine, lucérna pédibus meis.')]],
      'pt-BR': [[t('Aclamação ao Evangelho Tua palavra, Senhor, é luz para meus passos.')]],
    })
    expect(split).toBeDefined()
    expect(split!.mode).toBe('versus-ante-evangelium')
    expect(split!.acclamation.la).toBeUndefined()
  })

  it('derives alleluia-or-versus from the combined Latin header', () => {
    const split = splitGospelAcclamation({
      la: [[t('Alleluia vel Versus ante Evangelium Sit nomen Dómini benedíctum.')]],
    })
    expect(split).toBeDefined()
    expect(split!.mode).toBe('alleluia-or-versus')
  })

  it('falls back to refrain presence when no signal language exists', () => {
    const withRefrain = splitGospelAcclamation({
      'en-US': [[t('Alleluia, alleluia. Speak, Lord, your servant is listening. Alleluia.')]],
    })
    expect(withRefrain!.mode).toBe('alleluia')

    const without = splitGospelAcclamation({
      'en-US': [[t('Glory to you, O Christ, Word of the living God.')]],
    })
    expect(without!.mode).toBe('versus-ante-evangelium')
  })

  it('returns undefined for empty input', () => {
    expect(splitGospelAcclamation({})).toBeUndefined()
  })
})
