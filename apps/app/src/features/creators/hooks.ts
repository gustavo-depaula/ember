import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type FollowRecord,
  followCreator,
  getAllFollows,
  setAutoPinCount,
  unfollowCreator,
} from '@/db/repositories/creators'
import { getInProgressFeedItems, getRecentForFollowed } from '@/db/repositories/feedItems'

import { refreshCreator } from './feeds/fetcher'
import { type PinResult, pinFeedItem, unpinFeedItem } from './pinning/feedItemPin'

const FOLLOWS_KEY = ['creators', 'follows'] as const

export function useFollows() {
  return useQuery({
    queryKey: FOLLOWS_KEY,
    queryFn: getAllFollows,
    staleTime: Infinity,
  })
}

export function useIsFollowed(creatorId: string | undefined): boolean {
  const { data } = useFollows()
  if (!creatorId || !data) return false
  return data.some((f: FollowRecord) => f.creatorId === creatorId)
}

export function useFollow(creatorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await followCreator(creatorId)
      // Force a refresh on first follow so the user sees content immediately.
      // Fire-and-forget but log errors so silent network failures don't hide.
      void refreshCreator(creatorId, { force: true }).catch((err) => {
        console.warn('[creators] first-follow refresh failed:', creatorId, err)
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}

export function useUnfollow(creatorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => unfollowCreator(creatorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}

export function useSetAutoPinCount(creatorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (count: number) => setAutoPinCount(creatorId, count),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}

export function useLatestForFollowed(limit = 8) {
  return useQuery({
    queryKey: ['creators', 'latest', limit],
    queryFn: () => getRecentForFollowed(limit),
    staleTime: 30_000,
  })
}

/** Started-but-unfinished feed items for the Library "Continue" strip. */
export function useInProgressMedia(limit = 12) {
  return useQuery({
    queryKey: ['creators', 'in-progress', limit],
    queryFn: () => getInProgressFeedItems(limit),
    staleTime: 30_000,
  })
}

export function usePinFeedItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string): Promise<PinResult> => pinFeedItem(itemId, 'manual'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}

export function useUnpinFeedItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => unpinFeedItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}
