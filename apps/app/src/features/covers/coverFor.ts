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

/**
 * What an art-less tile draws: a bound volume for books; for practices a holy
 * card — printed on colored stock for a practice, cream for a prayer, and a
 * breviary page for a liturgical prayer.
 */
export type TileCover =
  | { kind: 'book'; format: BookCoverFormat; author?: string }
  | { kind: 'practice'; icon?: string; minutes?: number }
  | { kind: 'prayer'; icon?: string }
  | { kind: 'breviary' }

/** Below this width the ornate formats turn to noise, so every book binds as Classic. */
export const compactCoverWidth = 80

/** The manifest's `cover` when it names a known format, else Classic. */
export function bookCoverFormat(cover: string | undefined): BookCoverFormat {
  return bookCoverFormats.find((f) => f === cover) ?? 'classic'
}

export function coverFor(entry: CatalogEntry): TileCover | undefined {
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
