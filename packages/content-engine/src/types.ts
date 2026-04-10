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
  variantKey?: string
  entries: Record<string, unknown[]>
}

// --- Lectio Tracks (practice-owned reading plans) ---

export type LectioTrackDef = {
  source: 'bible' | 'catechism'
  label: LocalizedText
  entries: string[]
}

// --- Flow Definition (JSON input) ---

export type FlowDefinition = { sections: FlowSection[] }

export type FlowSection =
  | { type: 'rubric'; text: LocalizedText }
  | { type: 'divider' }
  | { type: 'heading'; text: LocalizedText }
  | { type: 'image'; src: string; caption?: LocalizedText; attribution?: LocalizedText }
  | { type: 'prayer'; ref: string }
  | { type: 'prayer'; speaker?: 'priest' | 'people' | 'all'; inline: LocalizedContent }
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
      type: 'repeat'
      count: number
      variable?: { source: 'variant'; key: string }
      sections: FlowSection[]
    }
  | { type: 'cycle'; data: string; key?: string; as: string; sections?: FlowSection[] }
  | { type: 'psalmody'; psalms: (number | string)[] }
  | { type: 'lectio'; track: string }
  | { type: 'prose'; file: string }
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
  | { type: 'response'; verses: { v: BilingualText; r: BilingualText }[] }
  | { type: 'subheading'; text: BilingualText }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: BilingualText }
  | {
      type: 'options'
      label: BilingualText
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

// --- Variant ---

export type Variant = {
  id: string
  name: LocalizedText
  data: Record<string, VariantEntry[]>
}

export type VariantEntry = Record<string, string | LocalizedText | undefined>
