/**
 * Stemmed inverted index loader + query stemming.
 *
 * The index is built by scripts/build-corpus.py:build_search_index_for_book.
 * Both sides use Snowball; identical input → identical stems.
 *
 * Index shape (compact):
 *   { v: 1, l: lang, s: algoName, c: [chapterId, ...], t: { stem: [ci, n, ci, n, ...] } }
 *
 * Posting lists are flat arrays sorted by count desc, capped at 100 hits per
 * stem at build time. Surface forms are NOT stored — the runtime re-stems
 * chapter text to find a snippet anchor only for the small number of results
 * that get rendered.
 */

import { newStemmer, type SnowballStemmer } from 'snowball-stemmers'
import type { BookEntry } from '@/content/manifestTypes'
import { getJson } from '@/content/store'

export type BookSearchIndex = {
  v: number
  l: string
  s: string
  c: string[]
  t: Record<string, number[]>
}

export type ChapterMatch = {
  /** Index into the original `BookSearchIndex.c` array. */
  indexChapterIdx: number
  /** Stable chapter id. */
  chapterId: string
  /** Sum of stem-match counts across all query tokens for this chapter. */
  score: number
}

/** Snowball algorithm names per app content language. `undefined` = no stemming. */
const STEMMER_ALGO: Record<string, string | undefined> = {
  'en-US': 'english',
  'pt-BR': 'portuguese',
  la: undefined,
}

const stemmerCache = new Map<string, SnowballStemmer>()
function getStemmer(lang: string): SnowballStemmer | undefined {
  const algo = STEMMER_ALGO[lang]
  if (!algo) return undefined
  let s = stemmerCache.get(algo)
  if (!s) {
    s = newStemmer(algo)
    stemmerCache.set(algo, s)
  }
  return s
}

// Mirror of scripts/build-corpus.py:_TOKEN_RE — Unicode letters/digits, ≥2 chars.
// `\p{L}` requires the `u` flag.
export const TOKEN_RE = /[\p{L}\p{N}_]{2,}/gu

/** Stem one already-lowercased token, or return it unchanged when the
 *  language has no Snowball algorithm (e.g. Latin). */
export function stemToken(token: string, lang: string): string {
  const stemmer = getStemmer(lang)
  return stemmer ? stemmer.stem(token) : token
}

/** Lowercase + stem a raw query into the set of distinct stems to look up. */
export function stemQuery(query: string, lang: string): string[] {
  const stemmer = getStemmer(lang)
  const seen = new Set<string>()
  const out: string[] = []
  const lower = query.toLowerCase()
  for (const m of lower.matchAll(TOKEN_RE)) {
    const tok = m[0]
    const stem = stemmer ? stemmer.stem(tok) : tok
    if (stem.length < 2 || seen.has(stem)) continue
    seen.add(stem)
    out.push(stem)
  }
  return out
}

/**
 * Look up the chapter set that matches the query. For multi-word queries we
 * intersect — only chapters containing EVERY query stem count. Falls back to
 * the single-stem path when intersection is empty.
 */
export function searchIndex(
  index: BookSearchIndex,
  query: string,
  maxResults = 200,
): ChapterMatch[] {
  const stems = stemQuery(query, index.l)
  if (stems.length === 0) return []

  // Build per-stem chapter→count maps.
  const perStem: Map<number, number>[] = []
  for (const stem of stems) {
    const flat = index.t[stem]
    if (!flat) {
      perStem.push(new Map())
      continue
    }
    const m = new Map<number, number>()
    for (let i = 0; i < flat.length; i += 2) m.set(flat[i], flat[i + 1])
    perStem.push(m)
  }

  // Intersect: a chapter must appear in EVERY stem's posting list. If no
  // stem had any postings (unknown vocabulary), nothing matches.
  const nonEmpty = perStem.filter((m) => m.size > 0)
  if (nonEmpty.length === 0) return []

  // Start from the smallest posting list to minimise work.
  nonEmpty.sort((a, b) => a.size - b.size)
  const scores = new Map<number, number>()
  for (const [ci, n] of nonEmpty[0]) {
    let total = n
    let inAll = true
    for (let i = 1; i < nonEmpty.length; i++) {
      const other = nonEmpty[i].get(ci)
      if (other === undefined) {
        inAll = false
        break
      }
      total += other
    }
    if (inAll) scores.set(ci, total)
  }

  // Fall back to union when intersection is empty (e.g. user typed two words
  // that never co-occur in any chapter). Better to surface partial matches
  // than nothing.
  if (scores.size === 0) {
    for (const m of nonEmpty) {
      for (const [ci, n] of m) scores.set(ci, (scores.get(ci) ?? 0) + n)
    }
  }

  const out: ChapterMatch[] = []
  for (const [ci, score] of scores) {
    out.push({ indexChapterIdx: ci, chapterId: index.c[ci] ?? '', score })
  }
  out.sort((a, b) => b.score - a.score)
  return out.slice(0, maxResults)
}

/** Load the per-lang search index blob for a book; throws on missing ref. */
export async function loadSearchIndex(
  manifest: BookEntry,
  lang: string,
): Promise<BookSearchIndex | undefined> {
  const ref = manifest.searchIndex?.[lang]
  if (!ref) return undefined
  return getJson<BookSearchIndex>(ref.hash)
}
