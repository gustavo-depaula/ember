import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { BookEntry } from '@/content/manifestTypes'
import { bookEditions, resolveEdition } from '../editions'
import { buildTitleLookup, flattenReadingFlow, nearestLeafIndex } from '../reader/bookContent'

// The Confessions carry four English texts beside the Latin, Portuguese and
// Spanish, and the older translations lack the Revisions chapter.
const dir = join(
  __dirname,
  '../../../../../../content/books/augustine-opera-omnia/autobiographical/confessiones',
)
const meta = JSON.parse(readFileSync(join(dir, 'book.json'), 'utf8')) as BookEntry
const confessions: BookEntry = {
  ...meta,
  chapters: Object.fromEntries(
    (meta.toc ?? []).map((node) => [
      node.id,
      Object.fromEntries(
        (meta.languages ?? [])
          .filter((lang) => readdirSync(join(dir, lang)).includes(`${node.id}.md`))
          .map((lang) => [lang, { hash: 'h', size: 1 }]),
      ),
    ]),
  ),
}

describe('bookEditions', () => {
  it('names the translator only where a language has more than one text', () => {
    const editions = bookEditions(confessions)
    expect(editions.find((e) => e.id === 'es-419')).toEqual({
      id: 'es-419',
      language: 'es-419',
      label: undefined,
    })
    expect(editions.find((e) => e.id === 'en-US-x-pusey')).toEqual({
      id: 'en-US-x-pusey',
      language: 'en-US',
      label: 'E. B. Pusey (1838)',
    })
    expect(editions.find((e) => e.id === 'en-US')?.label).toBe('Aquinas Institute')
  })
})

describe('resolveEdition', () => {
  const langs = confessions.languages ?? []
  it('keeps the chosen text, else the content language, else the first', () => {
    expect(resolveEdition(langs, 'en-US-x-outler', 'pt-BR')).toBe('en-US-x-outler')
    expect(resolveEdition(langs, undefined, 'pt-BR')).toBe('pt-BR')
    expect(resolveEdition(['la', 'it'], undefined, 'en-US')).toBe('la')
  })
  it('drops a choice the book no longer has', () => {
    expect(resolveEdition(langs, 'en-US-x-gone', 'en-US')).toBe('en-US')
  })
})

describe('a second translation', () => {
  it('reads its own titles and falls back to its language where it has none', () => {
    const titles = buildTitleLookup(confessions.toc ?? [], 'en-US-x-pusey')
    expect(titles.get('ch002')).toBe('Book 1: Birth, infancy, and boyhood')
    // Pusey has no Revisions chapter; its label is the English one.
    expect(titles.get('ch001')).toBe('Revisions II')
  })

  it('opens on the next chapter it has when the place is in one it lacks', () => {
    const leaves = flattenReadingFlow(confessions.toc ?? [], confessions, 'en-US-x-pusey')
    expect(leaves[0]?.id).toBe('ch002')
    expect(nearestLeafIndex(confessions.toc ?? [], leaves, 'ch001')).toBe(0)
    expect(nearestLeafIndex(confessions.toc ?? [], leaves, 'ch005')).toBe(3)
  })
})
