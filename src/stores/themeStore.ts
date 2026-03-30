import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'

type ThemePreference = 'light' | 'dark' | 'system'

type ThemeState = {
  preference: ThemePreference
  hydrated: boolean
  setTheme: (theme: ThemePreference) => void
  hydrate: () => Promise<void>
}

export const useThemeStore = create<ThemeState>()(
  immer((set) => ({
    preference: 'system',
    hydrated: false,

    setTheme: (theme) => {
      set((state) => {
        state.preference = theme
      })
      setPreference('theme', theme)
    },

    hydrate: async () => {
      const stored = await getPreference('theme')
      set((state) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          state.preference = stored
        }
        state.hydrated = true
      })
    },
  })),
)
