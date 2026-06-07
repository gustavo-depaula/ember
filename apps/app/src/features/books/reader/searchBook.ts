import { stripHtml } from '@/lib/html'
import type { TocLeaf } from './bookContent'

export type SearchResult = {
  chapterIndex: number
  chapterId: string
  chapterTitle: string
  snippet: string
  matchStart: number
  matchEnd: number
}

const SNIPPET_BEFORE = 40
const SNIPPET_AFTER = 60
const DEFAULT_MAX_RESULTS = 200

/**
 * Pre-strip HTML bodies to plain text. Memoise on the bodies array identity
 * so repeated searches over the same book don't re-scan tens of MB on every
 * keystroke. WeakMap key keeps the cache GC-safe.
 */
const plainCache = new WeakMap<string[], string[]>()
export function getPlainBodies(bodies: string[]): string[] {
  const hit = plainCache.get(bodies)
  if (hit) return hit
  const plains = bodies.map((b) => stripHtml(b ?? ''))
  plainCache.set(bodies, plains)
  return plains
}

/**
 * Pure search over preloaded chapter bodies. Returns up to maxResults matches
 * in reading order, each with a textual snippet and the match offsets within
 * the snippet (for highlighting).
 */
export function searchBookContent(
  bodies: string[],
  leaves: TocLeaf[],
  titleLookup: Map<string, string>,
  query: string,
  maxResults = DEFAULT_MAX_RESULTS,
): SearchResult[] {
  const q = query.trim()
  if (q.length < 2) return []
  const needle = q.toLowerCase()
  const results: SearchResult[] = []
  const plains = getPlainBodies(bodies)

  for (let i = 0; i < plains.length; i++) {
    const plain = plains[i]
    const haystack = plain.toLowerCase()
    let idx = haystack.indexOf(needle)
    while (idx !== -1) {
      const start = Math.max(0, idx - SNIPPET_BEFORE)
      const end = Math.min(plain.length, idx + needle.length + SNIPPET_AFTER)
      const prefix = start > 0 ? '…' : ''
      const suffix = end < plain.length ? '…' : ''
      const snippet = prefix + plain.slice(start, end) + suffix
      const matchStart = idx - start + prefix.length
      const matchEnd = matchStart + needle.length
      results.push({
        chapterIndex: i,
        chapterId: leaves[i].id,
        chapterTitle: titleLookup.get(leaves[i].id) ?? leaves[i].id,
        snippet,
        matchStart,
        matchEnd,
      })
      if (results.length >= maxResults) return results
      idx = haystack.indexOf(needle, idx + needle.length)
    }
  }
  return results
}
