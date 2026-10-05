/**
 * Search over the catalog's practices, collections and books. The index holds
 * every searchable field localized, normalized and split into words once, so a
 * keystroke only compares words rather than normalizing ~1,000 titles and
 * descriptions.
 */

import { getEntriesByKind, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { normalizeForSearch, searchWords } from '@/lib/search'
import type { IndexEntry } from './searchScore'

export {
  type IndexEntry,
  type SearchKind,
  type SearchResult,
  searchGroupOrder,
  searchIndex,
} from './searchScore'

function words(text: string): string[] {
  return searchWords(normalizeForSearch(text))
}

function titleFields(title: string) {
  const titleWords = words(title)
  return { title: titleWords.join(' '), titleWords }
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function buildSearchIndex(): IndexEntry[] {
  const entries: IndexEntry[] = []

  for (const m of getAllManifests()) {
    if (isAlternateForm(m)) continue
    const title = localizeContent(m.name)
    entries.push({
      result: { kind: 'practice', id: m.id, title },
      ...titleFields(title),
      tags: m.tags?.flatMap(words),
      description: m.description ? words(localizeContent(m.description)) : undefined,
    })
  }

  for (const [id, entry] of getEntriesByKind('collection')) {
    const title = entry.name ? localizeContent(entry.name) : bareId(id)
    entries.push({
      result: { kind: 'collection', id: bareId(id), title },
      ...titleFields(title),
    })
  }

  for (const [id, entry] of getEntriesByKind('book')) {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    const nameSrc = body?.name ?? entry.name
    if (!nameSrc) continue
    const title = localizeContent(nameSrc as Record<string, string>)
    const authorSrc = body?.author ?? entry.author
    const author = authorSrc ? localizeContent(authorSrc as Record<string, string>) : ''
    entries.push({
      result: { kind: 'book', id: bareId(id), title, subtitle: author || undefined },
      ...titleFields(title),
      author: author ? words(author) : undefined,
    })
  }

  return entries
}
