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

/**
 * The corpus editions a translation reads from, in order: itself, the edition
 * that completes it, that one's completion, and so on. The Hebrew Bible reads
 * the deuterocanon from the Septuagint and the New Testament from the Nestle
 * 1904, which completes the Septuagint; the Nestle and the Septuagint complete
 * each other, so an edition met twice ends the chain.
 */
function completionChain(translation: string): { code: string; corpus: string }[] {
  const chain: { code: string; corpus: string }[] = []
  for (let code: string | undefined = translation; code; ) {
    const edition = findTranslation(code)
    if (!edition?.corpus || chain.some((e) => e.code === code)) break
    chain.push({ code, corpus: edition.corpus })
    code = edition.completes
  }
  return chain
}

/**
 * The edition a book is read from: the translation's own, or for a book it
 * lacks, the first edition down its completion chain that has it (a Greek New
 * Testament reads its Old Testament from the Septuagint).
 */
export async function servingEdition(translation: string, bookId: string): Promise<string> {
  const chain = completionChain(translation)
  if (chain.length < 2) return translation
  for (const { code, corpus } of chain) {
    if ((await getCorpusBooks(corpus)).some((b) => b.id === bookId)) return code
  }
  return translation
}

// Every translation lists the same 73 books under the Douay slugs, so a
// reference or a reading position carries over when the translation changes.
export async function getBooks(translation: string): Promise<Book[]> {
  const chain = completionChain(translation)
  if (chain.length > 1) {
    const [order, ...lists] = await Promise.all([
      getDrbBooks(),
      ...chain.map(({ corpus }) => getCorpusBooks(corpus)),
    ])
    // The first edition in the chain to have a book reads it.
    const byId = new Map<string, Book>()
    for (const list of lists) for (const b of list) if (!byId.has(b.id)) byId.set(b.id, b)
    const at = (id: string) => order.findIndex((b) => b.id === id)
    return [...byId.values()].sort((a, b) => at(a.id) - at(b.id))
  }
  const corpus = findTranslation(translation)?.corpus
  if (corpus) return getCorpusBooks(corpus)

  const drbBooks = await getDrbBooks()
  const chapters = webBibles[translation]?.chapters
  if (!chapters) return drbBooks
  return drbBooks.map((b) => ({ ...b, chapters: chapters[b.id] ?? b.chapters }))
}

export type ChapterResult = {
  verses: Verse[]
  /** The Douay-Rheims stands in for a chapter the edition could not give. */
  fallback?: boolean
  /** The edition the verses are from: the one asked for, the one completing it, or the Douay-Rheims. */
  edition: string
}

// A chapter read from its publisher is kept in `external_content`, so it is
// fetched once and reads offline afterwards. It is kept parsed: a change to a
// publisher's parser bumps the version, or the old parse stays.
async function getWebChapter(translation: string, bookId: string, chapter: number) {
  const key = {
    producerId: `bible/${translation}`,
    producerVersion: '2',
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
    return { verses: await getCorpusChapter('drb', bookId, chapter), edition: 'DRB' }
  }

  // Offline, a publisher's site changed, or a chapter this translation numbers
  // differently: the Douay-Rheims stands in, and `fallback` tells the reader so.
  try {
    const edition = await servingEdition(translation, bookId)
    return { verses: await getTranslationChapter(edition, bookId, chapter), edition }
  } catch (cause) {
    try {
      const verses = await getCorpusChapter('drb', bookId, chapter)
      return { verses, fallback: true, edition: 'DRB' }
    } catch {
      throw new Error(`Failed to fetch ${translation}/${bookId}/${chapter}`, { cause })
    }
  }
}
