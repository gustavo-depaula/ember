import type { Proposal, Resolution } from '@ember/api/src/moderation'
import type { Church } from '@ember/api/src/schema'

// What the desk's server and its page say to each other.

export type Suggestion = {
  id: string
  kind: string
  serviceId?: string
  createdAt: string
  comment?: string
  changes?: Record<string, string>
  attachmentKeys: string[]
  // How this sender's other corrections were settled, as a hint of how far to trust them.
  reporter: { accepted: number; rejected: number }
}

// Claude's draft for a church, and the suggestions it had in front of it.
export type Review = {
  proposal: Proposal
  sessionId: string
  suggestionIds: string[]
  reviewedAt: string
  costUsd?: number
  // The version of the brief it was written under, and whether that is no longer the current one.
  brief?: number
  outdated?: boolean
}

export type Run = {
  status: 'queued' | 'running' | 'failed'
  activity: string[]
  error?: string
}

// One church with suggestions waiting. `church` is missing when they name a church the directory
// doesn't hold.
// Another church a resolution may reach: one of the same parish (the parish church, a sibling
// chapel), or one standing close by that may turn out to be a chapel nobody has linked yet.
export type OtherChurch = { church: Church; distanceKm: number; sameParish: boolean }

export type Case = {
  churchId: string
  church?: Church
  others: OtherChurch[]
  suggestions: Suggestion[]
  verifications: number // "times are correct" taps in the last 30 days
  review?: Review
  run?: Run
}

export type HistoryEntry = {
  id: string
  churchId: string
  churchName: string
  appliedAt: string
  summary: string
  undoneAt?: string
}

// On disk an entry also keeps what undo needs, and what the change log tells other directories:
// every church the resolution touched, before and after (`before` is missing for one it created),
// what the change rested on, and whether it has been passed on.
export type StoredHistoryEntry = HistoryEntry & {
  records: Array<{ before?: Church; after: Church }>
  resolution: Resolution
  basis?: string
  sharedAt?: string
}

export type Desk = {
  target: 'remote' | 'local'
  loadedAt: string
  cases: Case[]
  history: HistoryEntry[]
  // Applied resolutions that changed a church and still stand, newest first.
  log: StoredHistoryEntry[]
}

export type DeskEvent = { type: 'desk'; desk: Desk } | { type: 'run'; churchId: string; run?: Run }
