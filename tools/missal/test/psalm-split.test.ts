import type { Line } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { splitPsalmLines } from '../src/enrich/psalm-split'

const r = (text: string): Line[number] => ({ type: 'rubric', text })
const t = (text: string): Line[number] => ({ type: 'text', text })

describe('splitPsalmLines', () => {
  it('splits anchored refrain + verses', () => {
    const lines: Line[] = [
      [r('℟.'), t('O Senhor é meu pastor, nada me faltará.')],
      [t('Verso um linha um.')],
      [t('Verso um linha dois.')],
      [r('℟.'), t('O Senhor é meu pastor, nada me faltará.')],
      [t('Verso dois linha um.')],
      [r('℟.'), t('O Senhor é meu pastor, nada me faltará.')],
    ]
    const split = splitPsalmLines(lines)
    expect(split).toBeDefined()
    expect(split!.primary).toEqual([[t('O Senhor é meu pastor, nada me faltará.')]])
    expect(split!.verses).toHaveLength(2)
    expect(split!.verses[0]).toEqual([[t('Verso um linha um.')], [t('Verso um linha dois.')]])
    expect(split!.alternatives).toHaveLength(0)
  })

  it('extracts deduped alternate refrains after "vel" markers', () => {
    const lines: Line[] = [
      [r('℟.'), t('Aleluia, aleluia, aleluia.')],
      [r('vel:')],
      [t('Louvai o Senhor, porque ele é bom.')],
      [t('Verso um.')],
      [r('℟.'), t('Aleluia, aleluia, aleluia.')],
      [r('vel:')],
      [t('Louvai o Senhor, porque ele é bom.')],
      [t('Verso dois.')],
    ]
    const split = splitPsalmLines(lines)
    expect(split).toBeDefined()
    expect(split!.alternatives).toHaveLength(1)
    expect(split!.alternatives[0]).toEqual([[t('Louvai o Senhor, porque ele é bom.')]])
    expect(split!.verses).toHaveLength(2)
  })

  it('handles multi-line refrains compressed on the first anchor', () => {
    const lines: Line[] = [
      [r('℟.'), t('Primeira parte. Segunda parte.')],
      [t('Verso.')],
      [r('℟.'), t('Primeira parte.')],
      [t('Segunda parte.')],
    ]
    const split = splitPsalmLines(lines)
    expect(split).toBeDefined()
    // Canonical refrain derives from the LAST anchor (two lines).
    expect(split!.primary).toEqual([[t('Primeira parte.')], [t('Segunda parte.')]])
    expect(split!.verses).toEqual([[[t('Verso.')]]])
  })

  it('falls back to repetition detection without anchors', () => {
    const lines: Line[] = [
      [t('Refrão sem marcador.')],
      [t('Verso um.')],
      [t('Refrão sem marcador.')],
      [t('Verso dois.')],
      [t('Refrão sem marcador.')],
    ]
    const split = splitPsalmLines(lines)
    expect(split).toBeDefined()
    expect(split!.primary).toEqual([[t('Refrão sem marcador.')]])
    expect(split!.verses).toHaveLength(2)
  })

  it('returns undefined for unsplittable content', () => {
    expect(splitPsalmLines([])).toBeUndefined()
    expect(splitPsalmLines([[t('Uma linha só, sem repetição.')]])).toBeUndefined()
  })
})
