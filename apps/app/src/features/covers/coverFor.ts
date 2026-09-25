import type { CatalogEntry } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

export const bookCoverFormats = [
  'classic',
  'gilt',
  'label',
  'quarter',
  'arch',
  'watermark',
  'banded',
  'missal',
] as const

export type BookCoverFormat = (typeof bookCoverFormats)[number]

export const collectionCoverStyles = ['packet', 'boxed', 'slipcase', 'ordo'] as const

export type CollectionCoverStyle = (typeof collectionCoverStyles)[number]

/**
 * What an art-less tile draws: a bound volume for books; for practices a holy
 * card — printed on colored stock for a practice, cream for a prayer, and a
 * breviary page for a liturgical prayer. A collection is the object that holds
 * its kind of gathering (a boxed set of volumes, a packet of holy cards, a page
 * of the Ordo); a chapter read on its own is a printed tract.
 */
export type TileCover =
  | { kind: 'book'; format: BookCoverFormat; author?: string }
  | { kind: 'practice'; icon?: string; minutes?: number }
  | { kind: 'prayer'; icon?: string }
  | { kind: 'breviary' }
  | { kind: 'collection'; style: CollectionCoverStyle; volumes?: number; prayers?: number }
  | { kind: 'article'; subtitle?: string; minutes?: number; kicker?: string }

/** A collection you made is a packet of holy cards in the color you chose. */
export const userCollectionCover: TileCover = { kind: 'collection', style: 'packet' }

/** Tracts are portrait: height = width × this. */
export const articleAspect = 1.3

/** Below this width the ornate formats turn to noise, so every book binds as Classic. */
export const compactCoverWidth = 80

/** The manifest's `cover` when it names a known format, else Classic. */
export function bookCoverFormat(cover: string | undefined): BookCoverFormat {
  return bookCoverFormats.find((f) => f === cover) ?? 'classic'
}

/** The manifest's `cover` when it names a known style, else Packet. */
export function collectionCoverStyle(cover: string | undefined): CollectionCoverStyle {
  return collectionCoverStyles.find((s) => s === cover) ?? 'packet'
}

export function coverFor(entry: CatalogEntry): TileCover | undefined {
  if (entry.kind === 'collection')
    return {
      kind: 'collection',
      style: collectionCoverStyle(entry.cover),
      volumes: entry.itemCounts?.book,
      prayers: entry.itemCounts?.practice,
    }
  if (entry.kind === 'chapter')
    return {
      kind: 'article',
      subtitle: entry.subtitle ? localizeContent(entry.subtitle) : undefined,
      minutes: entry.estimatedMinutes,
    }
  if (entry.kind === 'book')
    return {
      kind: 'book',
      format: bookCoverFormat(entry.cover),
      author: entry.author ? localizeContent(entry.author) : undefined,
    }
  if (entry.kind !== 'practice' && entry.kind !== 'mass') return undefined
  if (entry.form !== 'prayer')
    return { kind: 'practice', icon: entry.icon, minutes: entry.estimatedMinutes }
  if (entry.liturgical) return { kind: 'breviary' }
  return { kind: 'prayer', icon: entry.icon }
}
