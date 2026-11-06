import { findTranslation } from '@/lib/bibleTranslations'
import { fetchHearth } from '@/lib/hearth'

import { lexiconKey } from './lexiconKey'

/**
 * What the Greek editions say of each word: its dictionary form and its
 * parsing (a Robinson code, see `morphology.ts`), one entry per word of the
 * verse as `verseTokens` cuts it.
 */
/**
 * A verse's word slots: the one cut the word files are aligned to, so the nth
 * token is the nth `WordEntry` wherever a verse is laid out word by word.
 */
export function verseTokens(text: string) {
  return text.split(/\s+/)
}

export type WordEntry = [lemma: string, morph: string, gloss?: string, unchecked?: '?']

/**
 * The Septuagint's words were tagged by machine from two independent sources:
 * where they disagree, or only one tagger saw the word, the entry says so,
 * and the reader is told rather than shown a guess as fact.
 */
export function isUnchecked(entry: WordEntry | undefined) {
  return entry?.[3] === '?'
}

// A book's words, a concordance shard and a lexicon shard are each 0.5 to
// 1.4 MB of JSON. Walking a chapter word by word or opening a page of
// occurrences asks for the same few files over and over, so the last few are
// kept parsed. A failed read is not kept, so the next asks again.
const recent = new Map<string, Promise<unknown>>()
const recentLimit = 6

export function readLarge<T>(path: string): Promise<T> {
  const held = recent.get(path)
  if (held) {
    // Most recently used last, so the first is the one to let go.
    recent.delete(path)
    recent.set(path, held)
    return held as Promise<T>
  }
  const promise = fetchHearth<T>(path)
  promise.catch(() => {
    if (recent.get(path) === promise) recent.delete(path)
  })
  recent.set(path, promise)
  const oldest = recent.keys().next().value
  if (recent.size > recentLimit && oldest !== undefined) recent.delete(oldest)
  return promise
}

/** Where a lemma stands, with its parsing there: one per occurrence, so a verse that has the word twice is listed twice. */
export type Place = [bookId: string, chapter: number, verse: number, morph: string]

/** Every occurrence of a lemma in an edition, from its concordance. */
export async function getOccurrences(translation: string, lemma: string): Promise<Place[]> {
  const edition = findTranslation(translation)
  const key = lexiconKey(lemma)
  if (!edition?.corpus || !edition.words || !key) return []
  const shard = await readLarge<Record<string, Record<string, Place[]>>>(
    `bible/${edition.corpus}/concordance/${shardOf(key)}.json`,
  )
  return shard[key]?.[lemma.normalize('NFC')] ?? []
}

type BookWords = Record<string, Record<string, WordEntry[]>>

/** The words of a chapter of an edition, keyed by verse; undefined for an edition without word files. */
export async function getChapterWords(
  translation: string,
  bookId: string,
  chapter: number,
): Promise<Record<number, WordEntry[]> | undefined> {
  const edition = findTranslation(translation)
  if (!edition?.corpus || !edition.words) return undefined
  const book = await readLarge<BookWords>(`bible/${edition.corpus}/words/${bookId}.json`)
  const verses = book[String(chapter)] ?? {}
  return Object.fromEntries(Object.entries(verses).map(([verse, words]) => [Number(verse), words]))
}

export type LexiconSource = {
  id: string
  name: string
  author: string
  year: number
  licence: string
  attribution: string
  url: string
  entries: number
}

export type LexiconEntry = {
  lemma: string
  gloss?: string
  def: string
  strong?: number
}

/** The lexicons, in the order they are offered: the short NT glosses first, Liddell last. */
export function getLexiconSources(): Promise<LexiconSource[]> {
  return fetchHearth<LexiconSource[]>('bible/lexicon/sources.json')
}

// Shards are one per letter of the alphabet; a key that opens on anything
// else is in `_`. scripts/greek-bible/lexicon_key.py writes them so.
function shardOf(key: string) {
  const first = key.slice(0, 1)
  return first >= 'α' && first <= 'ω' && first !== 'ς' ? first : '_'
}

/**
 * A lemma's entries in one lexicon: those spelled exactly as the lemma first,
 * then the homographs that share its bare letters (εἰμί "be" and εἶμι "go").
 */
export async function lookUp(source: string, lemma: string): Promise<LexiconEntry[]> {
  const key = lexiconKey(lemma)
  if (!key) return []
  const shard = await readLarge<Record<string, LexiconEntry[]>>(
    `bible/lexicon/${source}/${shardOf(key)}.json`,
  )
  const entries = shard[key] ?? []
  const exact = lemma.normalize('NFC')
  return [
    ...entries.filter((entry) => entry.lemma === exact),
    ...entries.filter((entry) => entry.lemma !== exact),
  ]
}
