import { findTranslation } from '@/lib/bibleTranslations'
import { getChapter, servingEdition } from '@/lib/content'
import { fetchHearth } from '@/lib/hearth'

/**
 * A verse as the app addresses it. Everything that points into the Bible (the
 * lectionary, the commentaries, the Summa, the Catechism, the popes' talks)
 * names a verse by the Douay slug and the Clementine Vulgate's chapter and
 * verse: the shared address. An edition numbered otherwise (the Septuagint's
 * Jeremiah, the Byzantine text's Romans 14) keeps its own numbering in its
 * files, with a table of the verses whose shared address differs.
 */
export type Address = { bookId: string; chapter: number; verse: number }

/** Per book, `"chapter:verse"` in the edition → its shared address, or null where the Vulgate has none. */
export type VerseMap = Record<string, Record<string, string | null>>

export type Versification = {
  /** The shared address of an edition's verse; undefined where the Vulgate has no counterpart. */
  toShared: (place: Address) => Address | undefined
  /** The edition's verse at a shared address; undefined where the edition has none. */
  fromShared: (place: Address) => Address | undefined
}

const key = (chapter: number, verse: number) => `${chapter}:${verse}`

function parse(bookId: string, at: string): Address {
  const [chapter, verse] = at.split(':').map(Number)
  return { bookId, chapter, verse }
}

export function buildVersification(map: VerseMap): Versification {
  // The way back: a shared verse two of the edition's verses fold into opens
  // at the first of them.
  const inverse = new Map<string, Map<string, string>>()
  for (const [bookId, verses] of Object.entries(map)) {
    const back = new Map<string, string>()
    for (const [own, shared] of Object.entries(verses)) {
      if (shared !== null && !back.has(shared)) back.set(shared, own)
    }
    inverse.set(bookId, back)
  }

  return {
    toShared(place) {
      const own = map[place.bookId]?.[key(place.chapter, place.verse)]
      if (own === undefined) return place
      return own === null ? undefined : parse(place.bookId, own)
    },
    fromShared(place) {
      const at = key(place.chapter, place.verse)
      const own = inverse.get(place.bookId)?.get(at)
      if (own) return parse(place.bookId, own)
      // The edition's own verse of that number is some other verse: nothing
      // of the edition stands at this shared address.
      if (map[place.bookId]?.[at] !== undefined) return undefined
      return place
    },
  }
}

const identity: Versification = {
  toShared: (place) => place,
  fromShared: (place) => place,
}

const loaded = new Map<string, Promise<Versification>>()

/** How an edition's verses map onto the shared address; the identity for one numbered as the Vulgate. */
export function getVersification(translation: string): Promise<Versification> {
  const edition = findTranslation(translation)
  if (!edition?.corpus || !edition.versification) return Promise.resolve(identity)
  const cached = loaded.get(edition.corpus)
  if (cached) return cached
  const promise = fetchHearth<VerseMap>(`bible/${edition.corpus}/versification.json`).then(
    buildVersification,
  )
  // A failed read is not kept, so the next asks again.
  promise.catch(() => loaded.delete(edition.corpus as string))
  loaded.set(edition.corpus, promise)
  return promise
}

/** The versification of the edition a translation reads a book from (see `servingEdition`). */
export async function getVersificationAt(translation: string, bookId: string) {
  return getVersification(await servingEdition(translation, bookId))
}

/**
 * Where a reader at an edition's chapter lands in another edition: the
 * chapter's opening carried across the two tables, and the same chapter where
 * none of its first verses has a counterpart.
 */
export async function carryPlace(
  from: string,
  to: string,
  bookId: string,
  chapter: number,
): Promise<{ bookId: string; chapter: number }> {
  if (from === to) return { bookId, chapter }
  // The chapter's own first verses, not 1 to 5: Brenton's Jeremiah 32 opens
  // at verse 15. One only one edition has (a Greek addition) is passed over.
  const page = await getChapter(from, bookId, chapter)
  const [source, target] = await Promise.all([
    getVersification(page.edition),
    getVersificationAt(to, bookId),
  ])
  for (const { verse } of page.verses.slice(0, 5)) {
    const shared = source.toShared({ bookId, chapter, verse })
    const own = shared && target.fromShared(shared)
    if (own) return { bookId: own.bookId, chapter: own.chapter }
  }
  return { bookId, chapter }
}

/**
 * Where an edition put a chapter it has no page for: the Septuagint prints the
 * Vulgate's Proverbs 30 inside its chapter 24. The first verse of the shared
 * chapter that the edition places in another chapter, or undefined.
 */
export function whereChapterWent(
  versification: Versification,
  bookId: string,
  chapter: number,
): Address | undefined {
  // A shared chapter runs to 176 verses at most (Psalm 118).
  for (let verse = 1; verse <= 176; verse++) {
    const own = versification.fromShared({ bookId, chapter, verse })
    if (own && own.chapter !== chapter) return own
  }
  return undefined
}
