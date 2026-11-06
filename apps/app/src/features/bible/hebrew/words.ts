import { fetchHearth } from '@/lib/hearth'

import { readLarge } from '../words'

/**
 * A Hebrew verse's word slots, the cut the Hebrew word files are aligned to:
 * split at spaces, then after every maqaf, which stays with the word before it
 * (כִּֽי־טֹ֑וב is two words to study, one to read). The paseq ׀ and the
 * inverted nun are slots of their own, with no word to study.
 */
export function hebrewTokens(text: string): string[] {
  const out: string[] = []
  for (const part of text.split(/\s+/)) {
    if (!part) continue
    let from = 0
    for (let i = 0; i < part.length; i++) {
      if (part[i] === '־') {
        out.push(part.slice(from, i + 1))
        from = i + 1
      }
    }
    if (from < part.length) out.push(part.slice(from))
  }
  return out
}

/** One piece of a Hebrew word: a prefix, the word itself, or a suffix. */
export type HebrewPiece = [dStrong: string, gloss: string, morph: string, hebrew: string]

/**
 * What the edition says of one slot (`hebrewTokens`). `p` is empty for
 * punctuation, for the second half of a word studied on the slot before it
 * (`j`), and for letters written but not read (`w` with an empty `q`).
 */
export type HebrewWord = {
  p: HebrewPiece[]
  /** STEPBible's transliteration: `.` between syllables, `/` between pieces, the stressed syllable capitalised. */
  t?: string
  /** The form read aloud, where the text shows the written one; empty when nothing is read. */
  q?: string
  /** The written consonants, where they differ from what is read. */
  w?: string
  /** This slot belongs to the word on the slot before it. */
  j?: 1
}

/** A slot with a word in it to study. */
export function isStudiable(word: HebrewWord | undefined): word is HebrewWord {
  return word !== undefined && word.p.length > 0
}

/** The piece a word is looked up by: its own, not a prefix or suffix (H9001+). */
export function mainPiece(word: HebrewWord): HebrewPiece | undefined {
  return word.p.find(([dStrong]) => !isAffix(dStrong)) ?? word.p[0]
}

/** Prefixes and suffixes (the article, prepositions, pronoun endings) are numbered from H9001. */
export function isAffix(dStrong: string) {
  return strongNumber(dStrong) >= 9001
}

function strongNumber(dStrong: string) {
  return Number.parseInt(dStrong.replace(/\D/g, ''), 10)
}

/** The shard a dStrong is filed in, for the concordance and every Hebrew lexicon: 500 numbers a shard. */
export function hebrewShard(dStrong: string) {
  return String(Math.floor(strongNumber(dStrong) / 500)).padStart(2, '0')
}

type BookWords = Record<string, Record<string, HebrewWord[]>>

/** A chapter's words, keyed by verse. */
export async function getHebrewChapterWords(
  corpus: string,
  bookId: string,
  chapter: number,
): Promise<Record<number, HebrewWord[]>> {
  const book = await readLarge<BookWords>(`bible/${corpus}/words/${bookId}.json`)
  const verses = book[String(chapter)] ?? {}
  return Object.fromEntries(Object.entries(verses).map(([verse, words]) => [Number(verse), words]))
}

/** A place a word stands, with its grammar there: one row per occurrence. */
export type HebrewOccurrence = [bookId: string, chapter: number, verse: number, morph: string]

/** Every occurrence of a word in the edition, in canonical order. */
export async function getHebrewOccurrences(
  corpus: string,
  dStrong: string,
): Promise<HebrewOccurrence[]> {
  const shard = await readLarge<Record<string, HebrewOccurrence[]>>(
    `bible/${corpus}/concordance/${hebrewShard(dStrong)}.json`,
  )
  return shard[dStrong] ?? []
}

/** How many times each word stands in the edition, prefixes and suffixes included. */
export function getHebrewCounts(corpus: string): Promise<Record<string, number>> {
  return fetchHearth<Record<string, number>>(`bible/${corpus}/concordance/counts.json`)
}

/** What each grammar code means, field by field (TEHMC; see morphology.ts). */
export function getHebrewMorphology(corpus: string): Promise<Record<string, MorphFields>> {
  return fetchHearth<Record<string, MorphFields>>(`bible/${corpus}/morphology.json`)
}

/** TEHMC's fields for one code, each value a key under `bible.hebrewMorph`. */
export type MorphFields = {
  /** Hebrew or Aramaic. */
  l: 'hebrew' | 'aramaic'
  f: string
  s?: string
  a?: string
  v?: string
  m?: string
  t?: string
  md?: string
  p?: string
  g?: string
  n?: string
  st?: string
}

/** The paragraph marks after verses, and the few inside one (after its first n slots). */
export type HebrewParagraphs = {
  after: Record<string, 'p' | 's'>
  inside: Record<string, [slots: number, mark: 'p' | 's'][]>
}

export async function getHebrewParagraphs(
  corpus: string,
  bookId: string,
): Promise<HebrewParagraphs> {
  const [after, inside] = await Promise.all([
    fetchHearth<Record<string, Record<string, 'p' | 's'>>>(`bible/${corpus}/paragraphs.json`),
    fetchHearth<Record<string, Record<string, [number, 'p' | 's'][]>>>(
      `bible/${corpus}/paragraphs-inside.json`,
    ),
  ])
  return { after: after[bookId] ?? {}, inside: inside[bookId] ?? {} }
}

/** A run of a dictionary's text: `[kind, text]`, or a reference `[kind, text, target]`. */
export type LexiconRun = [kind: string, text: string, target?: string]

/** One paragraph of an entry: its depth in the outline, its sense label, its runs. */
export type LexiconParagraph = { d: number; n?: string; r: LexiconRun[] }

export type HebrewLexiconEntry = {
  lemma: string
  /** Transliteration (SBL academic). */
  x: string
  pos?: string
  gloss?: string
  pron?: string
  body?: LexiconParagraph[]
  /** God's Name: the word read in its place. */
  read?: string
}

/** A word's entry in one Hebrew lexicon (`tbesh`, `bdb`, `strongs`). */
export async function lookUpHebrew(
  source: string,
  dStrong: string,
): Promise<HebrewLexiconEntry | undefined> {
  const shard = await readLarge<Record<string, HebrewLexiconEntry>>(
    `bible/lexicon-hebrew/${source}/${hebrewShard(dStrong)}.json`,
  )
  return shard[dStrong]
}

export type RootFamily = {
  /** The root's letters. */
  root: string
  x: string
  members: { d: string; lemma: string; x: string; pos?: string; gloss: string; count: number }[]
}

/** The words Brown–Driver–Briggs files under the same root, or undefined where it files none. */
export async function getRootFamily(dStrong: string): Promise<RootFamily | undefined> {
  const roots = await readLarge<Record<string, string>>('bible/lexicon-hebrew/roots.json')
  const id = roots[dStrong]
  if (!id) return undefined
  const families = await readLarge<Record<string, RootFamily>>('bible/lexicon-hebrew/families.json')
  return families[id]
}
