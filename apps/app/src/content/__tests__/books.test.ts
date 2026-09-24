import { resolveFlowAsync } from '@ember/content-engine'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  findBookImage,
  getBookCatalogEntry,
  getResidentBook,
  loadBook,
  loadBookChapterText,
  loadChapterSource,
  registerChapterProducer,
} from '../books'
import { resetContentIndex, setCatalog } from '../contentIndex'
import { createEngineContext } from '../engineContext'
import type { BookEntry } from '../manifestTypes'

const blobs = vi.hoisted(() => new Map<string, unknown>())

vi.mock('../store', () => ({
  getJson: async (hash: string) => {
    if (!blobs.has(hash)) throw new Error(`unexpected getJson(${hash})`)
    return structuredClone(blobs.get(hash))
  },
  getText: async (hash: string) => {
    const text = blobs.get(hash)
    if (typeof text !== 'string') throw new Error(`unexpected getText(${hash})`)
    return text
  },
}))

const bundled: BookEntry = {
  id: 'book/bundled',
  name: { 'en-US': 'Bundled' },
  languages: ['pt-BR'],
  toc: [{ id: 'ch-1', title: { 'pt-BR': 'Primeira meditação' } }],
  chapters: {
    'ch-1': { 'pt-BR': { hash: 'h-ch-1', size: 1 } },
    'ch-html': { 'pt-BR': { hash: 'h-ch-html', size: 1, format: 'html' } },
  },
  images: [{ rel: 'cross.png', hash: 'img-cross', size: 1, mime: 'image/png' }],
}

function externalBook(slug: string, producer: string): BookEntry {
  return {
    id: slug,
    name: { 'en-US': slug },
    chapters: { intro: { 'pt-BR': { type: 'external', url: `https://example.org/${slug}` } } },
    source: { type: 'external', producer, homepage: 'https://example.org' },
  }
}

beforeEach(() => {
  resetContentIndex()
  blobs.clear()
  blobs.set('h-bundled', bundled)
  blobs.set('h-ch-1', 'Texto.\n\n![Cruz](../images/cross.png) ![Outra](../images/missing.png)')
  blobs.set('h-ch-html', '<p><img src="../images/cross.png"></p>')
  blobs.set('h-ext-a', externalBook('ext-a', 'producer/a'))
  blobs.set('h-ext-b', externalBook('ext-b', 'producer/b'))
  blobs.set('h-orphan', externalBook('orphan', 'producer/unregistered'))
  const item = (hash: string) => ({ kind: 'book' as const, hash, size: 1, name: {} })
  setCatalog({
    version: 2,
    generated: '2026-09-24T00:00:00Z',
    items: {
      'book/bundled': item('h-bundled'),
      'book/ext-a': item('h-ext-a'),
      'book/ext-b': item('h-ext-b'),
      'book/orphan': item('h-orphan'),
      'practice/bundled': { kind: 'practice', hash: 'h-practice', size: 1, name: {} },
    },
  })
  registerChapterProducer(
    'producer/a',
    async (book, chapter, lang) => `A:${book}/${chapter}/${lang}`,
  )
  registerChapterProducer(
    'producer/b',
    async (book, chapter, lang) => `B:${book}/${chapter}/${lang}`,
  )
})

describe('book ids', () => {
  it('accepts bare and prefixed ids alike, and only ever resolves books', () => {
    expect(getBookCatalogEntry('bundled')?.hash).toBe('h-bundled')
    expect(getBookCatalogEntry('book/bundled')?.hash).toBe('h-bundled')
    expect(getBookCatalogEntry('practice/bundled')?.hash).toBe('h-bundled')
    expect(getBookCatalogEntry('nope')).toBeUndefined()
  })
})

describe('residency', () => {
  it('fetches a non-resident book on demand and remembers it for sync reads', async () => {
    expect(getResidentBook('bundled')).toBeUndefined()
    expect((await loadBook('bundled'))?.id).toBe('book/bundled')
    expect(getResidentBook('book/bundled')?.id).toBe('book/bundled')
  })

  it('returns undefined for an unknown book', async () => {
    expect(await loadBook('nope')).toBeUndefined()
  })
})

describe('loadChapterSource', () => {
  it('reads bundled chapters as markdown unless flagged html', async () => {
    const book = (await loadBook('bundled')) as BookEntry
    expect((await loadChapterSource(book, 'ch-1', 'pt-BR'))?.format).toBe('markdown')
    expect((await loadChapterSource(book, 'ch-html', 'pt-BR'))?.format).toBe('html')
  })

  it("dispatches external chapters to the book's own producer", async () => {
    const a = (await loadBook('ext-a')) as BookEntry
    const b = (await loadBook('ext-b')) as BookEntry
    expect(await loadChapterSource(a, 'intro', 'pt-BR')).toEqual({
      text: 'A:ext-a/intro/pt-BR',
      format: 'html',
    })
    expect(await loadChapterSource(b, 'intro', 'pt-BR')).toEqual({
      text: 'B:ext-b/intro/pt-BR',
      format: 'html',
    })
  })

  it('fails loudly when no producer is registered for an external book', async () => {
    const orphan = (await loadBook('orphan')) as BookEntry
    await expect(loadChapterSource(orphan, 'intro', 'pt-BR')).rejects.toThrow(
      'producer/unregistered',
    )
  })

  it('returns undefined for a chapter or language the book lacks', async () => {
    const book = (await loadBook('bundled')) as BookEntry
    expect(await loadChapterSource(book, 'missing', 'pt-BR')).toBeUndefined()
    expect(await loadChapterSource(book, 'ch-1', 'it')).toBeUndefined()
  })
})

describe('images', () => {
  it('resolves every relative spelling of a manifest image', () => {
    const cross = { hash: 'img-cross', mime: 'image/png' }
    expect(findBookImage(bundled, 'images/cross.png')).toEqual(cross)
    expect(findBookImage(bundled, './images/cross.png')).toEqual(cross)
    expect(findBookImage(bundled, '../images/cross.png')).toEqual(cross)
    expect(findBookImage(bundled, 'cross.png')).toBeUndefined()
    expect(findBookImage(bundled, '../images/missing.png')).toBeUndefined()
  })
})

describe('loadBookChapterText', () => {
  it('rewrites markdown images to corpus URIs, leaving unknown ones alone', async () => {
    expect(await loadBookChapterText('bundled', 'ch-1', 'pt-BR')).toBe(
      'Texto.\n\n![Cruz](corpus://img-cross.png) ![Outra](../images/missing.png)',
    )
  })

  it('passes HTML bodies through untouched', async () => {
    expect(await loadBookChapterText('bundled', 'ch-html', 'pt-BR')).toBe(
      '<p><img src="../images/cross.png"></p>',
    )
  })

  it('routes external refs through their producer', async () => {
    expect(await loadBookChapterText('ext-b', 'intro', 'pt-BR')).toBe('B:ext-b/intro/pt-BR')
  })
})

describe('engine resolution', () => {
  it('labels meditations from a book that was never loaded, with no caller pre-warm', async () => {
    const date = new Date(2026, 3, 11)
    const sections = await resolveFlowAsync(
      {
        resolve: [
          {
            source: 'liturgical',
            dataType: 'liturgical-meditation-map',
            data: 'liturgical-map',
            strategy: 'liturgical-day',
            as: 'meditations',
            book: 'bundled',
          },
        ],
        sections: [{ type: 'heading', text: { 'pt-BR': '{{meditationTitle}}' } }],
      },
      {
        date,
        now: date,
        liturgicalCalendar: 'ef',
        cycleData: {
          'liturgical-map': {
            temporal: {},
            fixedDates: { '04-11': { primary: 'ch-1' } },
            feasts: {},
            novenas: {},
            reserves: [],
          } as never,
        },
      },
      createEngineContext(undefined, { contentLanguage: 'pt-BR' }),
    )
    expect(sections[0]).toMatchObject({ type: 'heading', text: { primary: 'Primeira meditação' } })
  })
})
