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

// --- Union ---

export type AppEvent = PracticeEvent | CompletionEvent | CursorEvent

// --- Stored row shape ---

export type StoredEvent = {
  sequence: number
  type: string
  payload: string
  timestamp: number
  version: number
}
