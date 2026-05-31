/**
 * Search normalization + fuzzy scoring. Hand-rolled (no fuzzy lib) to keep the
 * tree light: the corpus is small enough that scoring every title in-memory is
 * cheap. The point is forgiveness — "Rosario" must find "Rosário", "sao jose"
 * must find "São José", and a stray typo ("rozario") shouldn't dead-end.
 */

/** Fold case + diacritics so accented and bare letters compare equal. */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Levenshtein with an early ceiling: once the best possible distance in a row
// exceeds `max`, bail — we only ever care about "within 1–2 edits".
function editDistance(a: string, b: string, max: number): number {
  const al = a.length
  const bl = b.length
  if (Math.abs(al - bl) > max) return max + 1
  let prev = Array.from({ length: bl + 1 }, (_, i) => i)
  let curr = new Array<number>(bl + 1)
  for (let i = 1; i <= al; i++) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > max) return max + 1
    ;[prev, curr] = [curr, prev]
  }
  return prev[bl]
}

/** Allow 1 edit for short tokens, 2 for longer — proportional forgiveness. */
function typoBudget(token: string): number {
  return token.length <= 5 ? 1 : 2
}

/**
 * Relevance score for a candidate string against an already-normalized query.
 * Exact 100, prefix 80, substring 60, then a per-token typo fallback at 40 so
 * misspelled queries still surface their match. 0 means no match.
 *
 * `query` MUST be pre-normalized via {@link normalizeForSearch}; `text` is
 * normalized here so callers can pass raw localized strings.
 */
export function fuzzyScore(text: string | undefined, query: string): number {
  if (!text || !query) return 0
  const t = normalizeForSearch(text)
  if (t === query) return 100
  if (t.startsWith(query)) return 80
  if (t.includes(query)) return 60

  // Every query token must land near some word in the text (order-free).
  const words = t.split(/[\s'’-]+/).filter(Boolean)
  const tokens = query.split(/[\s'’-]+/).filter(Boolean)
  if (tokens.length === 0 || words.length === 0) return 0
  const allClose = tokens.every((tok) => {
    const budget = typoBudget(tok)
    return words.some((w) => editDistance(tok, w, budget) <= budget)
  })
  return allClose ? 40 : 0
}

/** True when `text` matches `query` at all — convenience for boolean filters. */
export function fuzzyMatches(text: string | undefined, query: string): boolean {
  return fuzzyScore(text, query) > 0
}
