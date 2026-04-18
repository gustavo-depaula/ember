import type { Tier, TimeBlock } from '../schema'

// --- Practice events ---

type PracticeCreated = {
  type: 'PracticeCreated'
  practiceId: string
  customName?: string
  customIcon?: string
  customDesc?: string
  activeVariant?: string
}

type PracticeUpdated = {
  type: 'PracticeUpdated'
  practiceId: string
  customName?: string | null
  customIcon?: string | null
  customDesc?: string | null
  activeVariant?: string | null
}

type PracticeArchived = {
  type: 'PracticeArchived'
  practiceId: string
}

type PracticeUnarchived = {
  type: 'PracticeUnarchived'
  practiceId: string
}

type PracticeDeleted = {
  type: 'PracticeDeleted'
  practiceId: string
}

type SlotAdded = {
  type: 'SlotAdded'
  practiceId: string
  slotKey: string
  tier: Tier
  time: string | null
  timeBlock: TimeBlock
  schedule: string
  sortOrder: number
  enabled: number
}

type SlotUpdated = {
  type: 'SlotUpdated'
  slotKey: string
  changes: Partial<{
    enabled: number
    sortOrder: number
    tier: Tier
    time: string | null
    timeBlock: TimeBlock
    notify: string | null
    schedule: string
  }>
}

type SlotDeleted = {
  type: 'SlotDeleted'
  slotKey: string
  practiceId: string
  slotId: string
}

type SlotsReordered = {
  type: 'SlotsReordered'
  orderedSlotKeys: string[]
}

export type PracticeEvent =
  | PracticeCreated
  | PracticeUpdated
  | PracticeArchived
  | PracticeUnarchived
  | PracticeDeleted
  | SlotAdded
  | SlotUpdated
  | SlotDeleted
  | SlotsReordered

// --- Completion events ---

type CompletionLogged = {
  type: 'CompletionLogged'
  completionId: number
  practiceId: string
  subId: string | null
  date: string
  completedAt: number
}

type CompletionRemoved = {
  type: 'CompletionRemoved'
  completionId: number
  practiceId: string
  date: string
  subId: string | null
}

type CompletionsBatchLogged = {
  type: 'CompletionsBatchLogged'
  practiceId: string
  entries: { completionId: number; date: string; subId: string; completedAt: number }[]
}

export type CompletionEvent = CompletionLogged | CompletionRemoved | CompletionsBatchLogged

// --- Cursor events ---

type CursorSet = {
  type: 'CursorSet'
  cursorId: string
  position: string
  startedAt: string
}

type CursorAdvanced = {
  type: 'CursorAdvanced'
  cursorId: string
  newIndex: number
}

type CursorIndexSet = {
  type: 'CursorIndexSet'
  cursorId: string
  index: number
}

type ProgramRestarted = {
  type: 'ProgramRestarted'
  cursorId: string
  practiceId: string
  startDate: string
}

export type CursorEvent = CursorSet | CursorAdvanced | CursorIndexSet | ProgramRestarted

// --- Intention events ---

type IntentionAdded = {
  type: 'IntentionAdded'
  intentionId: number
  text: string
  createdAt: number
}

type IntentionUpdated = {
  type: 'IntentionUpdated'
  intentionId: number
  text?: string
  notes?: string | null
}

type IntentionAnswered = {
  type: 'IntentionAnswered'
  intentionId: number
  answeredAt: number | null
  notes?: string | null
}

type IntentionRemoved = {
  type: 'IntentionRemoved'
  intentionId: number
}

export type IntentionEvent =
  | IntentionAdded
  | IntentionUpdated
  | IntentionAnswered
  | IntentionRemoved

// --- Gratitude events ---

type GratitudeRecorded = {
  type: 'GratitudeRecorded'
  gratitudeId: number
  text: string
  recordedAt: number
}

type GratitudeRemoved = {
  type: 'GratitudeRemoved'
  gratitudeId: number
}

export type GratitudeEvent = GratitudeRecorded | GratitudeRemoved

// --- Oblatio (daily offering) events ---

type DayOffered = {
  type: 'DayOffered'
  date: string
  offeredAt: number
}

type DayOfferingRevoked = {
  type: 'DayOfferingRevoked'
  date: string
}

export type OblatioEvent = DayOffered | DayOfferingRevoked

// --- Confessio (sacrament of penance) events ---

type ConfessionRecorded = {
  type: 'ConfessionRecorded'
  confessionId: number
  date: string
  recordedAt: number
}

type ConfessionRemoved = {
  type: 'ConfessionRemoved'
  confessionId: number
}

export type ConfessioEvent = ConfessionRecorded | ConfessionRemoved

// --- Angelus (thrice-daily Marian prayer) events ---

export type AngelusSlot = 'morning' | 'noon' | 'evening'

type AngelusPrayed = {
  type: 'AngelusPrayed'
  date: string
  slot: AngelusSlot
  prayedAt: number
}

type AngelusRevoked = {
  type: 'AngelusRevoked'
  date: string
  slot: AngelusSlot
}

export type AngelusEvent = AngelusPrayed | AngelusRevoked

// --- Union ---

export type AppEvent =
  | PracticeEvent
  | CompletionEvent
  | CursorEvent
  | IntentionEvent
  | GratitudeEvent
  | OblatioEvent
  | ConfessioEvent
  | AngelusEvent

// --- Stored row shape ---

export type StoredEvent = {
  sequence: number
  type: string
  payload: string
  timestamp: number
  version: number
}
