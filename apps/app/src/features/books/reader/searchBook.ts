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

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(p|div|h[1-6]|li|blockquote|section)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

  for (let i = 0; i < bodies.length; i++) {
    const plain = stripHtml(bodies[i] ?? '')
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
