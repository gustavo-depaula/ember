import { describe, expect, it } from 'vitest'

import { citationsForVerse, passageLabel, splitByVerse } from '../citations'

describe('citationsForVerse', () => {
  const passages = [
    { from: 1, to: 18, passage: '1,1-18', ccc: [241, 291] },
    { from: 14, to: 14, passage: '1,14', ccc: [461] },
    { from: 19, to: 999, passage: '1,19-2,5', ccc: [] },
  ]

  it('finds the passage a verse belongs to, the shortest where two overlap', () => {
    expect(citationsForVerse(passages, 3)?.passage).toBe('1,1-18')
    expect(citationsForVerse(passages, 14)?.passage).toBe('1,14')
  })

  it('takes a passage that runs into the next chapter to the end of this one', () => {
    expect(citationsForVerse(passages, 51)?.passage).toBe('1,19-2,5')
    expect(citationsForVerse([passages[0]], 19)).toBeUndefined()
  })
})

describe('passageLabel', () => {
  it('writes the reference the way the reader writes verses', () => {
    expect(passageLabel('1,1-18')).toBe('1:1–18')
    expect(passageLabel('2,23-3,15')).toBe('2:23–3:15')
    expect(passageLabel('19,5')).toBe('19:5')
  })
})

describe('splitByVerse', () => {
  const passage = {
    from: 1,
    to: 18,
    passage: '1,1-18',
    ccc: [241, 291, 423],
    magisterium: [
      {
        work: 'Dei Verbum',
        places: [
          ['2', 'sq', 'a'],
          ['4', 'sq', 'c'],
        ] as [string, string, string][],
      },
      { work: 'Lumen fidei', places: [['15', 'lf', 'b']] as [string, string, string][] },
    ],
    verses: {
      241: [[1, 1]],
      291: [[1, 3]],
      423: [
        [14, 14],
        [16, 16],
      ],
      'sq#a': [[14, 14]],
      'sq#c': [[1, 18]],
      'lf#b': [[18, 18]],
    } as Record<string, [number, number][]>,
  }

  it('counts a citation of a run of verses for every verse in it', () => {
    expect(splitByVerse(passage, 2).ccc).toEqual({ here: [291], elsewhere: [241, 423] })
    expect(splitByVerse(passage, 16).ccc.here).toEqual([423])
  })

  it('divides a document between the sections that cite the verse and the rest', () => {
    const { here, elsewhere } = splitByVerse(passage, 14).magisterium
    expect(here).toEqual([
      {
        work: 'Dei Verbum',
        places: [
          ['2', 'sq', 'a'],
          ['4', 'sq', 'c'],
        ],
      },
    ])
    expect(elsewhere).toEqual([{ work: 'Lumen fidei', places: [['15', 'lf', 'b']] }])
  })

  it('files under the passage what the index does not place', () => {
    expect(splitByVerse({ ...passage, verses: undefined }, 1).ccc.here).toEqual([])
  })
})
