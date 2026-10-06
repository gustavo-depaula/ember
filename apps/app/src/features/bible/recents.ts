// "Where you left off": the last few books read, each at its last chapter.
// Plain data and pure functions, so the drawer and the store share one rule.

export type BiblePlace = {
  bookId: string
  chapter: number
  /** Unix ms of the last reading there. */
  updatedAt: number
  /** Which ribbon marks it. A place keeps its ribbon for as long as it is listed. */
  ribbon: number
}

export const placesLimit = 3

type CanonBook = { id: string; chapters: number }

// Reading on past a book's end is the same thread, not a new one: the place
// that stood at the last chapter of the book before (or, reading backwards, at
// the first chapter of the book after) is the one that moves.
function continuedPlace(
  places: BiblePlace[],
  books: CanonBook[],
  bookId: string,
  chapter: number,
): BiblePlace | undefined {
  const index = books.findIndex((b) => b.id === bookId)
  const book = books[index]
  if (!book) return undefined
  const before = books[index - 1]
  const after = books[index + 1]
  if (chapter === 1 && before) {
    const place = places.find((p) => p.bookId === before.id && p.chapter === before.chapters)
    if (place) return place
  }
  if (chapter === book.chapters && after) {
    return places.find((p) => p.bookId === after.id && p.chapter === 1)
  }
  return undefined
}

/** The places after reading `bookId` `chapter` at `now`, most recent first. */
export function recordPlace(
  places: BiblePlace[],
  books: CanonBook[],
  bookId: string,
  chapter: number,
  now: number,
): BiblePlace[] {
  const moved =
    places.find((p) => p.bookId === bookId) ?? continuedPlace(places, books, bookId, chapter)
  const others = places
    .filter((p) => p !== moved)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, moved ? placesLimit : placesLimit - 1)
  const taken = new Set(others.map((p) => p.ribbon))
  const freeRibbon = Array.from({ length: placesLimit }, (_, i) => i).find((i) => !taken.has(i))
  return [{ bookId, chapter, updatedAt: now, ribbon: moved?.ribbon ?? freeRibbon ?? 0 }, ...others]
}
