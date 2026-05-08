/**
 * Hearth v2 catalog & item-manifest shapes.
 *
 * The catalog at `/hearth/v2/catalog.json` is the master index. Every item has
 * a stable global id (e.g. `prayer/our-father`, `practice/rosary`, `mass/of/...`)
 * and a content hash for its manifest blob. Manifests in turn reference the
 * actual content blobs by hash. All blobs live at `/hearth/v2/blobs/{ab}/{cd}/{hash}`.
 */

import type { LocalizedText } from './types'

export type CatalogItemKind =
  | 'prayer'
  | 'practice'
  | 'chapter'
  | 'book'
  | 'mass'
  | 'of-ordinary'
  | 'of-preface'
  | 'of-eucharistic-prayer'
  | 'of-data'
  | 'collection'
  | 'checkup'

export type CatalogEntry = {
  kind: CatalogItemKind
  hash: string
  size: number
  langs?: string[]
  // Per-kind hint metadata used for browse/list rendering without a manifest fetch.
  name?: LocalizedText
  title?: LocalizedText
  description?: LocalizedText
  tags?: string[]
  icon?: string
  category?: string
  author?: LocalizedText
  group?: string
  season?: string
  rite?: string
  rank?: string
  liturgicalColor?: string
  itemCount?: number
}

export type Catalog = {
  version: 2
  generated: string
  items: Record<string, CatalogEntry>
}

// --- Item manifests ---

export type BlobRef = { hash: string; size: number }

export type PrayerItemManifest = {
  id: string
  title: LocalizedText
  body: unknown
  subtitle?: LocalizedText
  source?: LocalizedText
}

/**
 * Practice item manifest — merged shape: original PracticeManifest body fields
 * (name, icon, description, etc.) plus resource hashes for flow/fragments/data/
 * tracks/perDay/images. Path-based fields (`flow`, `data`, `tracks`) from the
 * source manifest are dropped in favor of hash-based lookups.
 */
export type PracticeItemManifest = {
  id: string
  name: LocalizedText
  description?: LocalizedText
  history?: LocalizedText
  howToPray?: LocalizedText
  categories?: string[]
  estimatedMinutes?: number
  icon?: string
  image?: string
  thumbnail?: string
  flowMode?: 'scroll' | 'step'
  completion?: 'flow-end' | 'manual'
  program?: {
    totalDays: number
    perDayFlows?: string
    progressPolicy?: string
    completionBehavior?: string
    restartThreshold?: number
  }
  theme?: 'office'
  alternativeTo?: { id: string; label: LocalizedText; description: LocalizedText }
  pack?: string
  tags?: string[]
  defaults?: { sortOrder?: number; slots?: unknown[] }
  flowHash?: BlobRef
  fragments?: { id: string; hash: string; size: number }[]
  dataHashes?: { name: string; hash: string; size: number }[]
  trackHashes?: { name: string; hash: string; size: number }[]
  perDay?: Record<string, BlobRef>
  images?: { rel: string; hash: string; size: number; mime: string }[]
}

/** Chapter item manifest: merged metadata + content/prose hashes. */
export type ChapterItemManifest = {
  id: string
  title: LocalizedText
  subtitle?: LocalizedText
  image?: string
  estimatedMinutes?: number
  tags?: string[]
  contentHash?: BlobRef
  prose?: { file: string; lang: string; hash: string; size: number }[]
}

/** Book item manifest: merged book.json metadata + per-(chapter, lang) hashes. */
export type BookItemManifest = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string
  languages?: string[]
  toc?: unknown[]
  image?: string
  style?: BlobRef
  chapters: Record<string, Record<string, BlobRef & { format?: 'html' }>>
  images?: { rel: string; hash: string; size: number; mime: string }[]
}

export type LangSplitItemManifest = {
  id: string
  shape: BlobRef
  langs: Record<string, BlobRef>
}

export type DataItemManifest = {
  id: string
  data: BlobRef
}

export type CollectionItemManifest = {
  id: string
  version?: string
  name?: LocalizedText
  description?: LocalizedText
  languages?: string[]
  tags?: string[]
  icon?: string
  image?: string
  defaults?: { autoSeed?: boolean }
  items: { ref: string; label?: LocalizedText }[]
}
