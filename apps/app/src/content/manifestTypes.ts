/**
 * Hearth v2 catalog & item-manifest shapes.
 *
 * The catalog at `/hearth/v2/catalog.json` is the master index. Every item has
 * a stable global id (e.g. `practice/our-father`, `practice/rosary`, `mass/of/...`)
 * and a content hash for its manifest blob. Manifests in turn reference the
 * actual content blobs by hash. All blobs live at `/hearth/v2/blobs/{ab}/{cd}/{hash}`.
 */

import type { Tier } from '@/db/schema'
import type { Schedule } from '@/features/plan-of-life/schedule'
import type { FlowDefinition, LocalizedText } from './types'

export type CatalogItemKind =
  | 'practice'
  | 'chapter'
  | 'book'
  | 'mass'
  | 'of-ordinary'
  | 'of-preface'
  | 'of-eucharistic-prayer'
  | 'of-data'
  | 'do-data'
  | 'collection'
  | 'plan-of-life-template'
  | 'checkup'
  | 'creator'

export type CreatorRole = 'priest' | 'religious' | 'lay-theologian' | 'bishop' | 'deacon'
export type CreatorLanguage = 'en-US' | 'pt-BR' | 'la'
export type CreatorCharism =
  | 'diocesan'
  | 'dominican'
  | 'franciscan'
  | 'jesuit'
  | 'carmelite'
  | 'opus-dei'
  | 'monastic'
  | 'lay'

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
  // Creator-kind hints (populated by build_creators in scripts/build-corpus.py).
  creatorRole?: CreatorRole
  creatorLanguages?: CreatorLanguage[]
  hasQa?: boolean
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

export type LocalizedMessagePool = {
  'en-US'?: string | string[]
  'pt-BR'?: string | string[]
}

export type NotificationsManifest = {
  defaultReminders?: { offset: number }[]
  messages?: LocalizedMessagePool
}

export type ProgramConfig = {
  totalDays: number
  perDayFlows?: string
  progressPolicy: 'continue' | 'wait' | 'restart'
  completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
  restartThreshold?: number
}

export type PracticeManifest = {
  id: string
  name: LocalizedText
  subtitle?: LocalizedText
  source?: LocalizedText
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
  notifications?: NotificationsManifest
  /** Inline flow — alternative to a separate flow.json hashed into flowHash. */
  flow?: FlowDefinition
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
  /** Overrides the depth-inferred reading role (part for top-level groups,
   *  section for nested groups, chapter for leaves). The role styles the body's
   *  promoted title — see flattenReadingFlow / promoteFirstHeading. */
  role?: 'part' | 'section' | 'chapter'
  /** Range of point numbers in this chapter, shown in the TOC for books of
   *  numbered maxims (e.g. Escrivá's The Way → "1–46"). */
  pointRange?: { from: number; to: number }
}

// Bundled chapters point at a content-addressed blob in Hearth; external-book
// chapters defer fetching to the referenced producer at runtime. Discriminate
// on `'url' in ref` — bundled refs keep their existing shape unchanged.
export type ChapterRef = (BlobRef & { format?: 'html' }) | { type: 'external'; url: string }

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
  chapters: Record<string, Record<string, ChapterRef>>
  images?: { rel: string; hash: string; size: number; mime: string }[]
  // External books fetch chapters from a third-party site at runtime via a
  // named producer. Presence flips the runtime loader path.
  source?: { type: 'external'; producer: string; homepage: string }
  // Anchor → chapter index. Lets `book/<id>#<anchor>` resolve directly to a
  // chapter without scanning. Producers can compute this implicitly when URL
  // structure encodes anchors; bundled books emit it from heading ids.
  anchors?: Record<string, { chapter: string }>
  // Stemmed inverted index per language, fetched on first in-book search.
  // See scripts/build-corpus.py:build_search_index_for_book for the shape.
  searchIndex?: Record<string, BlobRef>
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

// Divinum Officium dataset index (see docs/features/divinum-officium.md).
// `files` maps a DO file id ('01-25', 'Psalmi/Psalmi major', 'Kalendaria/1960')
// to per-language blob refs, or directly to a blob ref for the
// language-independent datasets (ordinarium, tabulae). The meta item has neither.
export type DoDataItemManifest = {
  id: string
  doCommit: string
} & (
  | { localized: true; files: Record<string, Record<string, BlobRef>> }
  | { localized: false; files: Record<string, BlobRef> }
  | { localized?: undefined; files?: undefined }
)

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

export type CollectionTodo = {
  title: LocalizedText
  notes?: LocalizedText
  proposedKind?: 'practice' | 'chapter' | 'book'
  proposedRef?: string
  priority?: 'high' | 'medium' | 'low'
}

export type CollectionBlock =
  | ({ kind: 'item' } & CollectionItem)
  | ({ kind: 'section' } & CollectionSection)
  | { kind: 'prose'; body: CollectionProseBody }
  | ({ kind: 'todo' } & CollectionTodo)

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

// --- Plan of Life Templates ---
//
// A plan-of-life template is a starter pack for a rule of life: a set of
// practice refs with their default tier / schedule / time-block, plus a
// manifesto framing the school of holiness it embodies. Adopting a template
// is non-destructive cherry-pick — each checked practice becomes a slot.

/** A real corpus practice the template pins into the rule. */
export type PlanOfLifeTemplatePracticeRef = {
  ref: string
  tier: Tier
  schedule: Schedule
  time?: string
  enabled?: boolean
  /** One sentence on this practice's role in *this* rule — the why/what. */
  note?: LocalizedText
}

/**
 * A practice the tradition genuinely prescribes that the corpus does not host
 * yet (e.g. Lectio Divina, the Franciscan Crown, a praesidium meeting). Shown in
 * the rule for fidelity but NOT adoptable — a content placeholder, never
 * approximated by substituting a different real practice.
 */
export type PlanOfLifeTemplatePlaceholder = {
  placeholder: true
  name: LocalizedText
  tier?: Tier
  /** Human cadence string, since a placeholder carries no Schedule. */
  cadence?: LocalizedText
  /** Optional one-line gloss of what it is. */
  note?: LocalizedText
  icon?: string
}

export type PlanOfLifeTemplatePractice =
  | PlanOfLifeTemplatePracticeRef
  | PlanOfLifeTemplatePlaceholder

/** Narrow a proposed practice to its placeholder form. */
export function isTemplatePlaceholder(
  p: PlanOfLifeTemplatePractice,
): p is PlanOfLifeTemplatePlaceholder {
  return 'placeholder' in p && p.placeholder === true
}

export type PlanOfLifeTemplateResolution = {
  title: LocalizedText
  text: LocalizedText
}

export type PlanOfLifeTemplateManifest = {
  id: string
  name: LocalizedText
  /** Short blurb for browse/list rendering. */
  description: LocalizedText
  /** 1–3 paragraphs: what this rule is and who it's for. */
  manifesto: LocalizedText
  attribution?: LocalizedText
  /** Provenance — primary URLs/works the rule of life is drawn from. Markdown links allowed. */
  source?: LocalizedText
  icon?: string
  tags?: string[]
  practices: PlanOfLifeTemplatePractice[]
  resolutions?: PlanOfLifeTemplateResolution[]
  /** Collection refs (e.g. `collection/carmelite`) to pre-pin alongside the plan. */
  collections?: string[]
}

// --- Creators ---

export type CreatorChannelKind = 'podcast' | 'youtube' | 'rss'
export type CreatorChannelFormat = 'qa' | 'homily' | 'lecture' | 'reflection' | 'news' | 'mixed'

export type CreatorChannel = {
  kind: CreatorChannelKind
  feedUrl?: string
  channelId?: string
  title?: LocalizedText
  format?: CreatorChannelFormat
  /** When true, the article reader renders feed HTML in-app (allowlist). */
  fullText?: boolean
}

export type CreatorManifest = {
  id: string
  name: LocalizedText
  byline?: LocalizedText
  bio: LocalizedText
  avatarHash?: BlobRef
  bannerHash?: BlobRef
  languages: CreatorLanguage[]
  charism?: CreatorCharism
  role?: CreatorRole
  channels: CreatorChannel[]
  links?: { website?: string; donate?: string }
  tags?: string[]
}
