import type {
  CheckIn,
  CompletionVia,
  FavoriteChurch,
  HolyCardCopy,
  Tier,
  TimeBlock,
} from '../schema'

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

// Folds one practice into another: its slots, completions and program cursor
// follow, and the events that made them stay in the log.
type PracticeMerged = {
  type: 'PracticeMerged'
  fromId: string
  toId: string
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
  pins?: Record<string, string>
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
    pins: Record<string, string>
    minutes: number
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
  | PracticeMerged
  | SlotAdded
  | SlotUpdated
  | SlotDeleted
  | SlotsReordered

type CompletionLogged = {
  type: 'CompletionLogged'
  completionId: string
  practiceId: string
  subId: string | null
  date: string
  completedAt: number
  prayedId?: string
  via?: CompletionVia
  pins?: Record<string, string>
}

type CompletionRemoved = {
  type: 'CompletionRemoved'
  completionId: string
  practiceId: string
  date: string
  subId: string | null
}

type CompletionsBatchLogged = {
  type: 'CompletionsBatchLogged'
  practiceId: string
  entries: { completionId: string; date: string; subId: string; completedAt: number }[]
}

export type CompletionEvent = CompletionLogged | CompletionRemoved | CompletionsBatchLogged

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

type HolyCardRedeemed = { type: 'HolyCardRedeemed' } & HolyCardCopy

export type HolyCardEvent = HolyCardRedeemed

type ItemSaved = { type: 'ItemSaved'; itemId: string; kind: string; savedAt: number }

type ItemUnsaved = { type: 'ItemUnsaved'; itemId: string }

export type SavedItemEvent = ItemSaved | ItemUnsaved

// `at` is when the collection changed: it orders the shelf, most recent first.
type CollectionCreated = {
  type: 'CollectionCreated'
  collectionId: string
  name: string
  description?: string
  coverTone: number
  at: number
}

type CollectionUpdated = {
  type: 'CollectionUpdated'
  collectionId: string
  name?: string
  description?: string | null
  coverTone?: number
  at: number
}

type CollectionDeleted = { type: 'CollectionDeleted'; collectionId: string }

type CollectionItemAdded = {
  type: 'CollectionItemAdded'
  collectionId: string
  ref: string
  at: number
}

type CollectionItemRemoved = {
  type: 'CollectionItemRemoved'
  collectionId: string
  ref: string
  at: number
}

type CollectionItemsReordered = {
  type: 'CollectionItemsReordered'
  collectionId: string
  orderedRefs: string[]
  at: number
}

export type CollectionEvent =
  | CollectionCreated
  | CollectionUpdated
  | CollectionDeleted
  | CollectionItemAdded
  | CollectionItemRemoved
  | CollectionItemsReordered

type ChurchFavorited = { type: 'ChurchFavorited'; church: FavoriteChurch }

type ChurchUnfavorited = { type: 'ChurchUnfavorited'; churchId: string }

type CheckInLogged = { type: 'CheckInLogged'; checkIn: CheckIn }

type CheckInRemoved = { type: 'CheckInRemoved'; checkInId: string }

export type ChurchEvent = ChurchFavorited | ChurchUnfavorited | CheckInLogged | CheckInRemoved

// Time spent reading a book on `date`. Each is an addition, so what two
// devices read apart sums; `ms: 0` only marks the day as one the book was read.
type ReadingLogged = { type: 'ReadingLogged'; bookId: string; date: string; ms: number }

export type ReadingEvent = ReadingLogged

// A preference that follows the person from device to device; null clears it.
type PreferenceSet = { type: 'PreferenceSet'; key: string; value: string | null }

export type PreferenceEvent = PreferenceSet

// The devices signed in to the account, as the account's own devices tell
// it: the relay knows a device only by an id it can't put a name to.
type DeviceNamed = {
  type: 'DeviceNamed'
  deviceId: string
  name: string
  platform: string
  at: number
}
type DeviceRemoved = { type: 'DeviceRemoved'; deviceId: string }

export type DeviceEvent = DeviceNamed | DeviceRemoved

export type AppEvent =
  | PracticeEvent
  | CompletionEvent
  | CursorEvent
  | HolyCardEvent
  | SavedItemEvent
  | CollectionEvent
  | ChurchEvent
  | ReadingEvent
  | PreferenceEvent
  | DeviceEvent

export type StoredEvent = {
  sequence: number
  id: string
  type: string
  payload: string
  timestamp: number
  version: number
  synced: number
}
