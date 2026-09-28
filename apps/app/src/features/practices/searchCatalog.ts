/**
 * Search over the catalog's practices, collections and books. The index holds
 * every searchable field localized and normalized once, so a keystroke only
 * compares strings — normalizing ~1,000 titles and descriptions per keystroke
 * was most of the scoring cost.
 */

import { getEntriesByKind, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getAllManifests } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { fuzzyScoreNormalized, normalizeForSearch } from '@/lib/search'

export type SearchResult =
  | { kind: 'practice'; id: string; title: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string }

export type SearchKind = SearchResult['kind']

export type IndexEntry = {
  result: SearchResult
  title: string
  author?: string
  tags?: string[]
  description?: string
}

export const searchGroupOrder: SearchKind[] = ['practice', 'collection', 'book']

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function buildSearchIndex(): IndexEntry[] {
  const entries: IndexEntry[] = []

  for (const m of getAllManifests()) {
    const title = localizeContent(m.name)
    entries.push({
      result: { kind: 'practice', id: m.id, title },
      title: normalizeForSearch(title),
      tags: m.tags?.map(normalizeForSearch),
      description: m.description ? normalizeForSearch(localizeContent(m.description)) : undefined,
    })
  }

  for (const [id, entry] of getEntriesByKind('collection')) {
    const title = entry.name ? localizeContent(entry.name) : bareId(id)
    entries.push({
      result: { kind: 'collection', id: bareId(id), title },
      title: normalizeForSearch(title),
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
      title: normalizeForSearch(title),
      author: author ? normalizeForSearch(author) : undefined,
    })
  }

  return entries
}

function scoreEntry(entry: IndexEntry, q: string): number {
  const titleScore = fuzzyScoreNormalized(entry.title, q)
  if (entry.result.kind === 'practice') {
    const tagScore = entry.tags?.some((tag) => tag.includes(q)) ? 30 : 0
    const descScore = entry.description?.includes(q) ? 10 : 0
    return Math.max(titleScore, tagScore, descScore)
  }
  if (entry.result.kind === 'book') {
    const authorScore = entry.author && fuzzyScoreNormalized(entry.author, q) > 0 ? 50 : 0
    return Math.max(titleScore, authorScore)
  }
  return titleScore
}

/** Matches in display order: grouped by kind, best score first within a group. */
export function searchIndex(index: IndexEntry[], query: string): SearchResult[] {
  const q = normalizeForSearch(query)
  if (!q) return []
  const scored: { score: number; result: SearchResult }[] = []
  for (const entry of index) {
    const score = scoreEntry(entry, q)
    if (score > 0) scored.push({ score, result: entry.result })
  }
  return searchGroupOrder.flatMap((kind) =>
    scored
      .filter((s) => s.result.kind === kind)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.result),
  )
}
