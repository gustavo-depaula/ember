import { getExternalContent, putExternalContent } from '@/db/repositories/externalContent'
import { type Verse, webBibles } from '@/sources/bible'
import { findTranslation } from './bibleTranslations'
import { fetchHearth } from './hearth'

export type { Verse }

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

async function getCorpusChapter(dir: string, bookSlug: string, chapter: number): Promise<Verse[]> {
  const bookData = await fetchHearth<Record<string, Record<string, string>>>(
    `bible/${dir}/${bookSlug}.json`,
  )
  const chapterData = bookData[String(chapter)]
  if (!chapterData) throw new Error(`Chapter ${chapter} not found in ${dir}/${bookSlug}`)

  return Object.entries(chapterData)
    .map(([verseNum, text]) => ({
      verse: Number.parseInt(verseNum, 10),
      text: text.replace(/\*/g, ''),
    }))
    .sort((a, b) => a.verse - b.verse)
}

const corpusBooksCache = new Map<string, Book[]>()

async function getCorpusBooks(dir: string): Promise<Book[]> {
  const cached = corpusBooksCache.get(dir)
  if (cached) return cached
  const index = await fetchHearth<BookMeta[]>(`bible/${dir}/index.json`)
  const books = index.map((b) => ({
    id: b.slug,
    name: b.name,
    chapters: b.chapters,
    testament: b.testament,
  }))
  corpusBooksCache.set(dir, books)
  return books
}

export function getDrbBooks(): Promise<Book[]> {
  return getCorpusBooks('drb')
}

// Every translation lists the same 73 books under the Douay slugs, so a
// reference or a reading position carries over when the translation changes.
export async function getBooks(translation: string): Promise<Book[]> {
  const corpus = findTranslation(translation)?.corpus
  if (corpus) return getCorpusBooks(corpus)

  const drbBooks = await getDrbBooks()
  const chapters = webBibles[translation]?.chapters
  if (!chapters) return drbBooks
  return drbBooks.map((b) => ({ ...b, chapters: chapters[b.id] ?? b.chapters }))
}

export type ChapterResult = {
  verses: Verse[]
  fallback?: boolean
}

// A chapter read from its publisher is kept in `external_content`, so it is
// fetched once and reads offline afterwards.
async function getWebChapter(translation: string, bookId: string, chapter: number) {
  const key = {
    producerId: `bible/${translation}`,
    producerVersion: '1',
    lang: '',
    cacheKey: `${bookId}/${chapter}`,
    paramsKey: '',
  }
  const cached = await getExternalContent<Verse[]>(key)
  if (cached) return cached.payload

  const verses = await webBibles[translation].fetchChapter(bookId, chapter)
  if (verses.length === 0) throw new Error(`${translation}: no verses in ${bookId} ${chapter}`)
  await putExternalContent(key, verses)
  return verses
}

function getTranslationChapter(translation: string, bookId: string, chapter: number) {
  const corpus = findTranslation(translation)?.corpus
  if (corpus) return getCorpusChapter(corpus, bookId, chapter)
  if (translation in webBibles) return getWebChapter(translation, bookId, chapter)
  throw new Error(`Unknown translation: ${translation}`)
}

export async function getChapter(
  translation: string,
  bookId: string,
  chapter: number,
): Promise<ChapterResult> {
  if (translation === 'DRB') {
    return { verses: await getCorpusChapter('drb', bookId, chapter) }
  }

  // Offline, a publisher's site changed, or a chapter this translation numbers
  // differently: the Douay-Rheims stands in, and `fallback` tells the reader so.
  try {
    return { verses: await getTranslationChapter(translation, bookId, chapter) }
  } catch (cause) {
    try {
      return { verses: await getCorpusChapter('drb', bookId, chapter), fallback: true }
    } catch {
      throw new Error(`Failed to fetch ${translation}/${bookId}/${chapter}`, { cause })
    }
  }
}
