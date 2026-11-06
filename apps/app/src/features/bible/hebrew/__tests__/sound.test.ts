import { describe, expect, test } from 'vitest'

import { syllables } from '../sound'

describe('syllables', () => {
  test('marks the stressed syllable across pieces', () => {
    expect(syllables('be./re.Shit')).toEqual([
      { text: 'be', stressed: false },
      { text: 're', stressed: false },
      { text: 'shit', stressed: true },
    ])
  })

  // TAHOT capitalises a name's first letter as well as its stress.
  test('takes the last capital as the stress', () => {
    expect(syllables("'E.lo.Him").map((s) => s.stressed)).toEqual([false, false, true])
    expect(syllables("De.she'").map((s) => s.stressed)).toEqual([true, false])
  })

  test('leaves God’s Name unpronounced', () => {
    expect(syllables('la./YHWH')).toEqual([
      { text: 'la', stressed: false },
      { text: 'YHWH', stressed: false },
    ])
  })
})
