import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { BookEntry, TocNode } from '@/content/manifestTypes'
import {
  bookEditions,
  matchingNode,
  parseReadingKey,
  readingKey,
  resolveEdition,
  versionView,
} from '../editions'
import { flattenReadingFlow, nearestLeafIndex } from '../reader/bookContent'

// The Confessions: the augustinus.cc text (Latin, English, Portuguese,
// Spanish), Pusey and Pilkington cut like it, and Outler's edition with its
// own structure. The chapter map is read off the files, as the build does.
const dir = join(
  __dirname,
  '../../../../../../content/books/augustine-opera-omnia/autobiographical/confessiones',
)
type Meta = Omit<BookEntry, 'chapters' | 'versions'> & {
  versions: { id: string; languages: string[]; toc: TocNode[] }[]
}
const meta = JSON.parse(readFileSync(join(dir, 'book.json'), 'utf8')) as Meta

function chaptersIn(root: string, languages: string[]): BookEntry['chapters'] {
  const chapters: BookEntry['chapters'] = {}
  for (const lang of languages) {
    if (!existsSync(join(root, lang))) continue
    for (const file of readdirSync(join(root, lang))) {
      if (!file.endsWith('.md') || file.startsWith('translation-journal')) continue
      const id = file.slice(0, -3)
      chapters[id] = { ...chapters[id], [lang]: { hash: 'h', size: 1 } }
    }
  }
  return chapters
}

const confessions: BookEntry = {
  ...meta,
  chapters: chaptersIn(dir, meta.languages ?? []),
  versions: meta.versions.map((v) => ({
    ...v,
    chapters: chaptersIn(join(dir, 'versions', v.id), v.languages),
  })),
}

describe('bookEditions', () => {
  const editions = bookEditions(confessions)
  const label = (id: string) => editions.find((e) => e.id === id)?.label

  it('lists every language of every text', () => {
    expect(editions.map((e) => e.id)).toEqual(
      expect.arrayContaining(['la', 'es-419', 'pusey:en-US', 'outler:en-US', 'outler:pt-BR']),
    )
  })

  it('names the text only where its language has more than one', () => {
    expect(label('la')).toBeUndefined()
    expect(label('es-419')).toBeUndefined()
    expect(label('en-US')).toBe('Aquinas Institute')
    expect(label('pusey:en-US')).toBe('E. B. Pusey (1838)')
    expect(label('outler:pt-BR')).toBe('Claude, from Outler (1955)')
  })
})

describe('resolveEdition', () => {
  const editions = bookEditions(confessions)
  it('keeps the chosen text, else the main text in the content language', () => {
    expect(resolveEdition(editions, 'outler:pt-BR', 'en-US')?.id).toBe('outler:pt-BR')
    expect(resolveEdition(editions, undefined, 'pt-BR')?.id).toBe('pt-BR')
    expect(resolveEdition(editions, 'gone:en-US', 'en-US')?.id).toBe('en-US')
  })
})

describe('versionView', () => {
  it("reads a version's own contents, which may lack a chapter of the main text", () => {
    const pusey = versionView(confessions, 'pusey')
    const flow = flattenReadingFlow(pusey.toc ?? [], pusey, 'en-US')
    expect(flow[0]?.id).toBe('ch002')
    expect(nearestLeafIndex(pusey.toc ?? [], flow, 'ch005')).toBe(3)
  })
})

describe('matchingNode', () => {
  it('lands on the same Book in a text cut alike', () => {
    expect(matchingNode(confessions, undefined, 'ch005', 'pusey')).toBe('ch005')
  })

  it('lands a chapter of another structure on its Book', () => {
    // Outler's Book Four, chapter 3 is the main text's Book 4 (ch005).
    expect(matchingNode(confessions, 'outler', 'book-four-chapter-03', undefined)).toBe('ch005')
    expect(matchingNode(confessions, 'outler', 'book-four-chapter-03', 'pusey')).toBe('ch005')
    expect(matchingNode(confessions, undefined, 'ch005', 'outler')).toBe('book-four')
  })

  it('finds nothing where the other text has no counterpart', () => {
    expect(matchingNode(confessions, undefined, 'ch001', 'pusey')).toBeUndefined()
    expect(matchingNode(confessions, 'outler', 'title-page', undefined)).toBeUndefined()
  })
})

describe('readingKey', () => {
  it('keeps a version apart from the main text, and reads back', () => {
    expect(readingKey('augustine-confessiones', undefined)).toBe('augustine-confessiones')
    expect(parseReadingKey(readingKey('augustine-confessiones', 'outler'))).toEqual({
      bookId: 'augustine-confessiones',
      version: 'outler',
    })
  })
})
