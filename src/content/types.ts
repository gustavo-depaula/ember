// See docs/features/practice-content.md for the full spec

import type { Tier } from '@/db/schema'
import type { Schedule } from '@/features/plan-of-life/schedule'
import type { PsalmRef, ReadingReference } from '@/lib/liturgical'

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

// --- Manifest ---

export type FlowEntry = {
  id: string
  name: LocalizedText
  file: string
  timeBlock?: string
}

export type SlotDefault = {
  flowId: string
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
}

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
  program?: ProgramConfig
  theme?: 'office'
  data?: Record<string, string>
  tracks?: Record<string, string>
  flows: FlowEntry[]
  variants?: {
    id: string
    name: LocalizedText
    description: LocalizedText
    file: string
  }[]
  pack?: string
  tags: string[]
  defaults?: {
    sortOrder: number
    slots: SlotDefault[]
  }
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
  | { type: 'proper'; slot: string; description: LocalizedText }
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
  | { type: 'proper'; slot: string; description: string }
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
