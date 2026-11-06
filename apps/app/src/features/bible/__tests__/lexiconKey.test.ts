import { describe, expect, it } from 'vitest'

import { lexiconKey } from '../lexiconKey'

describe('lexiconKey', () => {
  it('strips accents and breathings and folds final sigma', () => {
    expect(lexiconKey('λόγος')).toBe('λογοσ')
    expect(lexiconKey('λόγος')).toBe(lexiconKey('λογός'))
  })

  it('lowercases capitals that carry a breathing', () => {
    expect(lexiconKey('Ἰησοῦς')).toBe('ιησουσ')
  })

  it('gives homographs one key', () => {
    expect(lexiconKey('εἰμί')).toBe('ειμι')
    expect(lexiconKey('εἶμι')).toBe(lexiconKey('εἰμί'))
  })

  it('drops the iota subscript', () => {
    expect(lexiconKey('ᾠδή')).toBe('ωδη')
  })

  it('drops homograph numbers, hyphens and punctuation', () => {
    expect(lexiconKey('λέγω2')).toBe('λεγω')
    expect(lexiconKey('-ἄγνυμι,')).toBe('αγνυμι')
  })
})
