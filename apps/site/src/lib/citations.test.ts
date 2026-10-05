import { expect, test } from 'vitest'
import { bibleRefFor } from './citations'

test('lectionary citations resolve to Douay-Rheims chapters', () => {
  expect(bibleRefFor('Lk 10:25-37', 'en-US')).toEqual({ book: 'luke', chapter: 10 })
  expect(bibleRefFor('1 Kgs 19:9a.11-13a', 'en-US')).toEqual({ book: '3-kings', chapter: 19 })
  expect(bibleRefFor('1 Sm 3:1-10', 'en-US')).toEqual({ book: '1-kings', chapter: 3 })
  expect(bibleRefFor('Lc 10, 25-37', 'pt-BR')).toEqual({ book: 'luke', chapter: 10 })
  expect(bibleRefFor('Jo 20, 19-23', 'pt-BR')).toEqual({ book: 'john', chapter: 20 })
  expect(bibleRefFor('Jn 3, 1-10', 'pt-BR')).toEqual({ book: 'jonas', chapter: 3 })
  expect(bibleRefFor('12:3b–7, 12–13', 'en-US')).toBeUndefined()
  // A one-chapter letter is cited by verse; a chapter the Vulgate lacks has no page.
  expect(bibleRefFor('Jude 17, 20b-25', 'en-US')).toEqual({ book: 'jude', chapter: 1 })
  expect(bibleRefFor('Jl 4:12-21', 'en-US')).toBeUndefined()
})

test('psalms move from Hebrew to Vulgate numbering', () => {
  expect(bibleRefFor('Ps 23:1-6', 'en-US')).toEqual({ book: 'psalms', chapter: 22 })
  expect(bibleRefFor('Ps 8:4-9', 'en-US')).toEqual({ book: 'psalms', chapter: 8 })
  expect(bibleRefFor('Sl 111(110), 1-2', 'pt-BR')).toEqual({ book: 'psalms', chapter: 110 })
  expect(bibleRefFor('Ps 150:1-6', 'en-US')).toEqual({ book: 'psalms', chapter: 150 })
})
