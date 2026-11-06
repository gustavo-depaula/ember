import { describe, expect, test } from 'vitest'

import { showHebrewMarks } from '../hebrew'

// Psalm 23:2 as the codex points it: vowels, dagesh, accents (tevir, atnach,
// merkha, tipcha, silluq), a maqaf and the sof pasuq.
const verse = 'בִּנְא֣וֹת דֶּ֭שֶׁא יַרְבִּיצֵ֑נִי עַל־מֵ֖י מְנֻח֣וֹת יְנַהֲלֵֽנִי׃'

describe('showHebrewMarks', () => {
  test('chant is the text as it stands', () => {
    expect(showHebrewMarks(verse, 'chant')).toBe(verse)
  })

  test('vowels keeps the pointing and drops the accents', () => {
    expect(showHebrewMarks(verse, 'vowels')).toBe('בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי עַל־מֵי מְנֻחוֹת יְנַהֲלֵנִי׃')
  })

  test('letters keeps the consonants and the punctuation', () => {
    expect(showHebrewMarks(verse, 'letters')).toBe('בנאות דשא ירביצני על־מי מנחות ינהלני׃')
  })
})
