import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import type { Resolution, ResolutionLevel, ResolutionOutcome, ResolutionReview } from '@/db/events'
import { useEventStore } from '@/db/events'
import {
  archiveResolution,
  checkinResolution,
  type ReviseResolutionInput,
  reviewResolution,
  reviseResolution,
  type SetResolutionInput,
  setResolution,
} from '@/db/repositories'
import { useToday } from '@/hooks/useToday'

import { pickActive, pickPending } from './selectors'

export function useActiveResolution(level: ResolutionLevel): Resolution | undefined {
  const now = useToday().getTime()
  return useEventStore((s) => pickActive(s.resolutions, s.resolutionsByLevel.get(level), now))
}

export function usePendingResolution(level: ResolutionLevel): Resolution | undefined {
  const now = useToday().getTime()
  return useEventStore((s) =>
    pickPending(s.resolutions, s.resolutionReviews, s.resolutionsByLevel.get(level), now),
  )
}

export function useResolutionReviews(resolutionId: string): ResolutionReview[] {
  return useEventStore(useShallow((s) => s.resolutionReviews.get(resolutionId) ?? []))
}

// --- Mutations ---

export function useSetResolution() {
  return useMutation({ mutationFn: (input: SetResolutionInput) => setResolution(input) })
}

export function useReviseResolution() {
  return useMutation({ mutationFn: (input: ReviseResolutionInput) => reviseResolution(input) })
}

export function useReviewResolution() {
  return useMutation({
    mutationFn: (args: { resolutionId: string; outcome: ResolutionOutcome; notes?: string }) =>
      reviewResolution(args.resolutionId, args.outcome, args.notes),
  })
}

export function useCheckinResolution() {
  return useMutation({
    mutationFn: (args: { resolutionId: string; outcome: ResolutionOutcome; notes?: string }) =>
      checkinResolution(args.resolutionId, args.outcome, args.notes),
  })
}

export function useArchiveResolution() {
  return useMutation({ mutationFn: (id: string) => archiveResolution(id) })
}
