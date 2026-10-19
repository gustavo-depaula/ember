import { expect, test } from 'vitest'
import { editionSlugs, listBookEditions, loadChapterPage } from './books'

const confessions = 'augustine-confessiones'

test('each text of a book is published where it is read: a site language on its side, any other on both', async () => {
  const sides = Object.fromEntries(
    (await listBookEditions(confessions)).map(({ edition, sides }) => [edition.id, sides]),
  )
  expect(sides['en-US']).toEqual(['en-US'])
  expect(sides['pt-BR']).toEqual(['pt-BR'])
  expect(sides.la).toEqual(['en-US', 'pt-BR'])
  expect(sides['outler:pt-BR']).toEqual(['pt-BR'])
})

test("a side's own text keeps the plain URLs; every other text has its segment", async () => {
  expect(await editionSlugs(confessions, 'en-US')).toEqual({ 'en-US': undefined })
  expect(await editionSlugs(confessions, 'la')).toEqual({ 'en-US': 'la', 'pt-BR': 'la' })
  expect(await editionSlugs(confessions, 'pusey:en-US')).toEqual({ 'en-US': 'pusey-en' })
})

test('a chapter leads to the same place in the other texts', async () => {
  const page = await loadChapterPage(confessions, 'book-four-chapter-03', 'en-US', 'outler:en-US')
  const hrefOf = (label: string) => page?.others.find((o) => o.label === label)?.href
  expect(hrefOf('E. B. Pusey (1838)')).toBe('/books/augustine-confessiones/pusey-en/ch005/')
  // Pusey has no Revisions chapter: from there, his contents.
  const revisions = await loadChapterPage(confessions, 'ch001', 'en-US', 'en-US')
  expect(revisions?.others.find((o) => o.label === 'E. B. Pusey (1838)')?.href).toBe(
    '/books/augustine-confessiones/#pusey-en',
  )
})
