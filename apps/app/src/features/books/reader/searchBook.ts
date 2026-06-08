import { stripHtml } from '@/lib/html'
import type { TocLeaf } from './bookContent'
import type { BookSearchIndex } from './bookSearchIndex'
import { searchIndex, stemQuery, stemToken, TOKEN_RE } from './bookSearchIndex'

export type SearchResult = {
  /** Position in the book's reading-order leaves (what the reader navigates by). */
  chapterIndex: number
  chapterId: string
  chapterTitle: string
  /** Posting-list score from the inverted index — higher = more matches. */
  score: number
}

export type EnrichedSnippet = {
  snippet: string
  /** Offsets into `snippet` covering the highlighted match. */
  matchStart: number
  matchEnd: number
}

const SNIPPET_BEFORE = 40
const SNIPPET_AFTER = 60
const DEFAULT_MAX_RESULTS = 200

/**
 * Resolve a stemmed-index query into a list of chapter hits. Returns chapters
 * only — snippet text is enriched lazily per visible row via `enrichSnippet`,
 * because chapter bodies are fetched on demand in the lazy reader.
 */
export function searchBookContent(
  index: BookSearchIndex | undefined,
  leaves: TocLeaf[],
  titleLookup: Map<string, string>,
  query: string,
  maxResults = DEFAULT_MAX_RESULTS,
): SearchResult[] {
  const q = query.trim()
  if (q.length < 2 || !index) return []

  const matches = searchIndex(index, q, maxResults)
  if (matches.length === 0) return []

  const leafIdxOf = new Map<string, number>()
  for (let i = 0; i < leaves.length; i++) leafIdxOf.set(leaves[i].id, i)

  const out: SearchResult[] = []
  for (const m of matches) {
    const leafIdx = leafIdxOf.get(m.chapterId)
    if (leafIdx === undefined) continue
    out.push({
      chapterIndex: leafIdx,
      chapterId: m.chapterId,
      chapterTitle: titleLookup.get(m.chapterId) ?? m.chapterId,
      score: m.score,
    })
  }
  return out
}

/**
 * Produce snippet text + match offsets for a single result, given the
 * chapter's body HTML. Strips HTML, then anchors on either the exact query
 * substring or any token whose stem matches one of the query's stems.
 * Returns undefined when no anchor can be located.
 */
export function enrichSnippet(
  body: string,
  query: string,
  lang: string,
): EnrichedSnippet | undefined {
  const plain = stripHtml(body)
  if (plain.length === 0) return undefined

  const needleLower = query.trim().toLowerCase()
  const anchor = findAnchor(plain, needleLower, stemQuery(query, lang), lang)
  if (!anchor) {
    return {
      snippet: plain.slice(0, SNIPPET_BEFORE + SNIPPET_AFTER) + (plain.length > 100 ? '…' : ''),
      matchStart: 0,
      matchEnd: 0,
    }
  }
  const start = Math.max(0, anchor.offset - SNIPPET_BEFORE)
  const end = Math.min(plain.length, anchor.offset + anchor.length + SNIPPET_AFTER)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < plain.length ? '…' : ''
  const snippet = prefix + plain.slice(start, end) + suffix
  const matchStart = anchor.offset - start + prefix.length
  const matchEnd = matchStart + anchor.length
  return { snippet, matchStart, matchEnd }
}

function findAnchor(
  plain: string,
  needleLower: string,
  stems: string[],
  lang: string,
): { offset: number; length: number } | undefined {
  const exact = plain.toLowerCase().indexOf(needleLower)
  if (exact !== -1) return { offset: exact, length: needleLower.length }

  const stemSet = new Set(stems)
  const lower = plain.toLowerCase()
  for (const m of lower.matchAll(TOKEN_RE)) {
    const tok = m[0]
    if (stemSet.has(stemToken(tok, lang))) {
      return { offset: m.index ?? 0, length: tok.length }
    }
  }
  return undefined
}
