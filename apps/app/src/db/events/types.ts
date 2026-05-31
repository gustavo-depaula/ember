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

// --- Movement events (intentions + thanksgivings) ---

export type Cadence = 'perpetual' | 'goal' | 'bounded'

type IntentionRaised = {
  type: 'IntentionRaised'
  id: string
  text: string
  subject?: string
  cadence: Cadence
  bounded_until?: number
  raised_at: number
}

type IntentionUpdated = {
  type: 'IntentionUpdated'
  id: string
  text?: string
  subject?: string | null
  cadence?: Cadence
  bounded_until?: number | null
}

type IntentionAnswered = {
  type: 'IntentionAnswered'
  id: string
  notes?: string
  answered_at: number
}

type IntentionExpired = {
  type: 'IntentionExpired'
  id: string
  expired_at: number
}

type IntentionRetired = {
  type: 'IntentionRetired'
  id: string
  retired_at: number
}

type ThanksgivingOffered = {
  type: 'ThanksgivingOffered'
  id: string
  text: string
  subject?: string
  offered_at: number
  /**
   * Optional lineage: the intention this thanksgiving was bridged from.
   * Unvalidated foreign key — a deleted source intention leaves the lineage
   * dangling. Acceptable for a personal-app event log.
   */
  from_intention?: string
}

type ThanksgivingUpdated = {
  type: 'ThanksgivingUpdated'
  id: string
  text?: string
  subject?: string | null
}

type ThanksgivingRetired = {
  type: 'ThanksgivingRetired'
  id: string
  retired_at: number
}

type MovementPinned = {
  type: 'MovementPinned'
  practice_id: string
  movement_id: string
  pinned_at: number
}

type MovementUnpinned = {
  type: 'MovementUnpinned'
  practice_id: string
  movement_id: string
  unpinned_at: number
}

export type MovementEvent =
  | IntentionRaised
  | IntentionUpdated
  | IntentionAnswered
  | IntentionExpired
  | IntentionRetired
  | ThanksgivingOffered
  | ThanksgivingUpdated
  | ThanksgivingRetired
  | MovementPinned
  | MovementUnpinned

// --- Resolution events ---

export type ResolutionLevel = 'daily'
export type ResolutionOutcome = 'kept' | 'partial' | 'broken'
export type ResolutionSource = 'examen' | 'manual' | 'review'

type ResolutionSet = {
  type: 'ResolutionSet'
  id: string
  level: ResolutionLevel
  text: string
  virtue?: string
  parent_id?: string
  starts_at: number
  ends_at: number
  source: ResolutionSource
  recorded_at: number
}

type ResolutionRevised = {
  type: 'ResolutionRevised'
  id: string
  text?: string
  virtue?: string | null
  parent_id?: string | null
  revised_at: number
}

type ResolutionCheckin = {
  type: 'ResolutionCheckin'
  resolution_id: string
  outcome: ResolutionOutcome
  notes?: string
  reviewed_at: number
}

type ResolutionReviewed = {
  type: 'ResolutionReviewed'
  resolution_id: string
  outcome: ResolutionOutcome
  notes?: string
  reviewed_at: number
}

type ResolutionArchived = {
  type: 'ResolutionArchived'
  id: string
  archived_at: number
}

export type ResolutionEvent =
  | ResolutionSet
  | ResolutionRevised
  | ResolutionCheckin
  | ResolutionReviewed
  | ResolutionArchived

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

// --- Union ---

export type AppEvent =
  | PracticeEvent
  | CompletionEvent
  | CursorEvent
  | MovementEvent
  | ResolutionEvent
  | OblatioEvent

// --- Stored row shape ---

export type StoredEvent = {
  sequence: number
  type: string
  payload: string
  timestamp: number
  version: number
}
