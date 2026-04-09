import type { BollsBook } from './bolls'
import { fetchBooks, fetchChapter } from './bolls'
import { fetchHearth } from './hearth'

export type Verse = {
  verse: number
  text: string
}

export type Book = {
  id: string
  name: string
  chapters: number
  testament: 'ot' | 'nt'
}

type BookMeta = {
  slug: string
  name: string
  testament: 'ot' | 'nt'
  chapters: number
}

async function getDrbChapter(bookSlug: string, chapter: number): Promise<Verse[]> {
  const bookData = await fetchHearth<Record<string, Record<string, string>>>(
    `bible/drb/${bookSlug}.json`,
  )
  const chapterData = bookData[String(chapter)]
  if (!chapterData) throw new Error(`Chapter ${chapter} not found in ${bookSlug}`)

  return Object.entries(chapterData)
    .map(([verseNum, text]) => ({
      verse: Number.parseInt(verseNum, 10),
      text: text.replace(/\*/g, ''),
    }))
    .sort((a, b) => a.verse - b.verse)
}

let drbBooksCache: Book[] | undefined

export async function getDrbBooks(): Promise<Book[]> {
  if (!drbBooksCache) {
    const index = await fetchHearth<BookMeta[]>('bible/drb/index.json')
    drbBooksCache = index.map((b) => ({
      id: b.slug,
      name: b.name,
      chapters: b.chapters,
      testament: b.testament,
    }))
  }
  return drbBooksCache
}

// Bolls.life book list cache (in-memory, per session)
const bollsBookCache = new Map<string, BollsBook[]>()

export async function getBooks(translation: string): Promise<Book[]> {
  if (translation === 'DRB') return getDrbBooks()

  let bollsBooks = bollsBookCache.get(translation)
  if (!bollsBooks) {
    bollsBooks = await fetchBooks(translation)
    bollsBookCache.set(translation, bollsBooks)
  }

  return bollsBooks.map((b) => ({
    id: String(b.bookid),
    name: b.name,
    chapters: b.chapters,
    testament: b.bookid <= 46 ? ('ot' as const) : ('nt' as const),
  }))
}

export type ChapterResult = {
  verses: Verse[]
  fallback?: boolean
}

// Resolve a bookId to a Bolls numeric ID. bookId can be either a numeric string
// (from the Bible reader) or a DRB slug (from lectio track entries).
async function resolveBollsBookId(
  translation: string,
  bookId: string,
): Promise<number | undefined> {
  const numeric = Number.parseInt(bookId, 10)
  if (!Number.isNaN(numeric)) return numeric

  // bookId is a DRB slug — find the matching Bolls book by name
  let bollsBooks = bollsBookCache.get(translation)
  if (!bollsBooks) {
    bollsBooks = await fetchBooks(translation)
    bollsBookCache.set(translation, bollsBooks)
  }
  const drbBooks = await getDrbBooks()
  const drbBook = drbBooks.find((b) => b.id === bookId)
  if (!drbBook) return undefined
  const match = bollsBooks.find((b) => b.name.toLowerCase() === drbBook.name.toLowerCase())
  return match?.bookid
}

export async function getChapter(
  translation: string,
  bookId: string,
  chapter: number,
): Promise<ChapterResult> {
  if (translation === 'DRB') {
    return { verses: await getDrbChapter(bookId, chapter) }
  }

  try {
    const bollsId = await resolveBollsBookId(translation, bookId)
    if (bollsId === undefined) throw new Error(`Unknown book: ${bookId}`)
    const verses = await fetchChapter(translation, bollsId, chapter)
    return {
      verses: verses.map((v) => ({ verse: v.verse, text: v.text })),
    }
  } catch {
    // Fallback to DRB if online fetch fails
    try {
      return { verses: await getDrbChapter(bookId, chapter), fallback: true }
    } catch {
      throw new Error(
        `Failed to fetch ${translation}/${bookId}/${chapter} and no DRB fallback found`,
      )
    }
  }
}
