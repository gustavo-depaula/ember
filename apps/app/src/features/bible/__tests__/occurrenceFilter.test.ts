import { describe, expect, test } from 'vitest'

import { distinctPlaces, facetsOf, matches } from '../occurrenceFilter'

const forms = [
  { stem: 'qal', form: 'perfect' },
  { stem: 'qal', form: 'imperative' },
  { stem: 'hiphil', form: 'imperative' },
  { stem: 'hiphil', form: 'imperative' },
  { stem: 'hiphil', form: 'perfect' },
]

describe('occurrence filter', () => {
  test('offers each feature the word varies in, most frequent value first', () => {
    expect(facetsOf(forms, ['stem', 'form'])).toEqual([
      {
        feature: 'stem',
        values: [
          { value: 'hiphil', count: 3 },
          { value: 'qal', count: 2 },
        ],
      },
      {
        feature: 'form',
        values: [
          { value: 'imperative', count: 3 },
          { value: 'perfect', count: 2 },
        ],
      },
    ])
  })

  // A chip whose count ignored the other row's choice would promise lines the
  // list then does not show.
  test('counts each feature within the other features chosen', () => {
    const [stem, form] = facetsOf(forms, ['stem', 'form'], { stem: 'hiphil' })
    expect(stem.values).toEqual([
      { value: 'hiphil', count: 3 },
      { value: 'qal', count: 2 },
    ])
    expect(form.values).toEqual([
      { value: 'imperative', count: 2 },
      { value: 'perfect', count: 1 },
    ])
  })

  test('leaves out a feature with a single value', () => {
    expect(facetsOf([{ stem: 'qal' }, { stem: 'qal' }], ['stem'])).toEqual([])
  })

  test('matches every chosen value and ignores cleared ones', () => {
    expect(matches(forms[2], { stem: 'hiphil', form: 'imperative' })).toBe(true)
    expect(matches(forms[0], { stem: 'hiphil', form: undefined })).toBe(false)
  })

  test('lists a verse once however often the word stands in it', () => {
    const places: [string, number, number, string][] = [
      ['genesis', 1, 1, 'a'],
      ['genesis', 1, 1, 'b'],
      ['genesis', 1, 2, 'a'],
    ]
    expect(distinctPlaces(places).map(([, , v]) => v)).toEqual([1, 2])
  })
})
