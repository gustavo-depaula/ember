import {
  type ChantBook,
  chantSummary,
  kyrialeId,
  loadChant,
  loadChantBook,
  romanMode,
  sectionOf,
} from '@/features/chant/chants'
import { layoutScore } from '@/features/chant/layoutScore'
import { scoreSvg } from '@/features/chant/scoreSvg'
import { localizeContent } from '@/lib/i18n'
import { href, slugOf } from '~/routes'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'

// A static page cannot measure its reader's screen, so a score is set twice:
// for a desk, wider and larger than the reading column as a choir book is, and
// for a phone held upright. CSS shows one (views/ChantView.astro).
export const deskWidth = 800
const deskScale = 1.2
const phoneWidth = 340

export type ChantLink = { id: string; name: string; subtitle?: string; mode?: string; href: string }

export type KyrialeSection = {
  id: string
  title: string
  name?: string
  occasion?: string
  chants: ChantLink[]
}

export type KyrialePage = {
  title: string
  description: string
  source: string
  sections: KyrialeSection[]
}

function link(id: string, locale: Locale): ChantLink {
  const { name, subtitle, mode } = chantSummary(id)
  return { id, name, subtitle, mode: romanMode(mode), href: href.chant(locale, id) }
}

async function kyriale(): Promise<ChantBook> {
  await bootCorpus()
  const book = await loadChantBook(kyrialeId)
  if (!book) throw new Error('The Kyriale is missing from the corpus')
  return book
}

export async function loadKyriale(locale: Locale): Promise<KyrialePage> {
  const book = await kyriale()
  return withLocale(locale, () => ({
    title: localizeContent(book.name),
    description: localizeContent(book.description),
    source: book.source,
    sections: book.sections.map((section) => ({
      id: section.id,
      title: localizeContent(section.title),
      name: section.name,
      occasion: section.occasion && localizeContent(section.occasion),
      chants: section.chants.map((id) => link(id, locale)),
    })),
  }))
}

export type ChantPage = {
  id: string
  name: string
  subtitle?: string
  mode?: string
  commentary?: string
  book?: string
  transcriber?: string
  /** The section the chant is read in, and its neighbours there. */
  section?: { title: string; name?: string; href: string }
  previous?: ChantLink
  next?: ChantLink
  /** The score as SVG markup, set for the column and for a phone. */
  wide: string
  narrow: string
}

export async function loadChantPage(id: string, locale: Locale): Promise<ChantPage> {
  const book = await kyriale()
  const chant = await loadChant(id)
  if (!chant) throw new Error(`No chant ${id}`)
  const section = sectionOf(book, id)
  const at = section ? section.chants.indexOf(id) : -1
  const slug = slugOf(id)
  return withLocale(locale, () => ({
    id,
    name: chant.name,
    subtitle: chant.subtitle,
    mode: romanMode(chant.mode),
    commentary: chant.commentary,
    book: chant.book,
    transcriber: chant.transcriber,
    section: section && {
      title: localizeContent(section.title),
      name: section.name,
      href: `${href.section(locale, 'chant')}#${section.id}`,
    },
    previous: section && at > 0 ? link(section.chants[at - 1], locale) : undefined,
    next:
      section && at < section.chants.length - 1 ? link(section.chants[at + 1], locale) : undefined,
    wide: scoreSvg(layoutScore(chant.score, { width: deskWidth, scale: deskScale }), {
      idPrefix: `${slug}-w-`,
      label: chant.name,
    }),
    narrow: scoreSvg(layoutScore(chant.score, { width: phoneWidth }), {
      idPrefix: `${slug}-n-`,
      label: chant.name,
    }),
  }))
}

/** The opening staff of a chant, for a tile: decoration, so it carries no label. */
export async function loadIncipit(id: string, width: number, scale: number): Promise<string> {
  await bootCorpus()
  const chant = await loadChant(id)
  if (!chant) throw new Error(`No chant ${id}`)
  const layout = layoutScore(chant.score, { width, scale })
  return scoreSvg({ ...layout, lines: layout.lines.slice(0, 1) }, { idPrefix: `${slugOf(id)}-i-` })
}
