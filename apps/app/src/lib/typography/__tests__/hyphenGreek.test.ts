import { describe, expect, it } from 'vitest'

import { hyphenateGreek } from '../hyphenGreek'

describe('hyphenateGreek', () => {
  it('breaks polytonic words at their syllables, keeping every mark', () => {
    expect(hyphenateGreek('ἐγένετο')).toEqual(['ἐ', 'γέ', 'νε', 'το'])
    expect(hyphenateGreek('ἄνθρωπος')).toEqual(['ἄν', 'θρω', 'πος'])
    // Breathing, circumflex and iota subscript are on letters the monotonic
    // patterns never saw.
    expect(hyphenateGreek('ἀρχῇ')).toEqual(['ἀρ', 'χῇ'])
    expect(hyphenateGreek('σκοτίᾳ')).toEqual(['σκο', 'τίᾳ'])
  })

  it('leaves a word whose marks are not composed onto letters whole', () => {
    const decomposed = 'λόγος'.normalize('NFD')
    expect(hyphenateGreek(decomposed)).toEqual([decomposed])
  })
})
