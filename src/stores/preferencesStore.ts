import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { defaultTranslationForLanguage } from '@/lib/bolls'
import i18n from '@/lib/i18n'

type PsalterCycle = '30-day'

type PreferencesState = {
  translation: string
  psalterCycle: PsalterCycle
  language: string
  hydrated: boolean
  setTranslation: (translation: string) => void
  setPsalterCycle: (cycle: PsalterCycle) => void
  setLanguage: (language: string) => void
  hydrate: () => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>()(
  immer((set) => ({
    translation: 'RSV2CE',
    psalterCycle: '30-day',
    language: 'en',
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

    setLanguage: (language) => {
      const defaultTranslation = defaultTranslationForLanguage[language]
      set((state) => {
        state.language = language
        if (defaultTranslation) state.translation = defaultTranslation
      })
      AsyncStorage.setItem('language', language)
      if (defaultTranslation) AsyncStorage.setItem('translation', defaultTranslation)
      i18n.changeLanguage(language)
    },

    hydrate: async () => {
      const [translation, psalterCycle, language] = await Promise.all([
        AsyncStorage.getItem('translation'),
        AsyncStorage.getItem('psalter-cycle'),
        AsyncStorage.getItem('language'),
      ])
      set((state) => {
        if (translation) state.translation = translation
        if (psalterCycle === '30-day') state.psalterCycle = psalterCycle
        if (language) state.language = language
        state.hydrated = true
      })
      if (language) {
        i18n.changeLanguage(language)
      }
    },
  })),
)
