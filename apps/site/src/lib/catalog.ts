import { getEntriesByKind, getEntry, isMetaId } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { coverFor, type TileCover } from '@/features/covers/coverFor'
import { artFor } from '@/features/explore/artMap'
import { localizeContent } from '@/lib/i18n'
import { href, hrefForRef } from '~/routes'
import { type Locale, locales } from './locale'
import { siteStrings } from './strings'

type Localized = Record<string, string | undefined>

/** Whether the corpus carries this item in the page's own language. */
export function isLocalized(entry: CatalogEntry, locale: Locale): boolean {
  if (entry.kind === 'book') return (entry.langs ?? []).includes(locale)
  const name = (entry.name ?? entry.title) as Localized | undefined
  return !!name?.[locale]
}

export function entryTitle(entry: CatalogEntry): string {
  return localizeContent((entry.name ?? entry.title ?? {}) as Localized)
}

/**
 * The locale whose section hosts a book's chapter pages, and the language they
 * are read in. A book is read where it is written: an English-only book has no
 * Portuguese chapter pages (the Portuguese shelf links to the English ones),
 * and a book in neither site language is hosted under English in its own.
 */
export function chapterHome(
  langs: readonly string[],
  locale: Locale,
): { locale: Locale; lang: string } {
  if (langs.includes(locale)) return { locale, lang: locale }
  const other = locales.find((l) => l !== locale && langs.includes(l))
  if (other) return { locale: other, lang: other }
  return { locale: 'en-US', lang: langs[0] ?? 'en-US' }
}

export type TileData = {
  ref: string
  href: string
  title: string
  subtitle?: string
  /** A painting from the corpus' art tree, when the item has one. */
  art?: string
  cover?: TileCover
  shape: 'square' | 'book' | 'tract'
}

function countLabel(locale: Locale, counts: CatalogEntry['itemCounts']): string | undefined {
  if (!counts) return undefined
  const pt = locale === 'pt-BR'
  const parts = [
    counts.book &&
      `${counts.book} ${pt ? (counts.book === 1 ? 'livro' : 'livros') : counts.book === 1 ? 'book' : 'books'}`,
    counts.practice &&
      `${counts.practice} ${pt ? (counts.practice === 1 ? 'oração' : 'orações') : counts.practice === 1 ? 'prayer' : 'prayers'}`,
    counts.chapter &&
      `${counts.chapter} ${pt ? (counts.chapter === 1 ? 'leitura' : 'leituras') : counts.chapter === 1 ? 'reading' : 'readings'}`,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : undefined
}

/** What a shelf shows for a corpus ref. Call inside `withLocale`. */
export function tileFor(ref: string, locale: Locale): TileData | undefined {
  const id = ref.split('#')[0]
  const entry = getEntry(id)
  const [, chapter] = ref.split('#')
  // A ref into a book names a chapter, which lives where the book is read.
  const to =
    entry?.kind === 'book' && chapter
      ? href.bookChapter(chapterHome(entry.langs ?? ['en-US'], locale).locale, id, chapter)
      : hrefForRef(locale, ref)
  if (!entry || !to) return undefined
  const s = siteStrings(locale)
  const subtitle =
    entry.kind === 'book'
      ? entry.author && localizeContent(entry.author as Localized)
      : entry.kind === 'collection'
        ? countLabel(locale, entry.itemCounts)
        : entry.kind === 'chapter'
          ? entry.subtitle && localizeContent(entry.subtitle as Localized)
          : entry.estimatedMinutes
            ? s('minutes', { count: entry.estimatedMinutes })
            : undefined
  return {
    ref,
    href: to,
    title: entryTitle(entry),
    subtitle: subtitle || undefined,
    art: artFor(id)?.uri,
    cover: coverFor(entry),
    shape: entry.kind === 'book' ? 'book' : entry.kind === 'chapter' ? 'tract' : 'square',
  }
}

export function listEntries(
  kind: 'collection' | 'book' | 'chapter' | 'plan-of-life-template' | 'creator',
) {
  return getEntriesByKind(kind).filter(([id]) => !isMetaId(id))
}
