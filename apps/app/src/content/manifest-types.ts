import type { Tier } from '@/db/schema'
import type { Schedule } from '@/features/plan-of-life/schedule'
import type { LocalizedText } from './types'

export type FlowEntry = {
  id: string
  name: LocalizedText
  file: string
  timeBlock?: string
  group?: string
  form?: string
}

export type FormOption = {
  id: string
  name: LocalizedText
  preferenceValue: string
}

export type FormsConfig = {
  preference: string
  options: FormOption[]
}

export type SlotDefault = {
  flowId: string
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
  forms?: FormsConfig
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
