// See docs/features/features-overview.md for the full spec

import type { PsalmRef, ReadingReference } from '@ember/liturgical'

export type LocalizedText = { en: string; 'pt-BR'?: string }
export type LocalizedBilingualText = { en: string; latin?: string; 'pt-BR'?: string }

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
  | { type: 'image'; src: string; caption?: LocalizedText }
  | { type: 'prayer'; ref: string }
  | { type: 'prayer'; speaker?: 'priest' | 'people' | 'all'; inline: LocalizedBilingualText }
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedBilingualText }
  | { type: 'canticle'; ref: string }
  | {
      type: 'canticle'
      inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedBilingualText }
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

// --- Rendered Sections (engine output, consumed by renderer) ---

export type RenderedSection =
  | { type: 'rubric'; label: string }
  | { type: 'divider' }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | {
      type: 'prayer'
      title: string
      text: string
      count?: number
      speaker?: 'priest' | 'people' | 'all'
      latin?: string
    }
  | { type: 'hymn'; title: string; latin: string; english: string }
  | { type: 'canticle'; title: string; subtitle: string; source: string; text: string }
  | { type: 'meditation'; text: string }
  | { type: 'response'; verses: { v: string; r: string }[] }
  | { type: 'subheading'; text: string }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: string }
  | {
      type: 'options'
      label: string
      options: { id: string; label: string; sections: RenderedSection[] }[]
    }
  | { type: 'psalmody'; psalms: PsalmRef[] }
  | { type: 'reading'; reference: ReadingReference; trackId?: string }

// --- Variant ---

export type Variant = {
  id: string
  name: LocalizedText
  data: Record<string, VariantEntry[]>
}

export type VariantEntry = Record<string, string | LocalizedText | undefined>
