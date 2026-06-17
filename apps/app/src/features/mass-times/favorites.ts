import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'
import { getPreference, setPreference } from '@/db/repositories/preferences'

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
      void persist(get().favorites)
    },

    hydrate: async () => {
      const raw = await getPreference(storageKey)
      set((state) => {
        if (raw) {
          try {
            state.favorites = JSON.parse(raw) as Record<string, FavoriteChurch>
          } catch (err) {
            console.warn('[mass-times] could not parse saved churches', err)
          }
        }
        state.hydrated = true
      })
    },
  })),
)

function persist(favorites: Record<string, FavoriteChurch>) {
  return setPreference(storageKey, JSON.stringify(favorites)).catch((err) =>
    console.warn('[mass-times] could not save churches', err),
  )
}

export function useIsFavorite(id: string): boolean {
  return useFavoritesStore((s) => Boolean(s.favorites[id]))
}

export function useFavoriteChurches(): FavoriteChurch[] {
  return useFavoritesStore(useShallow((s) => Object.values(s.favorites)))
}
