import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { getEntry } from '@/content/contentIndex'
import { evictTo, getCacheStats } from '@/content/store'
import { getPinnedItems, isPinned, pinItem, pinnedHashes, unpinItem } from './pinningManager'

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

/**
 * Bulk-pin every corpus practice in a list (e.g. the user's plan-of-life).
 *
 * Resolves each `practiceId` to its catalog item (`practice/<id>`); silently
 * skips ids without a corpus entry (custom user practices) and ids that are
 * already pinned. Best-effort — failures on individual practices log a warning
 * and do not abort the rest. Progress is reported per practice (done/total),
 * not per blob.
 */
export function usePinPractices(practiceIds: string[]) {
  const qc = useQueryClient()
  const { data: pinnedList } = usePinnedItems()
  const [progress, setProgress] = useState<{ done: number; total: number } | undefined>()

  const eligibleIds = useMemo(() => {
    const out: string[] = []
    for (const pid of practiceIds) {
      const itemId = `practice/${pid}`
      if (getEntry(itemId)) out.push(itemId)
    }
    return out
  }, [practiceIds])

  const pendingIds = useMemo(() => {
    const pinnedSet = new Set((pinnedList ?? []).map((p) => p.id))
    return eligibleIds.filter((id) => !pinnedSet.has(id))
  }, [eligibleIds, pinnedList])

  const allPinned = eligibleIds.length > 0 && pendingIds.length === 0

  const mutation = useMutation({
    mutationFn: async () => {
      // Snapshot the work-list at click time so the progress counter doesn't
      // drift as `pinned-items` invalidates between practices.
      const todo = eligibleIds.filter((id) => !isPinned(id))
      if (todo.length === 0) return
      setProgress({ done: 0, total: todo.length })
      let done = 0
      try {
        await Promise.all(
          todo.map(async (id) => {
            try {
              await pinItem(id)
            } catch (err) {
              console.warn('[pinning] failed to pin', id, err)
            } finally {
              done += 1
              setProgress({ done, total: todo.length })
            }
          }),
        )
      } finally {
        setProgress(undefined)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-items'] })
    },
  })

  const pinAll = useCallback(() => {
    if (mutation.isPending || pendingIds.length === 0) return
    mutation.mutate()
  }, [mutation, pendingIds.length])

  return {
    allPinned,
    eligibleCount: eligibleIds.length,
    pendingCount: pendingIds.length,
    isWorking: mutation.isPending,
    progress,
    pinAll,
  }
}

export { getPinnedItems, isPinned } from './pinningManager'
