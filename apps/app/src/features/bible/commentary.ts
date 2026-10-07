import { loadBookChapterText } from '@/content/books'
import { fetchHearth } from '@/lib/hearth'

/** One commentator's words on a passage. `who` is absent where the note signs itself. */
export type Voice = { who?: string; text: string }

/**
 * A comment on a run of verses of one chapter; `from` and `to` are the same
 * for one verse. Its words come with it (`voices`), or stay in the book they
 * belong to and are read from there (`lecture`).
 */
export type CommentaryEntry = {
  from: number
  to: number
  voices?: Voice[]
  lecture?: { bookId: string; chapterId: string }
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
type CatenaIndex = {
  book: string
  chapters: Record<string, { from: number; to: number; lecture: string }[]>
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * A Catena lecture, as its book has it, as the Fathers' voices. The four
 * transcriptions attribute differently ("CHRYS …", "**Bede**; …", "Chrys. …"),
 * so a paragraph opens a voice when it starts with a name from `fathers`, the
 * table `scripts/build-catena-commentary.py` divides lectures by too. What
 * comes before the first voice is the passage itself, which the reader has
 * above.
 */
export function parseCatenaLecture(markdown: string, fathers: Record<string, string>): Voice[] {
  const aliases = Object.keys(fathers)
    .sort((a, b) => b.length - a.length)
    .map((alias) => escapeRegExp(alias).replace(/ /g, '\\.? '))
  const name = new RegExp(
    `^(?:\\*\\*([^*]+?)\\*\\*|(${aliases.join('|')}))(?=[\\s.,;:])[.,;:]*\\s+`,
    'i',
  )
  const voices: Voice[] = []
  for (const block of markdown.split('\n\n').slice(1)) {
    const paragraph = block.trim().replace(/^>+/, '').replace(/\s+/g, ' ').trim()
    if (!paragraph) continue
    const match = name.exec(paragraph)
    const key = (match?.[1] ?? match?.[2] ?? '')
      .replace(/[.,;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
    // "Jerome, in Prolog." is Jerome; a bold phrase that is no Father is prose.
    const who = fathers[key] ?? fathers[key.split(/,| in | de /)[0].trim()]
    const body = (who && match ? paragraph.slice(match[0].length) : paragraph)
      .replace(/\^[^^]*\^/g, '')
      .trim()
    if (who) voices.push({ who, text: body })
    else if (voices.length > 0) voices[voices.length - 1].text += `\n\n${body}`
  }
  return voices
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
    const index = await fetchHearth<CatenaIndex>(`bible/catena/${bookId}.json`)
    return (index.chapters[String(chapter)] ?? []).map(({ from, to, lecture }) => ({
      from,
      to,
      lecture: { bookId: index.book, chapterId: lecture },
    }))
  }
  return haydockEntries(await fetchHearth<HaydockBook>(`bible/haydock/${bookId}.json`), chapter)
}

/**
 * An entry's words: its own, or its lecture read from the book. The Catena is
 * in the corpus in English and Latin; English is what is read here.
 */
export async function loadVoices(entry: CommentaryEntry): Promise<Voice[]> {
  if (entry.voices) return entry.voices
  if (!entry.lecture) return []
  const { bookId, chapterId } = entry.lecture
  const [text, fathers] = await Promise.all([
    loadBookChapterText(bookId, chapterId, 'en-US'),
    fetchHearth<Record<string, string>>('bible/catena/fathers.json'),
  ])
  if (text === undefined) throw new Error(`Lecture ${chapterId} is not in ${bookId}`)
  return parseCatenaLecture(text, fathers)
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

/** Minutes to read the voices through, at least one. */
export function readingMinutes(voices: Voice[]): number {
  const words = voices.reduce((n, v) => n + v.text.split(/\s+/).length, 0)
  return Math.max(1, Math.round(words / wordsPerMinute))
}

/**
 * The opening of a run of commentary, for the half page beside the text: whole
 * voices while they fit in `budget` characters, then the next one cut at a
 * sentence. `cut` says there is more to read.
 */
export function excerpt(voices: Voice[], budget: number): { voices: Voice[]; cut: boolean } {
  const kept: Voice[] = []
  let left = budget
  for (const voice of voices) {
    if (voice.text.length <= left) {
      kept.push(voice)
      left -= voice.text.length
      continue
    }
    // Too little room left to open another voice: it waits for the full page.
    if (kept.length > 0 && left < budget / 3) return { voices: kept, cut: true }
    const head = voice.text.slice(0, left)
    const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('; '), head.lastIndexOf('? '))
    kept.push({ ...voice, text: end > left / 2 ? head.slice(0, end + 1) : `${head.trimEnd()}…` })
    return { voices: kept, cut: true }
  }
  return { voices: kept, cut: false }
}
