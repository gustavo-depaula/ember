import type { ShelfBook } from './catalog'

type Localized = Record<string, string>

/**
 * An author's reading guide, as `content/authors/<id>.json` writes it: titled
 * sections of works in the order to read them, each with a line on why. A
 * book naming no work is its own work, under its book id. The corpus build
 * checks that a guide names every work of its author once.
 */
export type AuthorGuide = {
  title: Localized
  note?: Localized
  works: { work: string; why?: Localized }[]
}[]

export type GuideEntry = { book: ShelfBook; why?: string }
export type GuideSection = { title: string; note?: string; entries: GuideEntry[] }

/**
 * The guide with each work resolved to the edition the shelf lists for it.
 * A work the catalog doesn't have is skipped, and a book the guide doesn't
 * name lands in a last section, so a guide and a catalog built apart still
 * show every book.
 */
export function resolveGuide(
  guide: AuthorGuide,
  books: ShelfBook[],
  localize: (text: Localized) => string,
  otherWorks: string,
): GuideSection[] {
  const byWork = new Map(books.map((b) => [b.work, b]))
  const named = new Set<string>()
  const sections: GuideSection[] = guide.map((section) => ({
    title: localize(section.title),
    note: section.note ? localize(section.note) : undefined,
    entries: section.works.flatMap(({ work, why }) => {
      named.add(work)
      const book = byWork.get(work)
      return book ? [{ book, why: why ? localize(why) : undefined }] : []
    }),
  }))
  const rest = books.filter((b) => !named.has(b.work)).map((book) => ({ book }))
  if (rest.length > 0) sections.push({ title: otherWorks, note: undefined, entries: rest })
  return sections.filter((s) => s.entries.length > 0)
}
