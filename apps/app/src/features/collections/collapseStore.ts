/**
 * Per-user collapse state for collection sections.
 *
 * Keyed as `${collectionId}#${sectionId}`. Missing entries fall back to the
 * section's `defaultCollapsed`. Persisted as a single JSON blob in preferences
 * so the user's choices survive app restarts.
 *
 * Hydration is lazy — the collection screen calls `hydrate()` on first mount;
 * we don't pull this into boot since most users never open a collection.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'

const PREF_KEY = 'collections-collapse-state'

type CollapseState = {
  state: Record<string, boolean> // explicit user overrides; missing = default
  hydrated: boolean
  hydrate: () => Promise<void>
  isCollapsed: (key: string, defaultCollapsed: boolean) => boolean
  setCollapsed: (key: string, collapsed: boolean) => void
  toggle: (key: string, defaultCollapsed: boolean) => void
  setMany: (entries: { key: string; collapsed: boolean }[]) => void
}

export function collapseKey(collectionId: string, sectionId: string): string {
  return `${collectionId}#${sectionId}`
}

export const useCollapseStore = create<CollapseState>()(
  immer((set, get) => ({
    state: {},
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return
      const raw = await getPreference(PREF_KEY)
      let parsed: Record<string, boolean> = {}
      if (raw) {
        try {
          const obj = JSON.parse(raw)
          if (obj && typeof obj === 'object') parsed = obj as Record<string, boolean>
        } catch {
          // corrupt pref — discard and start fresh
        }
      }
      set((s) => {
        s.state = parsed
        s.hydrated = true
      })
    },

    isCollapsed: (key, defaultCollapsed) => {
      const explicit = get().state[key]
      return explicit ?? defaultCollapsed
    },

    setCollapsed: (key, collapsed) => {
      set((s) => {
        s.state[key] = collapsed
      })
      persist(get().state)
    },

    toggle: (key, defaultCollapsed) => {
      const next = !get().isCollapsed(key, defaultCollapsed)
      set((s) => {
        s.state[key] = next
      })
      persist(get().state)
    },

    setMany: (entries) => {
      set((s) => {
        for (const { key, collapsed } of entries) s.state[key] = collapsed
      })
      persist(get().state)
    },
  })),
)

function persist(state: Record<string, boolean>): void {
  setPreference(PREF_KEY, JSON.stringify(state)).catch((err) =>
    console.warn('[collapseStore] persist failed:', err),
  )
}
