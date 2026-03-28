import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { type ReadingFontId, readingFonts } from '@/config/readingFonts'

type TextAlignment = 'justify' | 'left'
type MarginPreset = 'narrow' | 'normal' | 'wide'

const validFontIds = new Set(readingFonts.map((f) => f.id))

type ReadingConfigState = {
  fontFamily: ReadingFontId
  fontSizeStep: number
  lineHeightStep: number
  margin: MarginPreset
  textAlign: TextAlignment
  hydrated: boolean
  setFontFamily: (id: ReadingFontId) => void
  setFontSizeStep: (step: number) => void
  setLineHeightStep: (step: number) => void
  setMargin: (margin: MarginPreset) => void
  setTextAlign: (align: TextAlignment) => void
  hydrate: () => Promise<void>
}

const minStep = 1
const maxStep = 5

function clamp(value: number) {
  return Math.max(minStep, Math.min(maxStep, value))
}

export const useReadingConfigStore = create<ReadingConfigState>()(
  immer((set) => ({
    fontFamily: 'eb-garamond',
    fontSizeStep: 3,
    lineHeightStep: 3,
    margin: 'normal',
    textAlign: 'justify',
    hydrated: false,

    setFontFamily: (id) => {
      set((state) => {
        state.fontFamily = id
      })
      AsyncStorage.setItem('reading-font-family', id)
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
      AsyncStorage.setItem('reading-font-size', String(clamped))
      if (bumpedLineHeight) {
        AsyncStorage.setItem('reading-line-height', String(minLineHeight))
      }
    },

    setLineHeightStep: (step) => {
      const current = useReadingConfigStore.getState().fontSizeStep
      const persisted = clamp(Math.max(step, current - 1))
      set((state) => {
        state.lineHeightStep = persisted
      })
      AsyncStorage.setItem('reading-line-height', String(persisted))
    },

    setMargin: (margin) => {
      set((state) => {
        state.margin = margin
      })
      AsyncStorage.setItem('reading-margin', margin)
    },

    setTextAlign: (align) => {
      set((state) => {
        state.textAlign = align
      })
      AsyncStorage.setItem('reading-text-align', align)
    },

    hydrate: async () => {
      const [fontFamily, fontSize, lineHeight, margin, textAlign] = await Promise.all([
        AsyncStorage.getItem('reading-font-family'),
        AsyncStorage.getItem('reading-font-size'),
        AsyncStorage.getItem('reading-line-height'),
        AsyncStorage.getItem('reading-margin'),
        AsyncStorage.getItem('reading-text-align'),
      ])
      set((state) => {
        if (fontFamily && validFontIds.has(fontFamily as ReadingFontId)) {
          state.fontFamily = fontFamily as ReadingFontId
        }
        if (fontSize) {
          const parsed = Number(fontSize)
          if (parsed >= minStep && parsed <= maxStep) state.fontSizeStep = parsed
        }
        if (lineHeight) {
          const parsed = Number(lineHeight)
          if (parsed >= minStep && parsed <= maxStep) state.lineHeightStep = parsed
        }
        if (margin === 'narrow' || margin === 'normal' || margin === 'wide') {
          state.margin = margin
        }
        if (textAlign === 'justify' || textAlign === 'left') {
          state.textAlign = textAlign
        }
        const minLineHeight = Math.max(minStep, state.fontSizeStep - 1)
        if (state.lineHeightStep < minLineHeight) {
          state.lineHeightStep = minLineHeight
        }
        state.hydrated = true
      })
    },
  })),
)
