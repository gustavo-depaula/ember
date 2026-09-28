import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'

type BibleState = {
  bookId: string
  chapter: number
  /** Unix ms of the last move, so Continue can order the Bible among books. */
  updatedAt?: number
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
      const now = Date.now()
      set((state) => {
        state.bookId = bookId
        state.chapter = chapter
        state.updatedAt = now
      })
      setPreference('bible-book', bookId)
      setPreference('bible-chapter', String(chapter))
      setPreference('bible-updated-at', String(now))
    },

    hydrate: async () => {
      const [bookId, chapter, updatedAt] = await Promise.all([
        getPreference('bible-book'),
        getPreference('bible-chapter'),
        getPreference('bible-updated-at'),
      ])
      set((state) => {
        if (bookId) state.bookId = bookId
        if (chapter) state.chapter = Number.parseInt(chapter, 10)
        if (updatedAt) state.updatedAt = Number(updatedAt)
        state.hydrated = true
      })
    },
  })),
)
