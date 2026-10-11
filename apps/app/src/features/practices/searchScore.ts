/**
 * Scoring for search over the catalog. Pure: it compares words already
 * normalized into an index (see searchCatalog.ts), so it runs wherever the
 * index does.
 */

import { matchWords, normalizeForSearch, searchWords } from '@/lib/search'

export type SearchResult =
  | { kind: 'practice'; id: string; title: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string }
  | { kind: 'chant'; id: string; title: string; subtitle?: string }

export type SearchKind = SearchResult['kind']

/** Text as written, for the row, beside its normalized words, for matching. */
export type Phrase = { text: string; words: string[] }

export type IndexEntry = {
  result: SearchResult
  /** Title words joined by single spaces, for whole-phrase comparison. */
  title: string
  titleWords: string[]
  /** The title in the languages the app is not showing: "Anima Christi" must
   *  find the prayer a Portuguese reader sees as "Alma de Cristo". */
  otherNames?: Phrase[]
  author?: string[]
  tags?: string[]
  /** What a practice is asked for by other than its name: authored keywords
   *  and the collection headings it is filed under ("Thanksgiving after Mass"). */
  keywords?: Phrase[]
  /** Opening lines of the practice's own prayers. */
  lines?: Phrase[]
  description?: string[]
}

export const searchGroupOrder: SearchKind[] = ['practice', 'collection', 'book', 'chant']

/**
 * `top` is the best match when its kind would otherwise list it below another
 * kind's weaker ones; `mentioned` holds practices that only name the query in
 * their description — related, but not what was asked for.
 */
export type SearchGroup = 'top' | SearchKind | 'mentioned'

export const searchGroups: SearchGroup[] = ['top', ...searchGroupOrder, 'mentioned']

export type SearchHit = {
  result: SearchResult
  group: SearchGroup
  /** The words that matched, when the title on the row is not them. */
  caption?: string
}

type Score = { score: number; caption?: string }

const descriptionScore = 10
const sureScore = 70

function wordsScore(title: string, titleWords: string[], q: string, tokens: string[]): number {
  if (title === q) return 100
  if (title.startsWith(q)) return 90
  const match = matchWords(titleWords, tokens)
  if (match === 'exact') return 75
  if (match === 'prefix') return sureScore
  return match ? 40 : 0
}

// A name in another language ranks a point under the same match on the title
// shown, so the row that reads as typed comes first.
function titleScore(entry: IndexEntry, q: string, tokens: string[]): Score {
  let best: Score = { score: wordsScore(entry.title, entry.titleWords, q, tokens) }
  for (const name of entry.otherNames ?? []) {
    const score = wordsScore(name.words.join(' '), name.words, q, tokens) - 1
    if (score > best.score) best = { score, caption: name.text }
  }
  return best
}

// A heading is recalled by its nouns, not its grammar: "ação de graças depois
// da missa" has to find "Ação de Graças após a Santa Missa".
const connectives = new Set(
  'a an the of to for in on at and after before o os as um uma de do da dos das e em no na nos nas ao aos para por pelo pela apos depois antes'.split(
    ' ',
  ),
)

function phraseMatch(phrases: Phrase[] | undefined, tokens: string[]): Phrase | undefined {
  return phrases?.find((p) => matchWords(p.words, tokens, { typos: false }))
}

function keywordMatch(keywords: Phrase[] | undefined, tokens: string[]): Phrase | undefined {
  if (!keywords) return undefined
  // The last token may be a word still being typed ("a" on its way to "after").
  const nouns = tokens.filter((tok, i) => i === tokens.length - 1 || !connectives.has(tok))
  return phraseMatch(keywords, nouns)
}

// Everything but the title is matched as typed — typo forgiveness there turned
// up practices whose titles share nothing with the query. Opening lines and
// descriptions are weak signals, so they wait for a few letters.
function scoreEntry(entry: IndexEntry, q: string, tokens: string[]): Score {
  const title = titleScore(entry, q, tokens)
  if (title.score >= sureScore) return title
  const candidates: Score[] = [title]
  if (entry.author && matchWords(entry.author, tokens)) candidates.push({ score: 50 })
  const keyword = keywordMatch(entry.keywords, tokens)
  if (keyword) candidates.push({ score: 35, caption: keyword.text })
  if (entry.tags && matchWords(entry.tags, tokens, { typos: false })) candidates.push({ score: 30 })
  if (q.length >= 3) {
    const line = phraseMatch(entry.lines, tokens)
    if (line) candidates.push({ score: 25, caption: line.text })
    if (entry.description && matchWords(entry.description, tokens, { typos: false }))
      candidates.push({ score: descriptionScore })
  }
  return candidates.reduce((best, c) => (c.score > best.score ? c : best))
}

/**
 * Matches in display order: grouped, best score first within a group, and the
 * shorter title first on a tie — "Mental Prayer" above "Mental Prayer —
 * Teresian Method".
 */
export function searchIndex(index: IndexEntry[], query: string): SearchHit[] {
  const tokens = searchWords(normalizeForSearch(query))
  if (tokens.length === 0) return []
  const q = tokens.join(' ')
  const scored: (Score & { entry: IndexEntry })[] = []
  for (const entry of index) {
    const score = scoreEntry(entry, q, tokens)
    if (score.score > 0) scored.push({ ...score, entry })
  }
  scored.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length)

  const asked = scored.filter((s) => s.score > descriptionScore)
  const byKind = searchGroupOrder.flatMap((kind) =>
    asked.filter((s) => s.entry.result.kind === kind),
  )
  // Lifted out only when the kind order would bury it: a sure match already
  // heading the list needs no second heading.
  const best = asked[0]
  const top =
    best && best.score >= sureScore && best.entry.result.kind !== byKind[0].entry.result.kind
      ? best
      : undefined

  const hit = (s: (typeof scored)[number], group: SearchGroup): SearchHit => ({
    result: s.entry.result,
    group,
    caption: s.caption,
  })
  return [
    ...(top ? [hit(top, 'top')] : []),
    ...byKind.filter((s) => s !== top).map((s) => hit(s, s.entry.result.kind)),
    ...scored.filter((s) => s.score <= descriptionScore).map((s) => hit(s, 'mentioned')),
  ]
}
