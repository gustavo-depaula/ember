import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type PsalterCycle = '30-day'

type PreferencesState = {
  translation: string
  psalterCycle: PsalterCycle
  hydrated: boolean
  setTranslation: (translation: string) => void
  setPsalterCycle: (cycle: PsalterCycle) => void
  hydrate: () => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>()(
  immer((set) => ({
    translation: 'DRB',
    psalterCycle: '30-day',
    hydrated: false,

    setTranslation: (translation) => {
      set((state) => {
        state.translation = translation
      })
      AsyncStorage.setItem('translation', translation)
    },

    setPsalterCycle: (cycle) => {
      set((state) => {
        state.psalterCycle = cycle
      })
      AsyncStorage.setItem('psalter-cycle', cycle)
    },

    hydrate: async () => {
      const [translation, psalterCycle] = await Promise.all([
        AsyncStorage.getItem('translation'),
        AsyncStorage.getItem('psalter-cycle'),
      ])
      set((state) => {
        if (translation) state.translation = translation
        if (psalterCycle === '30-day') state.psalterCycle = psalterCycle
        state.hydrated = true
      })
    },
  })),
)
