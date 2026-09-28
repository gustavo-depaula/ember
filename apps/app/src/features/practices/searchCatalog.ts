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
import { matchWords, normalizeForSearch, searchWords } from '@/lib/search'

export type SearchResult =
  | { kind: 'practice'; id: string; title: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string }

export type SearchKind = SearchResult['kind']

export type IndexEntry = {
  result: SearchResult
  /** Title words joined by single spaces, for whole-phrase comparison. */
  title: string
  titleWords: string[]
  author?: string[]
  tags?: string[]
  description?: string[]
}

export const searchGroupOrder: SearchKind[] = ['practice', 'collection', 'book']

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

function titleScore(entry: IndexEntry, q: string, tokens: string[]): number {
  if (entry.title === q) return 100
  if (entry.title.startsWith(q)) return 90
  const match = matchWords(entry.titleWords, tokens)
  if (match === 'exact') return 75
  if (match === 'prefix') return 70
  return match ? 40 : 0
}

// Tags and descriptions are matched as typed — typo forgiveness there turned
// up practices whose titles share nothing with the query. A description is a
// weak signal, so it waits for a few letters.
function scoreEntry(entry: IndexEntry, q: string, tokens: string[]): number {
  const title = titleScore(entry, q, tokens)
  if (title >= 70) return title
  if (entry.result.kind === 'book') {
    const author = entry.author && matchWords(entry.author, tokens) ? 50 : 0
    return Math.max(title, author)
  }
  if (entry.result.kind !== 'practice') return title
  if (entry.tags && matchWords(entry.tags, tokens, { typos: false })) return Math.max(title, 30)
  if (q.length >= 3 && entry.description && matchWords(entry.description, tokens, { typos: false }))
    return Math.max(title, 10)
  return title
}

/**
 * Matches in display order: grouped by kind, best score first within a group,
 * and the shorter title first on a tie — "Mental Prayer" above "Mental Prayer
 * — Teresian Method".
 */
export function searchIndex(index: IndexEntry[], query: string): SearchResult[] {
  const tokens = searchWords(normalizeForSearch(query))
  if (tokens.length === 0) return []
  const q = tokens.join(' ')
  const scored: { score: number; entry: IndexEntry }[] = []
  for (const entry of index) {
    const score = scoreEntry(entry, q, tokens)
    if (score > 0) scored.push({ score, entry })
  }
  return searchGroupOrder.flatMap((kind) =>
    scored
      .filter((s) => s.entry.result.kind === kind)
      .sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length)
      .map((s) => s.entry.result),
  )
}
