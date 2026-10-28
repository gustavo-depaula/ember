import { useMemo } from 'react'

import { emit, useEventStore } from '@/db/events'
import type { FavoriteChurch } from '@/db/schema'

// Saved churches (a home parish, places you visit). Each keeps a light snapshot
// of the church (not just the id) so the Saved list renders instantly without
// a network round-trip.

export type { FavoriteChurch }

/** Rejects, leaving the list as it was, when the change could not be saved. */
export async function toggleFavorite(church: FavoriteChurch): Promise<void> {
  const saved = useEventStore.getState().favoriteChurches.has(church.id)
  await emit(
    saved
      ? { type: 'ChurchUnfavorited', churchId: church.id }
      : { type: 'ChurchFavorited', church },
  )
}

/** The saved churches by id. */
export function useFavorites(): Map<string, FavoriteChurch> {
  return useEventStore((s) => s.favoriteChurches)
}

export function useIsFavorite(id: string): boolean {
  return useEventStore((s) => s.favoriteChurches.has(id))
}

export function useFavoriteChurches(): FavoriteChurch[] {
  const favorites = useFavorites()
  return useMemo(() => [...favorites.values()], [favorites])
}
