import type { FlowDefinition, FlowSection } from '@ember/content-engine'

export type { FlowDefinition, FlowSection }

// Broader than content-engine's LocalizedText to support 'la' and other locales
export type LocalizedText = Record<string, string | undefined>

export type Tier = 'essential' | 'ideal' | 'extra'

export type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  | { type: 'nth-weekday'; n: number; day: number }
  | { type: 'times-per'; count: number; period: 'week' | 'month' }
  | { type: 'fixed-program'; totalDays: number; startDate: string }

export type Schedule = ScheduleRule & {
  seasons?: string[]
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

export type AlternativeToRef = {
  id: string
  label: LocalizedText
  description: LocalizedText
}

export type PracticeManifest = {
  id: string
  name: LocalizedText
  categories: string[]
  estimatedMinutes: number
  icon?: string
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
  flow: string
  alternativeTo?: AlternativeToRef
  pack?: string
  tags: string[]
  defaults?: {
    sortOrder: number
    slots: SlotDefault[]
  }
}

export type ChapterManifest = {
  id: string
  title: LocalizedText
  subtitle?: LocalizedText
  image?: string
  estimatedMinutes?: number
  tags?: string[]
}

export type PrayerAsset = {
  id?: string
  title: LocalizedText
  body: FlowSection[] | string
}

export type BookManifest = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string
  languages: string[]
  sources?: { language: string; url: string; description: string }[]
  toc: TocNode[]
}

export type TocNode = {
  id: string
  title: LocalizedText
  children?: TocNode[]
}

export type ContentEntry = {
  type: 'chapter' | 'practice' | 'book'
  id: string
}

export type LibraryManifest = {
  id: string
  version: string
  name: LocalizedText
  description?: LocalizedText
  author?: LocalizedText
  icon?: string
  image?: string
  tags?: string[]
  languages: string[]
  practices: string[]
  prayers: string[]
  chapters?: string[]
  books?: string[]
  contents?: ContentEntry[]
  defaults?: { autoSeed: boolean }
}

export type LibraryDetail = LibraryManifest & {
  _practices: PracticeManifest[]
  _prayers: PrayerAsset[]
  _books: BookManifest[]
  _chapters: ChapterManifest[]
}
