/**
 * Search normalization + word matching. Hand-rolled (no fuzzy lib) to keep the
 * tree light: the corpus is small enough that scoring every title in-memory is
 * cheap. The point is forgiveness — "Rosario" must find "Rosário", "sao jose"
 * must find "São José", "mental p" must find "Mental Prayer" mid-typing, and a
 * stray typo ("rozario") shouldn't dead-end.
 *
 * Matching is by word, never by raw substring: "mental" inside "sacramental"
 * is not a match.
 */

/** Fold case + diacritics so accented and bare letters compare equal. */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Words of already-normalized text; punctuation and dashes separate words. */
export function searchWords(normalized: string): string[] {
  return normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
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

// Short tokens get no typo allowance: one edit turns "p" or "sa" into
// half the corpus.
function typoBudget(token: string): number {
  if (token.length < 4) return 0
  return token.length < 8 ? 1 : 2
}

export type WordMatch = 'exact' | 'prefix' | 'typo'

/**
 * How well every query token lands on some word (order-free): the weakest
 * token decides. `undefined` when any token misses. A typo is forgiven against
 * the whole word or, while the token is still being typed, the word's start.
 */
export function matchWords(
  words: string[],
  tokens: string[],
  { typos = true }: { typos?: boolean } = {},
): WordMatch | undefined {
  if (tokens.length === 0 || words.length === 0) return undefined
  let weakest: WordMatch = 'exact'
  for (const tok of tokens) {
    if (words.includes(tok)) continue
    if (words.some((w) => w.startsWith(tok))) {
      if (weakest === 'exact') weakest = 'prefix'
      continue
    }
    const budget = typos ? typoBudget(tok) : 0
    if (budget === 0) return undefined
    const close = words.some(
      (w) =>
        editDistance(tok, w, budget) <= budget ||
        editDistance(tok, w.slice(0, tok.length), budget) <= budget,
    )
    if (!close) return undefined
    weakest = 'typo'
  }
  return weakest
}
