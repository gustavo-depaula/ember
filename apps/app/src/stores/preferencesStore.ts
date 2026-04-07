import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { type ReadingFontId, readingFonts } from '@/config/readingFonts'
import { getAllPreferences, removePreference, setPreference } from '@/db/repositories/preferences'
import { defaultTranslationForLanguage } from '@/lib/bolls'
import i18n from '@/lib/i18n'
import type { LiturgicalCalendarForm } from '@/lib/liturgical'

type PsalterCycle = '30-day'
type ThemePreference = 'light' | 'dark' | 'system'
type TextAlignment = 'justify' | 'left'
type MarginPreset = 'narrow' | 'normal' | 'wide'

const validFontIds = new Set(readingFonts.map((f) => f.id))
const minStep = 1
const maxStep = 5
const maxLineHeightStep = 7

function clamp(value: number) {
  return Math.max(minStep, Math.min(maxStep, value))
}

function clampLineHeight(value: number) {
  return Math.max(minStep, Math.min(maxLineHeightStep, value))
}

type PreferencesState = {
  // General
  translation: string
  psalterCycle: PsalterCycle
  language: string
  liturgicalCalendar: LiturgicalCalendarForm
  jurisdiction: string | undefined
  timeTravelDate: string | undefined

  // Theme
  theme: ThemePreference

  // Reading config
  fontFamily: ReadingFontId
  fontSizeStep: number
  lineHeightStep: number
  margin: MarginPreset
  textAlign: TextAlignment

  // State
  hydrated: boolean

  // General setters
  setTranslation: (translation: string) => void
  setPsalterCycle: (cycle: PsalterCycle) => void
  setLanguage: (language: string) => void
  setLiturgicalCalendar: (form: LiturgicalCalendarForm) => void
  setJurisdiction: (jurisdiction: string | undefined) => void
  setTimeTravelDate: (date: string | undefined) => void
  setTimeTravelDateEphemeral: (date: string | undefined) => void

  // Theme setter
  setTheme: (theme: ThemePreference) => void

  // Reading config setters
  setFontFamily: (id: ReadingFontId) => void
  setFontSizeStep: (step: number) => void
  setLineHeightStep: (step: number) => void
  setMargin: (margin: MarginPreset) => void
  setTextAlign: (align: TextAlignment) => void

  hydrate: () => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>()(
  immer((set) => ({
    translation: 'RSV2CE',
    psalterCycle: '30-day',
    language: 'en-US',
    liturgicalCalendar: 'of',
    jurisdiction: undefined,
    timeTravelDate: undefined,
    theme: 'system',
    fontFamily: 'eb-garamond',
    fontSizeStep: 3,
    lineHeightStep: 5,
    margin: 'normal',
    textAlign: 'justify',
    hydrated: false,

    setTranslation: (translation) => {
      set((state) => {
        state.translation = translation
      })
      setPreference('translation', translation)
    },

    setPsalterCycle: (cycle) => {
      set((state) => {
        state.psalterCycle = cycle
      })
      setPreference('psalter-cycle', cycle)
    },

    setLanguage: (language) => {
      const defaultTranslation = defaultTranslationForLanguage[language]
      set((state) => {
        state.language = language
        if (defaultTranslation) state.translation = defaultTranslation
      })
      setPreference('language', language)
      if (defaultTranslation) setPreference('translation', defaultTranslation)
      i18n.changeLanguage(language)
    },

    setLiturgicalCalendar: (form) => {
      set((state) => {
        state.liturgicalCalendar = form
      })
      setPreference('liturgical-calendar', form)
    },

    setJurisdiction: (jurisdiction) => {
      set((state) => {
        state.jurisdiction = jurisdiction
      })
      if (jurisdiction) {
        setPreference('jurisdiction', jurisdiction)
      } else {
        removePreference('jurisdiction')
      }
    },

    setTimeTravelDate: (date) => {
      set((state) => {
        state.timeTravelDate = date
      })
      if (date) {
        setPreference('time-travel-date', date)
      } else {
        removePreference('time-travel-date')
      }
    },

    setTimeTravelDateEphemeral: (date) => {
      set((state) => {
        state.timeTravelDate = date
      })
    },

    setTheme: (theme) => {
      set((state) => {
        state.theme = theme
      })
      setPreference('theme', theme)
    },

    setFontFamily: (id) => {
      set((state) => {
        state.fontFamily = id
      })
      setPreference('reading-font-family', id)
    },

    setFontSizeStep: (step) => {
      const clamped = clamp(step)
      const minLineHeight = Math.max(minStep, clamped - 1)
      let bumpedLineHeight = false
      set((state) => {
        state.fontSizeStep = clamped
        if (state.lineHeightStep < minLineHeight) {
          state.lineHeightStep = minLineHeight
          bumpedLineHeight = true
        }
      })
      setPreference('reading-font-size', String(clamped))
      if (bumpedLineHeight) {
        setPreference('reading-line-height', String(minLineHeight))
      }
    },

    setLineHeightStep: (step) => {
      const current = usePreferencesStore.getState().fontSizeStep
      const persisted = clampLineHeight(Math.max(step, current - 1))
      set((state) => {
        state.lineHeightStep = persisted
      })
      setPreference('reading-line-height', String(persisted))
    },

    setMargin: (margin) => {
      set((state) => {
        state.margin = margin
      })
      setPreference('reading-margin', margin)
    },

    setTextAlign: (align) => {
      set((state) => {
        state.textAlign = align
      })
      setPreference('reading-text-align', align)
    },

    hydrate: async () => {
      const prefs = await getAllPreferences()

      set((state) => {
        if (prefs.translation) state.translation = prefs.translation
        if (prefs['psalter-cycle'] === '30-day') state.psalterCycle = '30-day'
        if (prefs.language) state.language = prefs.language
        const cal = prefs['liturgical-calendar']
        if (cal === 'of' || cal === 'ef') state.liturgicalCalendar = cal
        if (prefs.jurisdiction) state.jurisdiction = prefs.jurisdiction
        if (prefs['time-travel-date']) state.timeTravelDate = prefs['time-travel-date']

        const theme = prefs.theme
        if (theme === 'light' || theme === 'dark' || theme === 'system') state.theme = theme

        const fontFamily = prefs['reading-font-family']
        if (fontFamily && validFontIds.has(fontFamily as ReadingFontId)) {
          state.fontFamily = fontFamily as ReadingFontId
        }
        const fontSize = prefs['reading-font-size']
        if (fontSize) {
          const parsed = Number(fontSize)
          if (parsed >= minStep && parsed <= maxStep) state.fontSizeStep = parsed
        }
        const lineHeight = prefs['reading-line-height']
        if (lineHeight) {
          const parsed = Number(lineHeight)
          if (parsed >= minStep && parsed <= maxLineHeightStep) state.lineHeightStep = parsed
        }
        const margin = prefs['reading-margin']
        if (margin === 'narrow' || margin === 'normal' || margin === 'wide') state.margin = margin
        const textAlign = prefs['reading-text-align']
        if (textAlign === 'justify' || textAlign === 'left') state.textAlign = textAlign

        // Enforce line height >= font size - 1
        const minLineHeight = Math.max(minStep, state.fontSizeStep - 1)
        if (state.lineHeightStep < minLineHeight) state.lineHeightStep = minLineHeight

        state.hydrated = true
      })

      if (prefs.language) {
        i18n.changeLanguage(prefs.language)
      }
    },
  })),
)
