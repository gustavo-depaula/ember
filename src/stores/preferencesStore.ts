import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { defaultTranslationForLanguage } from '@/lib/bolls'
import i18n from '@/lib/i18n'
import type { LiturgicalCalendarForm } from '@/lib/liturgical/season'

type PsalterCycle = '30-day'

type PreferencesState = {
  translation: string
  psalterCycle: PsalterCycle
  language: string
  liturgicalCalendar: LiturgicalCalendarForm
  jurisdiction: string | undefined
  timeTravelDate: string | undefined
  formPreferences: Record<string, string>
  hydrated: boolean
  setTranslation: (translation: string) => void
  setPsalterCycle: (cycle: PsalterCycle) => void
  setLanguage: (language: string) => void
  setLiturgicalCalendar: (form: LiturgicalCalendarForm) => void
  setJurisdiction: (jurisdiction: string | undefined) => void
  setTimeTravelDate: (date: string | undefined) => void
  setFormPreference: (practiceId: string, formId: string) => void
  hydrate: () => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>()(
  immer((set) => ({
    translation: 'RSV2CE',
    psalterCycle: '30-day',
    language: 'en',
    liturgicalCalendar: 'of',
    jurisdiction: undefined,
    timeTravelDate: undefined,
    formPreferences: {},
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

    setLiturgicalCalendar: (form) => {
      set((state) => {
        state.liturgicalCalendar = form
      })
      AsyncStorage.setItem('liturgical-calendar', form)
    },

    setJurisdiction: (jurisdiction) => {
      set((state) => {
        state.jurisdiction = jurisdiction
      })
      if (jurisdiction) {
        AsyncStorage.setItem('jurisdiction', jurisdiction)
      } else {
        AsyncStorage.removeItem('jurisdiction')
      }
    },

    setTimeTravelDate: (date) => {
      set((state) => {
        state.timeTravelDate = date
      })
      if (date) {
        AsyncStorage.setItem('time-travel-date', date)
      } else {
        AsyncStorage.removeItem('time-travel-date')
      }
    },

    setFormPreference: (practiceId, formId) => {
      set((state) => {
        state.formPreferences[practiceId] = formId
      })
      AsyncStorage.setItem(
        'form-preferences',
        JSON.stringify({ ...usePreferencesStore.getState().formPreferences, [practiceId]: formId }),
      )
    },

    hydrate: async () => {
      const [
        translation,
        psalterCycle,
        language,
        liturgicalCalendar,
        jurisdiction,
        timeTravelDate,
        formPrefsJson,
        legacyMassForm,
      ] = await Promise.all([
        AsyncStorage.getItem('translation'),
        AsyncStorage.getItem('psalter-cycle'),
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('liturgical-calendar'),
        AsyncStorage.getItem('jurisdiction'),
        AsyncStorage.getItem('time-travel-date'),
        AsyncStorage.getItem('form-preferences'),
        AsyncStorage.getItem('mass-form'),
      ])
      set((state) => {
        if (translation) state.translation = translation
        if (psalterCycle === '30-day') state.psalterCycle = psalterCycle
        if (language) state.language = language
        if (liturgicalCalendar === 'of' || liturgicalCalendar === 'ef')
          state.liturgicalCalendar = liturgicalCalendar
        if (jurisdiction) state.jurisdiction = jurisdiction
        if (timeTravelDate) state.timeTravelDate = timeTravelDate
        if (formPrefsJson) {
          try {
            state.formPreferences = JSON.parse(formPrefsJson)
          } catch {}
        }
        // Migrate legacy mass-form preference
        if (legacyMassForm && !state.formPreferences.mass) {
          state.formPreferences.mass = legacyMassForm
        }
        state.hydrated = true
      })
      if (language) {
        i18n.changeLanguage(language)
      }
    },
  })),
)
