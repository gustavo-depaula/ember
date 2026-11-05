// Chant in the corpus: a score is one GABC file (`chant/<id>`), a book
// (`chant-book/<id>`) puts scores in order under its sections.

import { getEntriesByKind, getEntry } from '@/content/contentIndex'
import { getJson, getText } from '@/content/store'
import type { LocalizedText } from '@/content/types'
import { localizeContent } from '@/lib/i18n'
import { parseGabc } from './gabc'
import type { ChantGenre } from './textKey'

export type ChantBookSection = {
  id: string
  title: LocalizedText
  /** The Latin name a Mass of the Kyriale goes by: "De Angelis". */
  name?: string
  occasion?: LocalizedText
  /** `chant/<id>` refs, in the book's order. */
  chants: string[]
  /** The book's group it is printed under: a season, a month, the Commons. */
  group?: string
  /** A saint's day, `MM-DD`. */
  date?: string
  /** A rubric printed before the chant at `at`: an hour of the Office, "Tempore Paschali". */
  heads?: { at: number; title: LocalizedText }[]
}

/** A division of a book that names its groups: the Proper of Time, the Proper of the Saints. */
export type ChantBookPart = { id: string; title: LocalizedText }

/** A season, a month, the Commons: what the thumb index jumps to, by its `short` tab. */
export type ChantBookGroup = { id: string; part: string; title: LocalizedText; short: string }

export type ChantBook = {
  id: string
  name: LocalizedText
  description: LocalizedText
  source: string
  /**
   * How the book's table reads. By default a section is a unit sung through —
   * a Mass of the Kyriale — and the table lists sections; with `chants`, a
   * section is a shelf and the table lists every chant under it.
   */
  list?: 'chants'
  parts?: ChantBookPart[]
  groups?: ChantBookGroup[]
  sections: ChantBookSection[]
}

export type Chant = {
  id: string
  name: string
  subtitle?: string
  mode?: string
  /** The book's note under the title — in the Kyriale, the chant's century. */
  commentary?: string
  /** Where the transcription was read from: book, year and page. */
  book?: string
  transcriber?: string
  score: string
}

// The shelf's order: the books of the Mass and the Office, then the Ordinary, then the prayers.
const shelf = ['graduale', 'antiphonale', 'kyriale', 'cantus'].map((id) => `chant-book/${id}`)

function shelfRank(id: string): number {
  const at = shelf.indexOf(id)
  return at < 0 ? shelf.length : at
}

/** The chant books in the corpus, as the catalog names them, in the shelf's order. */
export function chantBookEntries(): {
  id: string
  name: LocalizedText
  description: LocalizedText
  count: number
}[] {
  return getEntriesByKind('chant-book')
    .sort(([a], [b]) => shelfRank(a) - shelfRank(b) || a.localeCompare(b))
    .map(([id, entry]) => ({
      id,
      name: entry.name as LocalizedText,
      description: entry.description as LocalizedText,
      count: entry.itemCount ?? 0,
    }))
}

export async function loadChantBook(id: string): Promise<ChantBook | undefined> {
  const entry = getEntry(id)
  if (entry?.kind !== 'chant-book') return undefined
  return getJson<ChantBook>(entry.hash)
}

/** Every chant book in the corpus, in the shelf's order. */
export async function loadChantBooks(): Promise<ChantBook[]> {
  const books = await Promise.all(chantBookEntries().map(({ id }) => loadChantBook(id)))
  return books.filter((book) => book !== undefined)
}

export async function loadChant(id: string): Promise<Chant | undefined> {
  const entry = getEntry(id)
  if (entry?.kind !== 'chant') return undefined
  const { headers, score } = parseGabc(await getText(entry.hash))
  return {
    id,
    name: headers.name ?? id,
    subtitle: headers.subtitle,
    mode: headers.mode,
    commentary: headers.commentary,
    book: headers.book,
    transcriber: headers.transcriber,
    score,
  }
}

/** What a list shows of a chant, from the catalog alone. */
export function chantSummary(id: string): {
  name: string
  subtitle?: string
  mode?: string
  genre?: ChantGenre
} {
  const entry = getEntry(id)
  return {
    // Latin only, which is where `localizeContent` lands when a text has neither app language.
    name: entry?.name ? localizeContent(entry.name) : id,
    subtitle: entry?.subtitle && localizeContent(entry.subtitle),
    mode: entry?.mode,
    genre: entry?.genre as ChantGenre | undefined,
  }
}

const romanModes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

/** A mode as chant books print it: `5` → `V`. A tonus named otherwise stays as written. */
export function romanMode(mode: string | undefined): string | undefined {
  if (!mode) return undefined
  return romanModes[Number(mode) - 1] ?? mode
}

/**
 * The section a chant is read in, and its book: the section asked for if it
 * holds the chant, else the first that does.
 */
export function sectionOf(
  books: ChantBook[],
  chantId: string,
  preferred?: string,
): { book: ChantBook; section: ChantBookSection } | undefined {
  const holding = books.flatMap((book) =>
    book.sections.filter((s) => s.chants.includes(chantId)).map((section) => ({ book, section })),
  )
  return holding.find(({ section }) => section.id === preferred) ?? holding[0]
}
