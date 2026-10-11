// Chant in the corpus: a score is one GABC file (`chant/<id>`), a book
// (`chant-book/<id>`) puts scores in order under its sections.

import { getEntry } from '@/content/contentIndex'
import { getJson, getText } from '@/content/store'
import type { LocalizedText } from '@/content/types'
import { localizeContent } from '@/lib/i18n'
import { parseGabc } from './gabc'

export type ChantBookSection = {
  id: string
  title: LocalizedText
  /** The Latin name a Mass of the Kyriale goes by: "De Angelis". */
  name?: string
  occasion?: LocalizedText
  /** `chant/<id>` refs, in the book's order. */
  chants: string[]
}

export type ChantBook = {
  id: string
  name: LocalizedText
  description: LocalizedText
  source: string
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

export const kyrialeId = 'chant-book/kyriale'

export async function loadChantBook(id: string): Promise<ChantBook | undefined> {
  const entry = getEntry(id)
  return entry?.kind === 'chant-book' ? getJson<ChantBook>(entry.hash) : undefined
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
export function chantSummary(id: string): { name: string; subtitle?: string; mode?: string } {
  const entry = getEntry(id)
  return {
    // Latin only, which is where `localizeContent` lands when a text has neither app language.
    name: entry?.name ? localizeContent(entry.name) : id,
    subtitle: entry?.subtitle && localizeContent(entry.subtitle),
    mode: entry?.mode,
  }
}

const romanModes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

/** A mode as chant books print it: `5` → `V`. A tonus named otherwise stays as written. */
export function romanMode(mode: string | undefined): string | undefined {
  if (!mode) return undefined
  return romanModes[Number(mode) - 1] ?? mode
}

/** The section a chant is read in: the one asked for if it holds the chant, else the first that does. */
export function sectionOf(
  book: ChantBook,
  chantId: string,
  preferred?: string,
): ChantBookSection | undefined {
  const holding = book.sections.filter((s) => s.chants.includes(chantId))
  return holding.find((s) => s.id === preferred) ?? holding[0]
}
