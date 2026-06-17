import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'
import { loadJson, saveJson } from './persisted'

// Saved churches (a home parish, places you visit). Persisted as one JSON blob in the generic
// preferences KV store — no schema/migration. We keep a light snapshot per church (not just the id)
// so the Saved list renders instantly without a network round-trip.

const storageKey = 'mass-times.favorites'

export type FavoriteChurch = {
  id: string
  name: string
  city?: string
  region?: string
}

type FavoritesState = {
  favorites: Record<string, FavoriteChurch>
  hydrated: boolean
  toggle: (church: FavoriteChurch) => void
  hydrate: () => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>()(
  immer((set, get) => ({
    favorites: {},
    hydrated: false,

    toggle: (church) => {
      set((state) => {
        if (state.favorites[church.id]) delete state.favorites[church.id]
        else state.favorites[church.id] = church
      })
      void saveJson(storageKey, get().favorites)
    },

    hydrate: async () => {
      const stored = await loadJson<Record<string, FavoriteChurch>>(storageKey, {})
      set((state) => {
        state.favorites = stored
        state.hydrated = true
      })
    },
  })),
)

export function useIsFavorite(id: string): boolean {
  return useFavoritesStore((s) => Boolean(s.favorites[id]))
}

export function useFavoriteChurches(): FavoriteChurch[] {
  return useFavoritesStore(useShallow((s) => Object.values(s.favorites)))
}
