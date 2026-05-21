import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import {
  archiveCommitment,
  createCommitment,
  createSession,
  deleteCommitment,
  endSession,
  getCommitment,
  listCommitments,
  listEventsForCommitment,
  listRecentSessions,
  recordEvent,
  unarchiveCommitment,
  updateCommitment,
} from '@/db/repositories/custody'

import { unwireBoundEnforcement, wireBoundEnforcement } from './enforcement'
import { isCommitmentActiveOn } from './schedule'
import type {
  Commitment,
  CommitmentInput,
  EventType,
  ScheduleContext,
  SessionAnchorType,
  SessionEndReason,
} from './types'

const ROOT = ['custody'] as const

export const custodyKeys = {
  root: ROOT,
  commitments: () => [...ROOT, 'commitments'] as const,
  commitmentsAll: (includeArchived: boolean) =>
    [...ROOT, 'commitments', 'all', includeArchived] as const,
  commitment: (id: string) => [...ROOT, 'commitments', id] as const,
  events: (commitmentId: string) => [...ROOT, 'events', commitmentId] as const,
  sessions: () => [...ROOT, 'sessions', 'recent'] as const,
}

// --- Reads ---

export function useCommitments(opts: { includeArchived?: boolean } = {}) {
  const includeArchived = opts.includeArchived ?? false
  return useQuery({
    queryKey: custodyKeys.commitmentsAll(includeArchived),
    queryFn: () => listCommitments({ includeArchived }),
  })
}

export function useCommitment(id: string | undefined) {
  return useQuery({
    queryKey: custodyKeys.commitment(id ?? ''),
    queryFn: () => (id ? getCommitment(id) : Promise.resolve(undefined)),
    enabled: !!id,
  })
}

export function useActiveCommitmentsToday(date?: Date, ctx?: ScheduleContext) {
  const { data: commitments } = useCommitments({ includeArchived: false })
  // Key the memo on a stable timestamp — passing `new Date()` from a caller
  // would otherwise bust the memo on every render.
  const dateMs = date ? date.getTime() : Math.floor(Date.now() / 86400000) * 86400000
  return useMemo<Commitment[]>(() => {
    if (!commitments) return []
    const d = new Date(dateMs)
    return commitments.filter((c) => isCommitmentActiveOn(c.schedule, d, ctx))
  }, [commitments, dateMs, ctx])
}

export function useCommitmentEvents(commitmentId: string | undefined, limit = 200) {
  return useQuery({
    queryKey: commitmentId ? custodyKeys.events(commitmentId) : ['custody', 'events', '__none__'],
    queryFn: () =>
      commitmentId ? listEventsForCommitment(commitmentId, { limit }) : Promise.resolve([]),
    enabled: !!commitmentId,
  })
}

export function useRecentSessions(limit = 20) {
  return useQuery({
    queryKey: [...custodyKeys.sessions(), limit],
    queryFn: () => listRecentSessions(limit),
  })
}

// --- Mutations ---

function useInvalidateRoot() {
  const qc = useQueryClient()
  return useCallback(() => qc.invalidateQueries({ queryKey: custodyKeys.root }), [qc])
}

export function useCreateCommitment() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: (input: CommitmentInput & { id?: string }) => createCommitment(input),
    onSuccess: async (commitment) => {
      await wireBoundEnforcement(commitment)
      invalidate()
    },
  })
}

export function useUpdateCommitment() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CommitmentInput> }) =>
      updateCommitment(id, patch),
    onSuccess: async (commitment) => {
      // Tear down first so a target change pulls the old shield cleanly,
      // then re-wire with the new state.
      await unwireBoundEnforcement(commitment)
      await wireBoundEnforcement(commitment)
      invalidate()
    },
  })
}

export function useArchiveCommitment() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: async (id: string) => {
      const existing = await getCommitment(id)
      await archiveCommitment(id)
      if (existing) await unwireBoundEnforcement(existing)
    },
    onSuccess: invalidate,
  })
}

export function useUnarchiveCommitment() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: async (id: string) => {
      await unarchiveCommitment(id)
      const c = await getCommitment(id)
      if (c) await wireBoundEnforcement(c)
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCommitment() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: async (id: string) => {
      const existing = await getCommitment(id)
      await deleteCommitment(id)
      if (existing) await unwireBoundEnforcement(existing)
    },
    onSuccess: invalidate,
  })
}

export function useRecordEvent() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: (input: {
      commitmentId: string
      type: EventType
      note?: string
      metadata?: Record<string, unknown>
      occurredAt?: number
    }) => recordEvent(input),
    onSuccess: invalidate,
  })
}

export function useCreateSession() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: (input: {
      anchorRef: string
      anchorType: SessionAnchorType
      plannedSeconds: number
    }) => createSession(input),
    onSuccess: invalidate,
  })
}

export function useEndSession() {
  const invalidate = useInvalidateRoot()
  return useMutation({
    mutationFn: ({
      id,
      reason,
      completedAt,
    }: {
      id: string
      reason: SessionEndReason
      completedAt?: number
    }) => endSession(id, reason, completedAt),
    onSuccess: invalidate,
  })
}
