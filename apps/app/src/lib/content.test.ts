import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BollsBook } from './bolls'

const fetchBooks = vi.fn<(translation: string) => Promise<BollsBook[]>>()
const fetchChapter = vi.fn()
const fetchHearth = vi.fn()

vi.mock('./bolls', () => ({ fetchBooks, fetchChapter }))
vi.mock('./hearth', () => ({ fetchHearth }))

// The DRB index, cut down to its shape: 46 OT books then 27 NT ones, so
// Matthew sits at position 47 and the deuterocanonical books sit where the
// Catholic canon puts them.
const drbIndex = [
  ...Array.from({ length: 16 }, (_, i) => ({ slug: `ot-${i + 1}`, name: `OT ${i + 1}` })),
  { slug: 'tobias', name: 'Tobias' },
  { slug: 'judith', name: 'Judith' },
  ...Array.from({ length: 6 }, (_, i) => ({ slug: `ot-${i + 19}`, name: `OT ${i + 19}` })),
  { slug: 'wisdom', name: 'Wisdom' },
  { slug: 'ecclesiasticus', name: 'Ecclesiasticus' },
  ...Array.from({ length: 3 }, (_, i) => ({ slug: `ot-${i + 27}`, name: `OT ${i + 27}` })),
  { slug: 'baruch', name: 'Baruch' },
  ...Array.from({ length: 14 }, (_, i) => ({ slug: `ot-${i + 31}`, name: `OT ${i + 31}` })),
  { slug: '1-machabees', name: '1 Machabees' },
  { slug: '2-machabees', name: '2 Machabees' },
  { slug: 'matthew', name: 'Matthew' },
  ...Array.from({ length: 26 }, (_, i) => ({ slug: `nt-${i + 2}`, name: `NT ${i + 2}` })),
].map((b, i) => ({ ...b, testament: i < 46 ? 'ot' : 'nt', chapters: 1 }))

const deuterocanonical = new Set([
  'tobias',
  'judith',
  'wisdom',
  'ecclesiasticus',
  'baruch',
  '1-machabees',
  '2-machabees',
])

// Bolls answers in the translation's own language — the whole point of the bug.
const portugueseNames: Record<string, string> = { matthew: 'Mateus', tobias: 'Tobias' }

// Bolls' fixed ids: the protocanon 1–66 in Protestant order, the deuterocanon
// after it, whether the translation is Catholic or not.
const deuterocanonicalIds: Record<string, number> = {
  tobias: 68,
  judith: 69,
  wisdom: 70,
  ecclesiasticus: 71,
  baruch: 73,
  '1-machabees': 74,
  '2-machabees': 75,
}
const protocanon = drbIndex.filter((b) => !deuterocanonical.has(b.slug))

const bollsCatalog = (books: typeof drbIndex): BollsBook[] =>
  books.map((b) => {
    const bookid = deuterocanonicalIds[b.slug] ?? protocanon.findIndex((p) => p.slug === b.slug) + 1
    return {
      bookid,
      name: portugueseNames[b.slug] ?? `Livro ${bookid}`,
      chronorder: bookid,
      chapters: 1,
    }
  })

async function loadContent() {
  vi.resetModules()
  return import('./content')
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchHearth.mockResolvedValue(drbIndex)
  fetchChapter.mockResolvedValue([
    { pk: 1, verse: 1, text: 'O livro da genealogia de Jesus Cristo' },
  ])
})

describe('getChapter — resolving a DRB slug against a foreign-language translation', () => {
  it('resolves a slug onto Bolls ids, not by book name or Catholic position', async () => {
    fetchBooks.mockResolvedValue(bollsCatalog(drbIndex))
    const { getChapter } = await loadContent()

    const result = await getChapter('VULG', 'matthew', 1)

    // 47th in the Catholic canon, yet 40 in a 73-book Bolls translation too.
    expect(fetchChapter).toHaveBeenCalledWith('VULG', 40, 1)
    expect(result.fallback).toBeUndefined()
    expect(result.verses[0].text).toBe('O livro da genealogia de Jesus Cristo')
  })

  it('finds a deuterocanonical book after the protocanon', async () => {
    fetchBooks.mockResolvedValue(bollsCatalog(drbIndex))
    const { getChapter } = await loadContent()

    await getChapter('RSV2CE', 'tobias', 1)

    expect(fetchChapter).toHaveBeenCalledWith('RSV2CE', 68, 1)
  })

  it('resolves the same id when the translation carries 66 books', async () => {
    fetchBooks.mockResolvedValue(bollsCatalog(protocanon))
    const { getChapter } = await loadContent()

    await getChapter('ALMEIDA', 'matthew', 1)

    expect(fetchChapter).toHaveBeenCalledWith('ALMEIDA', 40, 1)
  })

  it('falls back to the bundled Douay-Rheims for a book the translation lacks', async () => {
    const protestant = drbIndex.filter((b) => !deuterocanonical.has(b.slug))
    fetchBooks.mockResolvedValue(bollsCatalog(protestant))
    fetchHearth.mockImplementation(async (path: string) =>
      path.endsWith('index.json') ? drbIndex : { '1': { '1': 'Tobias of the tribe' } },
    )
    const { getChapter } = await loadContent()

    const result = await getChapter('ALMEIDA', 'tobias', 1)

    expect(fetchChapter).not.toHaveBeenCalled()
    expect(result.fallback).toBe(true)
    expect(result.verses).toEqual([{ verse: 1, text: 'Tobias of the tribe' }])
  })

  it('falls back when the fetch itself fails', async () => {
    fetchBooks.mockResolvedValue(bollsCatalog(drbIndex))
    fetchChapter.mockRejectedValue(new Error('offline'))
    fetchHearth.mockImplementation(async (path: string) =>
      path.endsWith('index.json') ? drbIndex : { '1': { '1': 'The book of the generation' } },
    )
    const { getChapter } = await loadContent()

    const result = await getChapter('CNBB', 'matthew', 1)

    expect(result.fallback).toBe(true)
    expect(result.verses).toEqual([{ verse: 1, text: 'The book of the generation' }])
  })

  it('passes a numeric book id (the Bible reader path) straight through', async () => {
    fetchBooks.mockResolvedValue(bollsCatalog(drbIndex))
    const { getChapter } = await loadContent()

    await getChapter('CNBB', '47', 1)

    expect(fetchChapter).toHaveBeenCalledWith('CNBB', 47, 1)
    expect(fetchBooks).not.toHaveBeenCalled()
  })
})
