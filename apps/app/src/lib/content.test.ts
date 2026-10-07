import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchHearth = vi.fn()
const fetchAveMaria = vi.fn()
const stored = new Map<string, unknown>()

vi.mock('./hearth', () => ({ fetchHearth }))
vi.mock('@/sources/bible', () => ({
  webBibles: { AM: { chapters: { joel: 4 }, fetchChapters: fetchAveMaria } },
}))
vi.mock('@/db/repositories/externalContent', () => ({
  getExternalContent: async (key: { producerId: string; cacheKey: string }) => {
    const payload = stored.get(`${key.producerId}:${key.cacheKey}`)
    return payload ? { payload } : undefined
  },
  putExternalContent: async (key: { producerId: string; cacheKey: string }, payload: unknown) => {
    stored.set(`${key.producerId}:${key.cacheKey}`, payload)
  },
}))

const index = [
  { slug: 'joel', name: 'Joel', testament: 'ot', chapters: 3 },
  { slug: 'matthew', name: 'Matthew', testament: 'nt', chapters: 28 },
]

// The corpus as Hearth serves it: an index and one file per book, per translation.
function serveCorpus(books: Record<string, Record<string, Record<string, string>>>) {
  fetchHearth.mockImplementation(async (path: string) => {
    if (path.endsWith('index.json')) return index
    const book = books[path]
    if (!book) throw new Error(`404 ${path}`)
    return book
  })
}

async function loadContent() {
  vi.resetModules()
  return import('./content')
}

beforeEach(() => {
  vi.clearAllMocks()
  stored.clear()
  serveCorpus({
    'bible/drb/matthew.json': { '1': { '1': 'The book of the generation' } },
    'bible/cpdv/matthew.json': { '1': { '1': 'The book of the lineage' } },
  })
  fetchAveMaria.mockResolvedValue({
    1: [{ verse: 1, text: 'Genealogia de Jesus Cristo' }],
    2: [{ verse: 1, text: 'Tendo nascido Jesus em Belém' }],
  })
})

describe('getChapter', () => {
  it('reads a public-domain translation from its own corpus directory', async () => {
    const { getChapter } = await loadContent()

    expect(await getChapter('CPDV', 'matthew', 1)).toEqual({
      verses: [{ verse: 1, text: 'The book of the lineage' }],
    })
  })

  it('reads an in-copyright translation from its publisher, once', async () => {
    const { getChapter } = await loadContent()

    const first = await getChapter('AM', 'matthew', 1)
    const second = await getChapter('AM', 'matthew', 1)

    expect(first).toEqual({ verses: [{ verse: 1, text: 'Genealogia de Jesus Cristo' }] })
    expect(second).toEqual(first)
    expect(fetchAveMaria).toHaveBeenCalledTimes(1)
    expect(fetchAveMaria).toHaveBeenCalledWith('matthew', 1)
  })

  it('keeps every chapter that came with the one asked for', async () => {
    const { getChapter } = await loadContent()

    await getChapter('AM', 'matthew', 1)
    const second = await getChapter('AM', 'matthew', 2)

    expect(second).toEqual({ verses: [{ verse: 1, text: 'Tendo nascido Jesus em Belém' }] })
    expect(fetchAveMaria).toHaveBeenCalledTimes(1)
  })

  it('falls back to the Douay-Rheims when the publisher cannot be reached', async () => {
    fetchAveMaria.mockRejectedValue(new Error('offline'))
    const { getChapter } = await loadContent()

    const result = await getChapter('AM', 'matthew', 1)

    expect(result.fallback).toBe(true)
    expect(result.verses).toEqual([{ verse: 1, text: 'The book of the generation' }])
    expect(stored.size).toBe(0)
  })

  it('falls back for a translation the picker no longer offers', async () => {
    const { getChapter } = await loadContent()

    expect((await getChapter('RSV2CE', 'matthew', 1)).fallback).toBe(true)
  })

  it('falls back for a chapter the translation numbers differently', async () => {
    serveCorpus({
      'bible/drb/matthew.json': { '2': { '1': 'When Jesus therefore was born' } },
      'bible/cpdv/matthew.json': { '1': { '1': 'The book of the lineage' } },
    })
    const { getChapter } = await loadContent()

    expect(await getChapter('CPDV', 'matthew', 2)).toEqual({
      verses: [{ verse: 1, text: 'When Jesus therefore was born' }],
      fallback: true,
    })
  })
})

describe('getBooks', () => {
  it('lists the Douay books for a publisher translation, with its own chapter counts', async () => {
    const { getBooks } = await loadContent()

    expect((await getBooks('AM')).map((b) => [b.id, b.chapters])).toEqual([
      ['joel', 4],
      ['matthew', 28],
    ])
  })
})
