import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

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
      AsyncStorage.setItem('bible-book', bookId)
      AsyncStorage.setItem('bible-chapter', String(chapter))
    },

    hydrate: async () => {
      const [bookId, chapter] = await Promise.all([
        AsyncStorage.getItem('bible-book'),
        AsyncStorage.getItem('bible-chapter'),
      ])
      set((state) => {
        if (bookId) state.bookId = bookId
        if (chapter) state.chapter = Number.parseInt(chapter, 10)
        state.hydrated = true
      })
    },
  })),
)
