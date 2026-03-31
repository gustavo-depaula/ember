import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'

type BibleState = {
  bookId: string
  chapter: number
  hydrated: boolean
  setPosition: (bookId: string, chapter: number) => void
  hydrate: () => Promise<void>
}

export const useBibleStore = create<BibleState>()(
  immer((set) => ({
    bookId: 'genesis',
    chapter: 1,
    hydrated: false,

    setPosition: (bookId, chapter) => {
      set((state) => {
        state.bookId = bookId
        state.chapter = chapter
      })
      setPreference('bible-book', bookId)
      setPreference('bible-chapter', String(chapter))
    },

    hydrate: async () => {
      const [bookId, chapter] = await Promise.all([
        getPreference('bible-book'),
        getPreference('bible-chapter'),
      ])
      set((state) => {
        if (bookId) state.bookId = bookId
        if (chapter) state.chapter = Number.parseInt(chapter, 10)
        state.hydrated = true
      })
    },
  })),
)
