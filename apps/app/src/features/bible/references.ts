import { fetchHearth } from '@/lib/hearth'

// What points at a verse from elsewhere: the Masses that read it, the articles
// of the Summa that quote it, the popes' homilies and addresses that do. Each
// is an index by the verses a place cites, so a verse shows only what cites
// it, not everything said of the passage around it.

/** What the half page beside the text can show of a verse, besides its commentators. */
export const referenceKinds = [
  'translations',
  'catechism',
  'summa',
  'homilies',
  'councils',
  'popes',
  'mass',
] as const
export type ReferenceKind = (typeof referenceKinds)[number]

export function isReferenceKind(id: string): id is ReferenceKind {
  return (referenceKinds as readonly string[]).includes(id)
}

// A book nothing cites (Abdias in the Summa) has no file in an index: that is
// an empty index, where any other failure is one.
async function fetchIndex<T>(path: string, empty: T): Promise<T> {
  try {
    return await fetchHearth<T>(path)
  } catch (error) {
    if (error instanceof Error && error.message.endsWith(': 404')) return empty
    throw error
  }
}

/** A reading of the Mass, by the verses of one chapter it reads. */
export type MassReading = {
  from: number
  to: number
  /** The lectionary entry's id, which the missal's calendar gives a title. */
  day: string
  part: 'firstReading' | 'secondReading' | 'gospel' | 'psalm'
  /** The Sunday year (A, B, C) or the weekday year (I, II), where the day has one. */
  cycle?: 'A' | 'B' | 'C' | 'I' | 'II'
}

export async function getChapterReadings(bookId: string, chapter: number): Promise<MassReading[]> {
  const book = await fetchIndex<Record<string, MassReading[]>>(
    `bible/lectionary/${bookId}.json`,
    {},
  )
  return book[String(chapter)] ?? []
}

function weight(reading: MassReading): number {
  const sunday = /\.sunday$|\.solemnity\.|holy-week|nativity|easter\.(sunday|vigil)/.test(
    reading.day,
  )
  const season = reading.day.startsWith('tempore.')
  return (reading.part === 'psalm' ? 4 : 0) + (sunday ? 0 : season ? 1 : 2)
}

/**
 * The Masses that read a verse: Sundays and feasts of the Lord first, then the
 * weekdays, then the saints, a psalm sung in answer after the readings. A day
 * that offers a longer and a shorter form of a reading is listed once.
 */
export function readingsForVerse(readings: MassReading[], verse: number): MassReading[] {
  const seen = new Set<string>()
  return readings
    .filter((r) => r.from <= verse && verse <= r.to)
    .filter((r) => {
      const key = `${r.day}|${r.part}|${r.cycle ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => weight(a) - weight(b) || a.day.localeCompare(b.day))
}

// A file of places that cite a book's verses: the places once, and for each
// chapter [first verse, last verse, place] by the place's position.
type Cited<T> = { items: T[]; chapters: Record<string, [number, number, number][]> }

async function citing<T>(path: string, chapter: number, verse: number): Promise<T[]> {
  const book = await fetchIndex<Cited<T>>(path, { items: [], chapters: {} })
  const places = (book.chapters[String(chapter)] ?? [])
    .filter(([from, to]) => from <= verse && verse <= to)
    .map(([, , place]) => place)
  return [...new Set(places)].sort((a, b) => a - b).map((place) => book.items[place])
}

/** An article of the Summa Theologiae: its chapter in the corpus's book, and its question. */
export type SummaArticle = [chapterId: string, title: string]

export const summaBookId = 'aquinas-summa-theologiae'

/** The articles of the Summa that quote a verse, in the Summa's order. */
export function getSummaArticles(
  bookId: string,
  chapter: number,
  verse: number,
): Promise<SummaArticle[]> {
  return citing<SummaArticle>(`bible/summa/${bookId}.json`, chapter, verse)
}

/** "ss-q017-a06" as "II-II, q. 17, a. 6"; a question's preface has no article. */
export function summaLabel(chapterId: string): string {
  const match = /^(fp|fs|ss|tp|xp)-q(\d+)-(?:a(\d+)|pr)$/.exec(chapterId)
  if (!match) return chapterId
  const part = { fp: 'I', fs: 'I-II', ss: 'II-II', tp: 'III', xp: 'Suppl.' }[match[1] as 'fp']
  return `${part}, q. ${Number(match[2])}${match[3] ? `, a. ${Number(match[3])}` : ''}`
}

/**
 * A homily, audience or address of a pope, in Portuguese on Biblia Clerus:
 * the collection it is in, its title (the day and the occasion), and the page
 * and anchor its text opens at.
 */
export type Talk = [collection: string, title: string, page: string, anchor: string]

/** The popes' homilies and addresses that quote a verse, as Clerus orders them. */
export async function getTalks(bookId: string, chapter: number, verse: number): Promise<Talk[]> {
  const talks = await citing<Talk>(`bible/clerus/talks/${bookId}.json`, chapter, verse)
  // Clerus breaks a long text over several places, each under the text's
  // title: the first of them is where it opens.
  const seen = new Set<string>()
  return talks.filter(([collection, title]) => {
    const key = `${collection}|${title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** A run of verses a paragraph of the Catechism cites; `to` is 999 for "to the chapter's end". */
export type CitedVerses = [bookId: string, chapter: number, from: number, to: number]

/** The Scripture a paragraph of the Catechism cites: the index of citations, turned around. */
export async function getParagraphScripture(paragraph: number): Promise<CitedVerses[]> {
  const cited = await fetchHearth<Record<string, CitedVerses[]>>('bible/catechism.json')
  return cited[String(paragraph)] ?? []
}

/** "3:16", "3:16–18", "3:16 ff." for a run to the end, "3" for a chapter cited whole. */
export function versesLabel([, chapter, from, to]: CitedVerses): string {
  if (from === 1 && to >= 999) return String(chapter)
  if (to >= 999) return `${chapter}:${from} ff.`
  return from === to ? `${chapter}:${from}` : `${chapter}:${from}–${to}`
}
