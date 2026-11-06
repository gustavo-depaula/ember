import { describe, expect, it } from 'vitest'

import { transliterate } from '../transliterate'

describe('transliterate', () => {
  it('romanizes letter by letter', () => {
    expect(transliterate('λόγος')).toBe('logos')
    expect(transliterate('ψυχή')).toBe('psychē')
    expect(transliterate('θεός')).toBe('theos')
  })

  it('sounds a rough breathing, on a vowel, a diphthong or a rho', () => {
    expect(transliterate('ἁμαρτία')).toBe('hamartia')
    expect(transliterate('υἱός')).toBe('huios')
    expect(transliterate('αἷμα')).toBe('haima')
    expect(transliterate('ῥῆμα')).toBe('rhēma')
  })

  it('writes υ as u in a diphthong and y elsewhere, unless a diaeresis parts it', () => {
    expect(transliterate('οὐρανός')).toBe('ouranos')
    expect(transliterate('εὐαγγέλιον')).toBe('euangelion')
    expect(transliterate('Μωϋσῆς')).toBe('Mōysēs')
  })

  it('keeps a capital and nasalizes γ before a velar', () => {
    expect(transliterate('Ἰησοῦς')).toBe('Iēsous')
    expect(transliterate('ἄγγελος')).toBe('angelos')
  })
})
