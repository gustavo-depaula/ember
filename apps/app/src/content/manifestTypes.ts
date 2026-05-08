/**
 * Hearth v2 catalog & item-manifest shapes.
 *
 * The catalog at `/hearth/v2/catalog.json` is the master index. Every item has
 * a stable global id (e.g. `prayer/our-father`, `practice/rosary`, `mass/of/...`)
 * and a content hash for its manifest blob. Manifests in turn reference the
 * actual content blobs by hash. All blobs live at `/hearth/v2/blobs/{ab}/{cd}/{hash}`.
 */

import type { Tier } from '@/db/schema'
import type { Schedule } from '@/features/plan-of-life/schedule'
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

export type AlternativeToRef = {
  id: string
  label: LocalizedText
  description: LocalizedText
}

export type SlotDefault = {
  slotId?: string
  schedule: Schedule
  tier?: Tier
  time?: string
  enabled?: boolean
}

export type ProgramConfig = {
  totalDays: number
  perDayFlows?: string
  progressPolicy: 'continue' | 'wait' | 'restart'
  completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
  restartThreshold?: number
}

export type PrayerItemManifest = {
  id: string
  title: LocalizedText
  body: unknown
  subtitle?: LocalizedText
  source?: LocalizedText
}

export type PracticeManifest = {
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
  program?: ProgramConfig
  theme?: 'office'
  alternativeTo?: AlternativeToRef
  pack?: string
  tags?: string[]
  defaults?: { sortOrder?: number; slots?: SlotDefault[] }
  flowHash?: BlobRef
  fragments?: { id: string; hash: string; size: number }[]
  dataHashes?: { name: string; hash: string; size: number }[]
  trackHashes?: { name: string; hash: string; size: number }[]
  perDay?: Record<string, BlobRef>
  images?: { rel: string; hash: string; size: number; mime: string }[]
}

export type ChapterManifest = {
  id: string
  title: LocalizedText
  subtitle?: LocalizedText
  image?: string
  estimatedMinutes?: number
  tags?: string[]
  contentHash?: BlobRef
  prose?: { file: string; lang: string; hash: string; size: number }[]
}

export type TocNode = {
  id: string
  title: LocalizedText
  children?: TocNode[]
}

export type BookEntry = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string
  languages?: string[]
  toc?: TocNode[]
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

// --- Collections ---
//
// A Collection is a structured, hierarchical index. Sections group items by
// purpose (Section → optional Sub-section → Items). The renderer caps visible
// nesting at depth 2; deeper trees are rejected at validation time.
//
// Authors may attach editorial apparatus to each item — rubric, indulgence,
// attribution, context — and weave selective prose blocks (collection prologue,
// section description, in-section prose) where it earns its keep.

export type CollectionProseBody = { body: LocalizedText }

export type CollectionItemAnnotation = {
  rubric?: LocalizedText
  indulgence?: LocalizedText
  attribution?: LocalizedText
  context?: LocalizedText
  recommendedTime?: 'morning' | 'noon' | 'evening' | 'night'
}

export type CollectionItem = {
  ref: string
  label?: LocalizedText
  annotation?: CollectionItemAnnotation
  seeAlso?: string[]
}

export type CollectionBlock =
  | ({ kind: 'item' } & CollectionItem)
  | ({ kind: 'section' } & CollectionSection)
  | { kind: 'prose'; body: CollectionProseBody }

export type CollectionSection = {
  id: string
  title: LocalizedText
  description?: CollectionProseBody
  defaultCollapsed?: boolean
  blocks: CollectionBlock[]
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
  prologue?: CollectionProseBody
  sections: CollectionSection[]
}
