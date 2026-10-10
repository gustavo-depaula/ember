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
}

export type Run = {
  status: 'queued' | 'running' | 'failed'
  activity: string[]
  error?: string
}

// One church with suggestions waiting. `church` is missing when they name a church the directory
// doesn't hold.
export type Case = {
  churchId: string
  church?: Church
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

// On disk an entry also keeps what undo needs.
export type StoredHistoryEntry = HistoryEntry & { before?: Church; resolution: Resolution }

export type Desk = {
  target: 'remote' | 'local'
  loadedAt: string
  cases: Case[]
  history: HistoryEntry[]
}

export type DeskEvent = { type: 'desk'; desk: Desk } | { type: 'run'; churchId: string; run?: Run }
