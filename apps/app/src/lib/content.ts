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

const bollsBookCache = new Map<string, BollsBook[]>()

async function getBollsBooks(translation: string): Promise<BollsBook[]> {
  const cached = bollsBookCache.get(translation)
  if (cached) return cached

  const books = await fetchBooks(translation)
  bollsBookCache.set(translation, books)
  return books
}

export async function getBooks(translation: string): Promise<Book[]> {
  if (translation === 'DRB') return getDrbBooks()

  const bollsBooks = await getBollsBooks(translation)

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

// Bolls numbers books with one scheme across every translation: 1–66 in the
// Protestant order, the deuterocanon after them on these fixed ids. A Catholic
// translation carries 73 books but does not renumber them into Catholic order.
const deuterocanonicalBollsIds: Record<string, number> = {
  tobias: 68,
  judith: 69,
  wisdom: 70,
  ecclesiasticus: 71,
  baruch: 73,
  '1-machabees': 74,
  '2-machabees': 75,
}

// bookId is either a numeric string (from the Bible reader) or a DRB slug (from
// lectio track entries). Slugs can't be matched by name: `/get-books/` answers
// in the translation's own language ("Mateus" under CNBB, "Evangelium secundum
// Matthaeum" under VULG), so the slug maps onto Bolls' fixed id scheme instead.
async function resolveBollsBookId(
  translation: string,
  bookId: string,
): Promise<number | undefined> {
  const numeric = Number.parseInt(bookId, 10)
  if (!Number.isNaN(numeric)) return numeric

  const drbBooks = await getDrbBooks()
  // Dropping the deuterocanon from the DRB's 73 leaves the 66-book order.
  const position = drbBooks
    .filter((b) => !(b.id in deuterocanonicalBollsIds))
    .findIndex((b) => b.id === bookId)
  const id = deuterocanonicalBollsIds[bookId] ?? (position >= 0 ? position + 1 : undefined)
  if (id === undefined) return undefined

  // A deuterocanonical book asked of a 66-book translation is missing here,
  // and rightly falls through to the bundled DRB.
  const bollsBooks = await getBollsBooks(translation)
  return bollsBooks.some((b) => b.bookid === id) ? id : undefined
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
    try {
      return { verses: await getDrbChapter(bookId, chapter), fallback: true }
    } catch {
      throw new Error(
        `Failed to fetch ${translation}/${bookId}/${chapter} and no DRB fallback found`,
      )
    }
  }
}
