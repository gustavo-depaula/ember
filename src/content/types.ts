// Practice Content Architecture — Type Definitions
// See docs/features/practice-content.md for the full spec

export type LocalizedText = { en: string; 'pt-BR'?: string }
export type LocalizedBilingualText = { en: string; latin?: string; 'pt-BR'?: string }

// --- Manifest ---

export type PracticeManifest = {
  id: string
  name: LocalizedText
  categories: string[]
  estimatedMinutes: number
  image?: string
  thumbnail?: string
  description: LocalizedText
  history: LocalizedText
  howToPray: LocalizedText
  flowMode: 'scroll' | 'step'
  completion: 'flow-end' | 'manual'
  flow?: string
  hours?: {
    id: string
    name: LocalizedText
    flow: string
    timeBlock: string
  }[]
  variants?: {
    id: string
    name: LocalizedText
    description: LocalizedText
    file: string
  }[]
  pack?: string
  tags: string[]
}

// --- Flow Definition (JSON input) ---

export type FlowDefinition = { sections: FlowSection[] }

export type FlowSection =
  | { type: 'rubric'; text: LocalizedText }
  | { type: 'divider' }
  | { type: 'heading'; text: LocalizedText }
  | { type: 'image'; src: string; caption?: LocalizedText }
  | { type: 'prayer'; ref: string }
  | { type: 'prayer'; inline: LocalizedBilingualText }
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedBilingualText }
  | { type: 'canticle'; ref: string }
  | {
      type: 'canticle'
      inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedBilingualText }
    }
  | { type: 'meditation'; text: LocalizedText }
  | { type: 'response'; verses: { v: LocalizedText; r: LocalizedText }[] }
  | {
      type: 'repeat'
      count: number
      variable?: { source: string; key: string }
      sections: FlowSection[]
    }
  | { type: 'psalter'; hour: string; cycle: string }
  | { type: 'lectio'; testament: 'ot' | 'nt' | 'catechism' }
  | { type: 'seasonal'; set: string; hour: string }

// --- Rendered Sections (engine output, consumed by renderer) ---

export type RenderedSection =
  | { type: 'rubric'; label: string }
  | { type: 'divider' }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'prayer'; title: string; text: string }
  | { type: 'hymn'; title: string; latin: string; english: string }
  | { type: 'canticle'; title: string; subtitle: string; source: string; text: string }
  | { type: 'meditation'; text: string }
  | { type: 'response'; verses: { v: string; r: string }[] }

// --- Variant ---

export type Variant = {
  id: string
  name: LocalizedText
  selector: 'day-of-week' | 'liturgical-season' | 'manual'
  schedule?: Record<string, string>
  data: Record<string, VariantEntry[]>
}

export type VariantEntry = Record<string, string | undefined>
