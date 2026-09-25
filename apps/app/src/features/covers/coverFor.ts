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

// FNV-1a, not the tone's char-sum: with 8 tones and 8 formats a shared hash
// would pin every format to one color.
function formatIndexForId(id: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) % bookCoverFormats.length
}

/** The manifest's `cover` when it names a known format, else a stable pick from the id. */
export function bookCoverFormat(id: string, cover: string | undefined): BookCoverFormat {
  const named = bookCoverFormats.find((f) => f === cover)
  return named ?? bookCoverFormats[formatIndexForId(id)]
}

export function coverFor(id: string, entry: CatalogEntry): TileCover | undefined {
  if (entry.kind === 'book')
    return {
      kind: 'book',
      format: bookCoverFormat(id, entry.cover),
      author: entry.author ? localizeContent(entry.author) : undefined,
    }
  if (entry.kind !== 'practice' && entry.kind !== 'mass') return undefined
  if (entry.form !== 'prayer')
    return { kind: 'practice', icon: entry.icon, minutes: entry.estimatedMinutes }
  if (entry.liturgical) return { kind: 'breviary' }
  return { kind: 'prayer', icon: entry.icon }
}
