import drbIndex from '@/assets/bible/drb/index.json'
import type { BollsBook } from './bolls'
import { fetchBooks, fetchChapter } from './bolls'

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

// Map of slug -> require() for bundled DRB books
// Loaded lazily to avoid bundling all 73 books at startup
const drbModules: Record<string, () => Record<string, Record<string, string>>> = {
  genesis: () => require('@/assets/bible/drb/genesis.json'),
  exodus: () => require('@/assets/bible/drb/exodus.json'),
  leviticus: () => require('@/assets/bible/drb/leviticus.json'),
  numbers: () => require('@/assets/bible/drb/numbers.json'),
  deuteronomy: () => require('@/assets/bible/drb/deuteronomy.json'),
  josue: () => require('@/assets/bible/drb/josue.json'),
  judges: () => require('@/assets/bible/drb/judges.json'),
  ruth: () => require('@/assets/bible/drb/ruth.json'),
  '1-kings': () => require('@/assets/bible/drb/1-kings.json'),
  '2-kings': () => require('@/assets/bible/drb/2-kings.json'),
  '3-kings': () => require('@/assets/bible/drb/3-kings.json'),
  '4-kings': () => require('@/assets/bible/drb/4-kings.json'),
  '1-paralipomenon': () => require('@/assets/bible/drb/1-paralipomenon.json'),
  '2-paralipomenon': () => require('@/assets/bible/drb/2-paralipomenon.json'),
  '1-esdras': () => require('@/assets/bible/drb/1-esdras.json'),
  '2-esdras': () => require('@/assets/bible/drb/2-esdras.json'),
  tobias: () => require('@/assets/bible/drb/tobias.json'),
  judith: () => require('@/assets/bible/drb/judith.json'),
  esther: () => require('@/assets/bible/drb/esther.json'),
  job: () => require('@/assets/bible/drb/job.json'),
  psalms: () => require('@/assets/bible/drb/psalms.json'),
  proverbs: () => require('@/assets/bible/drb/proverbs.json'),
  ecclesiastes: () => require('@/assets/bible/drb/ecclesiastes.json'),
  canticles: () => require('@/assets/bible/drb/canticles.json'),
  wisdom: () => require('@/assets/bible/drb/wisdom.json'),
  ecclesiasticus: () => require('@/assets/bible/drb/ecclesiasticus.json'),
  isaias: () => require('@/assets/bible/drb/isaias.json'),
  jeremias: () => require('@/assets/bible/drb/jeremias.json'),
  lamentations: () => require('@/assets/bible/drb/lamentations.json'),
  baruch: () => require('@/assets/bible/drb/baruch.json'),
  ezechiel: () => require('@/assets/bible/drb/ezechiel.json'),
  daniel: () => require('@/assets/bible/drb/daniel.json'),
  osee: () => require('@/assets/bible/drb/osee.json'),
  joel: () => require('@/assets/bible/drb/joel.json'),
  amos: () => require('@/assets/bible/drb/amos.json'),
  abdias: () => require('@/assets/bible/drb/abdias.json'),
  jonas: () => require('@/assets/bible/drb/jonas.json'),
  micheas: () => require('@/assets/bible/drb/micheas.json'),
  nahum: () => require('@/assets/bible/drb/nahum.json'),
  habacuc: () => require('@/assets/bible/drb/habacuc.json'),
  sophonias: () => require('@/assets/bible/drb/sophonias.json'),
  aggeus: () => require('@/assets/bible/drb/aggeus.json'),
  zacharias: () => require('@/assets/bible/drb/zacharias.json'),
  malachias: () => require('@/assets/bible/drb/malachias.json'),
  '1-machabees': () => require('@/assets/bible/drb/1-machabees.json'),
  '2-machabees': () => require('@/assets/bible/drb/2-machabees.json'),
  matthew: () => require('@/assets/bible/drb/matthew.json'),
  mark: () => require('@/assets/bible/drb/mark.json'),
  luke: () => require('@/assets/bible/drb/luke.json'),
  john: () => require('@/assets/bible/drb/john.json'),
  acts: () => require('@/assets/bible/drb/acts.json'),
  romans: () => require('@/assets/bible/drb/romans.json'),
  '1-corinthians': () => require('@/assets/bible/drb/1-corinthians.json'),
  '2-corinthians': () => require('@/assets/bible/drb/2-corinthians.json'),
  galatians: () => require('@/assets/bible/drb/galatians.json'),
  ephesians: () => require('@/assets/bible/drb/ephesians.json'),
  philippians: () => require('@/assets/bible/drb/philippians.json'),
  colossians: () => require('@/assets/bible/drb/colossians.json'),
  '1-thessalonians': () => require('@/assets/bible/drb/1-thessalonians.json'),
  '2-thessalonians': () => require('@/assets/bible/drb/2-thessalonians.json'),
  '1-timothy': () => require('@/assets/bible/drb/1-timothy.json'),
  '2-timothy': () => require('@/assets/bible/drb/2-timothy.json'),
  titus: () => require('@/assets/bible/drb/titus.json'),
  philemon: () => require('@/assets/bible/drb/philemon.json'),
  hebrews: () => require('@/assets/bible/drb/hebrews.json'),
  james: () => require('@/assets/bible/drb/james.json'),
  '1-peter': () => require('@/assets/bible/drb/1-peter.json'),
  '2-peter': () => require('@/assets/bible/drb/2-peter.json'),
  '1-john': () => require('@/assets/bible/drb/1-john.json'),
  '2-john': () => require('@/assets/bible/drb/2-john.json'),
  '3-john': () => require('@/assets/bible/drb/3-john.json'),
  jude: () => require('@/assets/bible/drb/jude.json'),
  apocalypse: () => require('@/assets/bible/drb/apocalypse.json'),
}

function getDrbChapter(bookSlug: string, chapter: number): Verse[] {
  const loader = drbModules[bookSlug]
  if (!loader) throw new Error(`Unknown DRB book: ${bookSlug}`)

  const bookData = loader()
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

export function getDrbBooks(): Book[] {
  if (!drbBooksCache) {
    drbBooksCache = (
      drbIndex as Array<{ slug: string; name: string; testament: string; chapters: number }>
    ).map((b) => ({
      id: b.slug,
      name: b.name,
      chapters: b.chapters,
      testament: b.testament as 'ot' | 'nt',
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

export async function getChapter(
  translation: string,
  bookId: string,
  chapter: number,
): Promise<ChapterResult> {
  if (translation === 'DRB') {
    return { verses: getDrbChapter(bookId, chapter) }
  }

  try {
    const verses = await fetchChapter(translation, Number.parseInt(bookId, 10), chapter)
    return {
      verses: verses.map((v) => ({ verse: v.verse, text: v.text })),
    }
  } catch {
    // Fallback to DRB if online fetch fails
    // Try to find the DRB equivalent book by matching position
    const drbBooks = getDrbBooks()
    const onlineBooks = bollsBookCache.get(translation)
    const onlineBook = onlineBooks?.find((b) => String(b.bookid) === bookId)

    if (onlineBook) {
      const drbMatch = drbBooks.find((b) => b.name.toLowerCase() === onlineBook.name.toLowerCase())
      if (drbMatch) {
        return { verses: getDrbChapter(drbMatch.id, chapter), fallback: true }
      }
    }

    throw new Error(`Failed to fetch ${translation}/${bookId}/${chapter} and no DRB fallback found`)
  }
}
