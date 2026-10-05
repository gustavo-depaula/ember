import { type Book, getChapter, getDrbBooks, type Verse } from '@/lib/content'
import { fetchHearth } from '@/lib/hearth'
import { type Locale, translator } from './locale'

type Summaries = Record<string, { intro: string; chapters: Record<string, string> }>

export type BibleBook = Book & {
  /** The name readers know today ("1 Samuel"); the Douay name where it differs ("1 Kings"). */
  title: string
  douayName?: string
  intro?: string
}

export async function listBibleBooks(locale: Locale): Promise<BibleBook[]> {
  const t = translator(locale)
  const [books, summaries] = await Promise.all([
    getDrbBooks(),
    fetchHearth<Summaries>('bible/drb/summaries.json'),
  ])
  return books.map((book) => {
    const title = t(`bookName.${book.id}`, { defaultValue: book.name })
    return {
      ...book,
      title,
      douayName: title === book.name ? undefined : book.name,
      intro: summaries[book.id]?.intro || undefined,
    }
  })
}

export type BibleChapter = {
  book: BibleBook
  chapter: number
  verses: Verse[]
  /** Challoner's argument: the line that heads the chapter in the printed Bible. */
  summary?: string
  previous?: { book: BibleBook; chapter: number }
  next?: { book: BibleBook; chapter: number }
}

export async function loadBibleChapter(
  slug: string,
  chapter: number,
  locale: Locale,
): Promise<BibleChapter> {
  const books = await listBibleBooks(locale)
  const index = books.findIndex((b) => b.id === slug)
  const book = books[index]
  if (!book) throw new Error(`No Bible book ${slug}`)
  const [{ verses }, summaries] = await Promise.all([
    getChapter('DRB', slug, chapter),
    fetchHearth<Summaries>('bible/drb/summaries.json'),
  ])
  const before = books[index - 1]
  const after = books[index + 1]
  return {
    book,
    chapter,
    verses,
    summary: summaries[slug]?.chapters[String(chapter)] || undefined,
    previous:
      chapter > 1
        ? { book, chapter: chapter - 1 }
        : before && { book: before, chapter: before.chapters },
    next:
      chapter < book.chapters
        ? { book, chapter: chapter + 1 }
        : after && { book: after, chapter: 1 },
  }
}

export async function chapterSummaries(slug: string): Promise<Record<string, string>> {
  return (await fetchHearth<Summaries>('bible/drb/summaries.json'))[slug]?.chapters ?? {}
}
