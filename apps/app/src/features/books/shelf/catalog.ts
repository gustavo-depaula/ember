import type { CatalogEntry } from '@/content/manifestTypes'
import { coverFor, type TileCover } from '@/features/covers'

/** A book as the Books screen lists it, from its catalog hint alone. */
export type ShelfBook = {
  id: string
  bareId: string
  title: string
  author?: string
  authorRef?: string
  cover?: TileCover
  langs: string[]
  /** Minutes to read it in the first language it reads in, by the reader's preference. */
  minutes?: number
  arrived: Record<string, string>
  commentsOn: string[]
}

export type ShelfAuthor = {
  id: string
  name: string
  century?: number
  saint?: string
  books: ShelfBook[]
}

export type Localize = (text: Record<string, string>) => string

/** The reader's language first, then the other app language, then Latin, then any other. */
export function languagePreference(lang: string): string[] {
  return lang === 'pt-BR' ? ['pt-BR', 'en-US', 'la'] : ['en-US', 'pt-BR', 'la']
}

function preferred<T>(byLang: Record<string, T> | undefined, lang: string): T | undefined {
  if (!byLang) return undefined
  for (const l of languagePreference(lang)) if (byLang[l] !== undefined) return byLang[l]
  return Object.values(byLang)[0]
}

function bareId(corpusId: string): string {
  return corpusId.slice(corpusId.indexOf('/') + 1)
}

export function shelfBook(
  id: string,
  entry: CatalogEntry,
  lang: string,
  localize: Localize,
): ShelfBook {
  const author = entry.author ? localize(entry.author as Record<string, string>) : ''
  return {
    id,
    bareId: bareId(id),
    title: localize((entry.name ?? entry.title ?? {}) as Record<string, string>) || bareId(id),
    author: author || undefined,
    authorRef: entry.authorRef,
    cover: coverFor(entry),
    langs: entry.langs ?? [],
    minutes: preferred(entry.minutes, lang),
    arrived: entry.arrived ?? {},
    commentsOn: entry.commentsOn ?? [],
  }
}

export function shelfAuthors(
  entries: Array<[string, CatalogEntry]>,
  books: ShelfBook[],
  localize: Localize,
): ShelfAuthor[] {
  const byAuthor = new Map<string, ShelfBook[]>()
  for (const book of books) {
    if (!book.authorRef) continue
    const list = byAuthor.get(book.authorRef)
    if (list) list.push(book)
    else byAuthor.set(book.authorRef, [book])
  }
  return entries.flatMap(([id, entry]) => {
    const authorId = bareId(id)
    const authored = byAuthor.get(authorId)
    if (!authored) return []
    return [
      {
        id: authorId,
        name: localize((entry.name ?? {}) as Record<string, string>) || authorId,
        century: entry.century,
        saint: entry.saint,
        books: authored.sort(byTitle),
      },
    ]
  })
}

export function byTitle(a: ShelfBook, b: ShelfBook): number {
  return a.title.localeCompare(b.title)
}

/**
 * One line of "Recém-chegados": a book that arrived (`new`), or one that has
 * just become readable in the reader's language (`language`).
 */
export type Arrival = { date: string; kind: 'new' | 'language'; book: ShelfBook }

/** What arrived on or after `since` (YYYY-MM-DD), the latest day first. */
export function arrivals(books: ShelfBook[], lang: string, since: string): Arrival[] {
  const out: Arrival[] = []
  for (const book of books) {
    const days = Object.values(book.arrived)
    if (days.length === 0) continue
    const first = days.reduce((a, b) => (b < a ? b : a))
    if (first >= since) out.push({ date: first, kind: 'new', book })
    const own = book.arrived[lang]
    if (own && own > first && own >= since) out.push({ date: own, kind: 'language', book })
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || byTitle(a.book, b.book))
}

/** Books read in one sitting: under an hour, the shortest first. */
export function shortReads(books: ShelfBook[], under = 60): ShelfBook[] {
  return books
    .filter(
      (b): b is ShelfBook & { minutes: number } => b.minutes !== undefined && b.minutes < under,
    )
    .sort((a, b) => a.minutes - b.minutes || byTitle(a, b))
}

/** The commentaries on each Bible book, the oldest voice first. */
export function commentaries(
  books: ShelfBook[],
  centuryOf: (book: ShelfBook) => number | undefined,
): Map<string, ShelfBook[]> {
  const out = new Map<string, ShelfBook[]>()
  for (const book of books)
    for (const bibleBook of book.commentsOn) {
      const list = out.get(bibleBook)
      if (list) list.push(book)
      else out.set(bibleBook, [book])
    }
  for (const list of out.values())
    list.sort((a, b) => (centuryOf(a) ?? 99) - (centuryOf(b) ?? 99) || byTitle(a, b))
  return out
}

/**
 * The ages the library is sliced into, by the centuries their authors wrote
 * in: the first two (the Apostolic Fathers and the apologists), the third (the
 * martyrs' Church), the fourth and fifth (the great Fathers), and so on.
 */
export const ages = [
  { id: 'i-ii', from: 1, to: 2 },
  { id: 'iii', from: 3, to: 3 },
  { id: 'iv-v', from: 4, to: 5 },
  { id: 'vi-xii', from: 6, to: 12 },
  { id: 'xiii-xv', from: 13, to: 15 },
  { id: 'xvi-xviii', from: 16, to: 18 },
  { id: 'xix-xx', from: 19, to: 20 },
] as const

export type Age = (typeof ages)[number]

export function ageOf(century: number): Age | undefined {
  return ages.find((a) => century >= a.from && century <= a.to)
}

const romans: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function roman(n: number): string {
  let out = ''
  let rest = n
  for (const [value, letters] of romans)
    while (rest >= value) {
      out += letters
      rest -= value
    }
  return out
}

/** "I–II", "III", "XIX–XX": an age as its centuries. */
export function ageRange(age: Age): string {
  return age.from === age.to ? roman(age.from) : `${roman(age.from)}–${roman(age.to)}`
}
