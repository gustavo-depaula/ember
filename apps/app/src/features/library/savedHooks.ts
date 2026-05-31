/**
 * Saved-items hooks — the library's curation layer. Shaped after
 * `features/pinning/hooks.ts`: a query for the saved set and a `useSaveToggle`
 * convenience (bool + toggle). Saving is instant — no progress state, unlike
 * pinning, which prefetches blobs.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getSavedItems, isItemSaved, saveItem, unsaveItem } from '@/db/repositories/savedItems'

export function useSavedItems() {
  return useQuery({
    queryKey: ['saved-items'],
    queryFn: () => getSavedItems(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useIsSaved(itemId: string | undefined): boolean {
  const { data } = useSavedItems()
  if (!itemId || !data) return false
  return data.some((s) => s.itemId === itemId)
}

export function useSaveItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, kind }: { itemId: string; kind: string }) => saveItem(itemId, kind),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-items'] })
    },
  })
}

export function useUnsaveItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => unsaveItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-items'] })
    },
  })
}

/** Convenience: bool + toggle for the current item. `kind` denormalizes onto the row. */
export function useSaveToggle(itemId: string | undefined, kind: string) {
  const saved = useIsSaved(itemId)
  const save = useSaveItem()
  const unsave = useUnsaveItem()

  const toggle = useCallback(() => {
    if (!itemId) return
    if (saved) unsave.mutate(itemId)
    else save.mutate({ itemId, kind })
  }, [itemId, kind, saved, save, unsave])

  return {
    saved,
    isWorking: save.isPending || unsave.isPending,
    toggle,
  }
}

export { isItemSaved }
