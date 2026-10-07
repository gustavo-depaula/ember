import { fetchHearth } from '@/lib/hearth'

/** One commentator's words on a passage. `who` is absent where the note signs itself. */
export type Voice = { who?: string; text: string }

/** A comment on a run of verses of one chapter; `from` and `to` are the same for one verse. */
export type CommentaryEntry = {
  from: number
  to: number
  voices: Voice[]
}

export type CommentarySource = {
  id: string
  name: string
  /** The books it comments, where that is not the whole Bible. */
  books?: string[]
}

const gospels = ['matthew', 'mark', 'luke', 'john']

export const commentarySources: CommentarySource[] = [
  { id: 'haydock', name: 'Haydock' },
  { id: 'catena', name: 'Catena Aurea', books: gospels },
]

export const defaultCommentarySource = 'haydock'

export function findCommentarySource(id: string): CommentarySource {
  return commentarySources.find((s) => s.id === id) ?? commentarySources[0]
}

export function sourcesForBook(bookId: string): CommentarySource[] {
  return commentarySources.filter((s) => !s.books || s.books.includes(bookId))
}

/**
 * A Haydock note as its remarks. The edition gathers several commentators
 * under a verse, set off by dashes and each signed at its end ("(Witham)"),
 * and prints its Greek and Latin apparatus in braces, which is left out here.
 */
export function parseHaydockNote(note: string): Voice[] {
  return note
    .replace(/\{[^{}]*\|\}/g, '')
    .split(/\s+—\s+/)
    .map((text) => ({ text: text.replace(/\s+/g, ' ').trim() }))
    .filter((voice) => voice.text)
}

type HaydockBook = Record<string, Record<string, string[]>>
type CatenaBook = {
  chapters: Record<string, { from: number; to: number; voices: Voice[] }[]>
}

// Haydock files a note under its verse, or under "8-9" for a note on several;
// "0" is a note on the chapter as a whole, which opens the chapter.
function haydockEntries(book: HaydockBook, chapter: number): CommentaryEntry[] {
  return Object.entries(book[String(chapter)] ?? {})
    .map(([verses, notes]) => {
      const [from, to = from] = verses.split('-').map(Number)
      return { from, to, voices: notes.flatMap(parseHaydockNote) }
    })
    .sort((a, b) => a.from - b.from || a.to - b.to)
}

export async function getCommentary(
  sourceId: string,
  bookId: string,
  chapter: number,
): Promise<CommentaryEntry[]> {
  const source = findCommentarySource(sourceId)
  if (source.books && !source.books.includes(bookId)) return []
  if (source.id === 'catena') {
    const book = await fetchHearth<CatenaBook>(`bible/catena/${bookId}.json`)
    return (book.chapters[String(chapter)] ?? []).map(({ from, to, voices }) => ({
      from,
      to,
      voices,
    }))
  }
  return haydockEntries(await fetchHearth<HaydockBook>(`bible/haydock/${bookId}.json`), chapter)
}

/** Every entry that speaks of the verse, in reading order. */
export function entriesForVerse(entries: CommentaryEntry[], verse: number): CommentaryEntry[] {
  return entries.filter((e) => e.from <= verse && verse <= e.to)
}

/**
 * The verses to mark in the text while a verse's commentary is open: the
 * whole of every passage that speaks of it, so a comment on verses 8–17 shows
 * what it is a comment on.
 */
export function spanForVerse(
  entries: CommentaryEntry[],
  verse: number,
): { from: number; to: number } | undefined {
  const found = entriesForVerse(entries, verse)
  if (found.length === 0) return undefined
  return {
    from: Math.min(...found.map((e) => e.from)),
    to: Math.max(...found.map((e) => e.to)),
  }
}

/** "3", or "8–17" for a passage. */
export function spanLabel(span: { from: number; to: number }): string {
  return span.from === span.to ? String(span.from) : `${span.from}–${span.to}`
}

const wordsPerMinute = 230

/** Minutes to read the entries through, at least one. */
export function readingMinutes(entries: CommentaryEntry[]): number {
  const words = entries.flatMap((e) => e.voices).reduce((n, v) => n + v.text.split(/\s+/).length, 0)
  return Math.max(1, Math.round(words / wordsPerMinute))
}
