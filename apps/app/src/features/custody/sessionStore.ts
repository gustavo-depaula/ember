import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
  createSession as repoCreateSession,
  endSession as repoEndSession,
} from '@/db/repositories/custody'

import type { Anchor, CustodySession, SessionAnchorType, SessionEndReason } from './types'

export type SessionState =
  | { kind: 'idle' }
  | {
      kind: 'running'
      sessionId: string
      startedAt: number
      plannedSeconds: number
      anchor: Anchor
    }
  | {
      kind: 'paused'
      sessionId: string
      startedAt: number
      pausedAt: number
      plannedSeconds: number
      elapsedAtPause: number
      anchor: Anchor
    }
  | {
      kind: 'completed'
      sessionId: string
      anchor: Anchor
      plannedSeconds: number
    }

function anchorTypeOf(anchor: Anchor): SessionAnchorType {
  return anchor.kind
}

function anchorRef(anchor: Anchor): string {
  switch (anchor.kind) {
    case 'text':
      return anchor.text
    case 'image':
      return anchor.imageRef
    case 'prayer':
      return anchor.prayerRef
    case 'lectio':
      return anchor.reference
    case 'silence':
      return 'silence'
    default: {
      const _exhaustive: never = anchor
      throw new Error(`Unhandled anchor kind: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

type SessionActions = {
  start: (input: { plannedSeconds: number; anchor: Anchor }) => Promise<CustodySession>
  pause: () => void
  resume: () => void
  abort: () => Promise<void>
  complete: () => Promise<void>
  // Backgrounding policy (B2): wall-clock authoritative; bells suppressed
  // foreground-only. On foreground we just recompute elapsed — no state change.
  // If the wall clock has already passed `started_at + planned_seconds`, the
  // runner will call `complete()` next tick.
  elapsedSeconds: (now?: number) => number
  remainingSeconds: (now?: number) => number
}

export const useSessionStore = create<SessionState & SessionActions>()(
  immer((set, get) => ({
    kind: 'idle',

    start: async ({ plannedSeconds, anchor }) => {
      const created = await repoCreateSession({
        anchorRef: anchorRef(anchor),
        anchorType: anchorTypeOf(anchor),
        plannedSeconds,
      })
      set(() => ({
        kind: 'running',
        sessionId: created.id,
        startedAt: created.started_at,
        plannedSeconds,
        anchor,
      }))
      return created
    },

    pause: () => {
      const s = get()
      if (s.kind !== 'running') return
      const now = Date.now()
      const elapsed = Math.floor((now - s.startedAt) / 1000)
      set(() => ({
        kind: 'paused',
        sessionId: s.sessionId,
        startedAt: s.startedAt,
        pausedAt: now,
        plannedSeconds: s.plannedSeconds,
        elapsedAtPause: elapsed,
        anchor: s.anchor,
      }))
    },

    resume: () => {
      const s = get()
      if (s.kind !== 'paused') return
      const now = Date.now()
      const pauseDuration = now - s.pausedAt
      const adjustedStart = s.startedAt + pauseDuration
      set(() => ({
        kind: 'running',
        sessionId: s.sessionId,
        startedAt: adjustedStart,
        plannedSeconds: s.plannedSeconds,
        anchor: s.anchor,
      }))
    },

    abort: async () => {
      const s = get()
      if (s.kind === 'idle' || s.kind === 'completed') return
      await repoEndSession(s.sessionId, 'aborted' satisfies SessionEndReason)
      set(() => ({ kind: 'idle' }))
    },

    complete: async () => {
      const s = get()
      if (s.kind !== 'running' && s.kind !== 'paused') return
      const completedAt = s.startedAt + s.plannedSeconds * 1000
      await repoEndSession(s.sessionId, 'completed', completedAt)
      set(() => ({
        kind: 'completed',
        sessionId: s.sessionId,
        anchor: s.anchor,
        plannedSeconds: s.plannedSeconds,
      }))
    },

    elapsedSeconds: (now = Date.now()) => {
      const s = get()
      if (s.kind === 'running') return Math.floor((now - s.startedAt) / 1000)
      if (s.kind === 'paused') return s.elapsedAtPause
      return 0
    },

    remainingSeconds: (now = Date.now()) => {
      const s = get()
      if (s.kind !== 'running' && s.kind !== 'paused') return 0
      const elapsed = s.kind === 'running' ? (now - s.startedAt) / 1000 : s.elapsedAtPause
      return Math.max(0, Math.floor(s.plannedSeconds - elapsed))
    },
  })),
)
