// See docs/features/features-overview.md for the full spec

import type { PsalmRef, ReadingReference } from '@ember/liturgical'

export type ContentLanguage = 'en-US' | 'pt-BR' | 'la'

export type BilingualText = {
  primary: string
  secondary?: string
  secondaryMissing?: boolean
}

export type LocalizedText = { 'en-US'?: string; 'pt-BR'?: string }
export type LocalizedContent = { 'en-US'?: string; 'pt-BR'?: string; la?: string }

// --- Cycle Data (practice-owned static data files) ---

export type CycleData = {
  indexBy: 'day-of-month' | 'day-of-week' | 'fixed' | 'program-day'
  contextKey?: string
  entries: Record<string, unknown[]>
}

// Dynamic prose content injected at runtime (e.g., liturgical meditation text)
export type ResolvedProse = Record<string, LocalizedContent>

// --- Lectio Tracks (practice-owned reading plans) ---

export type LectioTrackDef = {
  source: 'bible' | 'catechism'
  label: LocalizedText
  entries: string[]
}

// --- Flow Definition (JSON input) ---

export type RepeatEntry = Record<string, string | LocalizedText | undefined>

export type ResolveStep = {
  data: string
  source?: string
  dataType?: string
  calendar?: 'ef' | 'of'
  strategy: string
  as: string
  book?: string
}

/**
 * Load step — registry-based data resolution. The `source` field names a
 * registered DataSource (see packages/content-engine/src/data-sources.ts).
 * Any additional fields are passed as args to `source.load(args, ctx)`.
 * The result is bound to FlowContext.flowData[as].
 *
 * Processed by resolveFlowAsync (async; sources may fetch from disk).
 */
export type LoadStep = {
  as: string
  source: string
  [arg: string]: unknown
}

export type FlowDefinition = {
  flowVersion?: '1'
  data?: Record<string, RepeatEntry[]>
  resolve?: ResolveStep[]
  load?: LoadStep[]
  sections: FlowSection[]
  fragments?: Record<string, FlowSection[]>
}

export type FlowSection = { lang?: string } & (
  | { type: 'rubric'; text: LocalizedText }
  | { type: 'divider' }
  | {
      type: 'heading'
      // Either a literal `text` or a `from` path resolved against the
      // FlowContext (e.g. `celebration.primary.title`) — `from` reads a
      // LocalizedText shape and localizes via ec.localize.
      text?: LocalizedText
      from?: string
    }
  | { type: 'image'; src: string; caption?: LocalizedText; attribution?: LocalizedText }
  | { type: 'prayer'; ref: string }
  | { type: 'prayer'; speaker?: 'priest' | 'people' | 'all'; inline: LocalizedContent }
  | { type: 'prayer'; title: LocalizedText; sections: FlowSection[] }
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedContent }
  | { type: 'canticle'; ref: string }
  | {
      type: 'canticle'
      inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedContent }
    }
  | { type: 'meditation'; text: LocalizedText }
  | { type: 'response'; verses: { v: LocalizedText; r: LocalizedText }[] }
  | { type: 'subheading'; text: LocalizedText }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: LocalizedText }
  | {
      type: 'options'
      label: LocalizedText
      options: { id: string; label: LocalizedText; lang?: string; sections: FlowSection[] }[]
    }
  | {
      type: 'options'
      label: LocalizedText
      from: string
      sections: FlowSection[]
    }
  | {
      type: 'repeat'
      count: number
      sections: FlowSection[]
    }
  | {
      type: 'repeat'
      count?: number
      from: string
      sections: FlowSection[]
    }
  | { type: 'cycle'; data: string; key?: string; as: string; sections?: FlowSection[] }
  | { type: 'psalmody'; psalms: (number | string)[] }
  | { type: 'lectio'; track: string }
  | { type: 'lectio'; reference: string }
  | { type: 'prose'; file: string }
  | {
      type: 'prose'
      book: string
      chapter: string
      langPolicy?: 'active-language' | 'fallback-content-language' | 'book-default'
    }
  | {
      type: 'select'
      on?: string | string[]
      as?: string
      label?: LocalizedText
      map?: Record<string, string>
      default?: string
      options: {
        id: string
        label: LocalizedText
        sections?: FlowSection[]
      }[]
    }
  | {
      type: 'select'
      from: string
      as: string
      idFrom?: string
      labelFrom?: string
      label?: LocalizedText
      hideIfSingle?: boolean
      default?: string
      body: FlowSection[]
    }
  | {
      type: 'gallery'
      items: {
        src: string
        title?: LocalizedText
        attribution?: LocalizedText
        caption?: LocalizedText
      }[]
    }
  | {
      type: 'holy-card'
      image: string
      title?: LocalizedText
      attribution?: LocalizedText
      prayer?: LocalizedText
    }
  | { type: 'fragment'; ref: string }
  | { type: 'call'; ref: string; args?: Record<string, unknown> }
  | {
      // Renders a colored swatch + localized label for the liturgical color
      // at `from`. `from` is a dotted path resolved against FlowContext
      // (e.g. `celebration.primary.liturgicalColor`). Renderer draws a small
      // dot in the actual color (white/red/green/violet/rose/black).
      type: 'liturgical-color'
      from: string
    }
  | {
      // Per-slot picker over a celebration's primary + alternates formularies.
      // Reads `<celebrationPath>.primary[slot]` and each `<celebrationPath>.alternates[i][slot]`,
      // filters out empty slots, renders a chip toggle + the selected source's
      // typed segments. See packages/mass-of for the celebration shape.
      type: 'choice-rich-text'
      label: LocalizedText
      slot: string
      celebration?: string
      default?: string
      citation?: string
    }
)

// --- Rendered Sections (engine output, consumed by renderer) ---

export type RenderedSection =
  | { type: 'rubric'; label: BilingualText }
  | { type: 'divider' }
  | { type: 'heading'; text: BilingualText }
  | { type: 'image'; src: string; caption?: BilingualText; attribution?: BilingualText }
  | {
      type: 'prayer'
      title: BilingualText
      text: BilingualText
      count?: number
      speaker?: 'priest' | 'people' | 'all'
      sections?: RenderedSection[]
    }
  | { type: 'hymn'; title: BilingualText; text: BilingualText }
  | {
      type: 'canticle'
      title: BilingualText
      subtitle: BilingualText
      source: BilingualText
      text: BilingualText
    }
  | { type: 'meditation'; text: BilingualText }
  | {
      type: 'liturgical-color'
      color: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
      label: BilingualText
    }
  | { type: 'response'; verses: { v: BilingualText; r: BilingualText }[] }
  | { type: 'subheading'; text: BilingualText }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: BilingualText }
  | {
      type: 'options'
      label: BilingualText
      options: { id: string; label: BilingualText; sections: RenderedSection[] }[]
    }
  | {
      type: 'select'
      label: BilingualText
      overrideKey: string
      selectedId: string
      options: { id: string; label: BilingualText; sections: RenderedSection[] }[]
    }
  | { type: 'psalmody'; psalms: PsalmRef[] }
  | { type: 'reading'; reference: ReadingReference; trackId?: string }
  | { type: 'prose'; text: BilingualText }
  | {
      type: 'gallery'
      items: {
        src: string
        title?: BilingualText
        attribution?: BilingualText
        caption?: BilingualText
      }[]
    }
  | {
      type: 'holy-card'
      image: string
      title?: BilingualText
      attribution?: BilingualText
      prayer?: BilingualText
    }
  | {
      // Per-slot picker rendered as a chip toggle + the selected source's typed
      // rich-text segments. The renderer (ProperSlot) draws the chips, the
      // selected option's body, and any citation. Selection persists via
      // overrideKey in selectOverrides.
      type: 'choice-rich-text'
      label: BilingualText
      overrideKey: string
      selectedId: string
      options: {
        id: string
        label: BilingualText
        body: BilingualRichText
        citation?: BilingualText
        introduction?: BilingualText
        conclusion?: BilingualText
        response?: BilingualRichText
      }[]
    }

export type RichTextSegmentType =
  | 'text'
  | 'rubric'
  | 'reference'
  | 'italic'
  | 'response'
  | 'signOfCross'
  | 'dropCap'

export type RichTextSegment = {
  type: RichTextSegmentType
  text: string
}

export type RichTextLine = RichTextSegment[]

export type BilingualRichText = {
  primary: RichTextLine[]
  secondary?: RichTextLine[]
}
