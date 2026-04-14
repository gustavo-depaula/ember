import type { Tier } from '@/db/schema'
import type { Schedule } from '@/features/plan-of-life/schedule'
import type { LocalizedText } from './types'

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

export type ChapterManifest = {
  id: string
  title: LocalizedText
  subtitle?: LocalizedText
  image?: string
  estimatedMinutes?: number
  tags?: string[]
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
  alternativeTo?: string
  pack?: string
  tags: string[]
  defaults?: {
    sortOrder: number
    slots: SlotDefault[]
  }
}
