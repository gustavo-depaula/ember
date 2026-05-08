import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { evictTo, getCacheStats } from '@/content/store'
import { getPinnedItems, pinItem, pinnedHashes, unpinItem } from './pinningManager'

export function usePinnedItems() {
  return useQuery({
    queryKey: ['pinned-items'],
    queryFn: () => getPinnedItems(),
    staleTime: Infinity,
  })
}

export function useIsPinned(itemId: string | undefined): boolean {
  // Re-read from the source of truth on every pinned-items invalidation.
  const { data } = usePinnedItems()
  if (!itemId || !data) return false
  return data.some((p) => p.id === itemId)
}

export function usePinItem() {
  const qc = useQueryClient()
  const [progress, setProgress] = useState<{ done: number; total: number } | undefined>()

  const mutation = useMutation({
    mutationFn: async (itemId: string) => {
      setProgress({ done: 0, total: 0 })
      try {
        await pinItem(itemId, (done, total) => setProgress({ done, total }))
      } finally {
        setProgress(undefined)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-items'] })
    },
  })

  return { ...mutation, progress }
}

export function useUnpinItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => unpinItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-items'] })
    },
  })
}

export function useCacheStats() {
  // Keyed under `['pinned-items', ...]` so that invalidating `['pinned-items']`
  // (after pin/unpin/clear) also re-runs this query.
  return useQuery({
    queryKey: ['pinned-items', 'cache-stats'],
    queryFn: async () => {
      const protectedHashes = await pinnedHashes()
      return getCacheStats(protectedHashes)
    },
    staleTime: Infinity,
  })
}

export function useClearCache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const protectedHashes = await pinnedHashes()
      return evictTo(0, protectedHashes)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-items'] })
      qc.invalidateQueries({ queryKey: ['cache-stats'] })
    },
  })
}

/** Convenience: bool + toggle for the current item. */
export function usePinToggle(itemId: string | undefined) {
  const pinned = useIsPinned(itemId)
  const pin = usePinItem()
  const unpin = useUnpinItem()

  const toggle = useCallback(() => {
    if (!itemId) return
    if (pinned) unpin.mutate(itemId)
    else pin.mutate(itemId)
  }, [itemId, pinned, pin, unpin])

  return {
    pinned,
    isWorking: pin.isPending || unpin.isPending,
    progress: pin.progress,
    toggle,
  }
}

export { getPinnedItems, isPinned } from './pinningManager'
