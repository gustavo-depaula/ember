import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'

type CatechismState = {
  paragraph: number
  hydrated: boolean
  setParagraph: (paragraph: number) => void
  hydrate: () => Promise<void>
}

export const useCatechismStore = create<CatechismState>()(
  immer((set) => ({
    paragraph: 1,
    hydrated: false,

    setParagraph: (paragraph) => {
      set((state) => {
        state.paragraph = paragraph
      })
      setPreference('catechism-paragraph', String(paragraph))
    },

    hydrate: async () => {
      const paragraph = await getPreference('catechism-paragraph')
      set((state) => {
        if (paragraph) state.paragraph = Number.parseInt(paragraph, 10)
        state.hydrated = true
      })
    },
  })),
)
