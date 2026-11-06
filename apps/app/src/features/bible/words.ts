import { findTranslation } from '@/lib/bibleTranslations'
import { fetchHearth } from '@/lib/hearth'

import { lexiconKey } from './lexiconKey'

/**
 * What the Greek editions say of each word: its dictionary form and its
 * parsing (a Robinson code, see `morphology.ts`), one entry per word of the
 * verse as `text.split(/\s+/)` cuts it.
 */
export type WordEntry = [lemma: string, morph: string, gloss?: string]

export type Place = [bookId: string, chapter: number, verse: number]

/** The verses of an edition where a lemma stands, from its concordance. */
export async function getOccurrences(translation: string, lemma: string): Promise<Place[]> {
  const edition = findTranslation(translation)
  const key = lexiconKey(lemma)
  if (!edition?.corpus || !edition.words || !key) return []
  const shard = await fetchHearth<Record<string, Record<string, Place[]>>>(
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
  const book = await fetchHearth<BookWords>(`bible/${edition.corpus}/words/${bookId}.json`)
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
  const shard = await fetchHearth<Record<string, LexiconEntry[]>>(
    `bible/lexicon/${source}/${shardOf(key)}.json`,
  )
  const entries = shard[key] ?? []
  const exact = lemma.normalize('NFC')
  return [
    ...entries.filter((entry) => entry.lemma === exact),
    ...entries.filter((entry) => entry.lemma !== exact),
  ]
}
