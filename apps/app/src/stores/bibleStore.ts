import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getPreference, setPreference } from '@/db/repositories/preferences'
import { type BiblePlace, recordPlace } from '@/features/bible/recents'
import { type Book, getDrbBooks } from '@/lib/content'

type BibleState = {
  bookId: string
  chapter: number
  /** Unix ms of the last move, so Continue can order the Bible among books. */
  updatedAt?: number
  /** The last few books read, each at its last chapter, most recent first. */
  places: BiblePlace[]
  hydrated: boolean
  setPosition: (bookId: string, chapter: number) => void
  /** Counts the open chapter as read: it becomes, or moves, a place. */
  recordReading: (books: Book[]) => void
  hydrate: () => Promise<void>
}

// A position saved under an online translation named its book by number: the
// 66 protocanonical books in Protestant order, the deuterocanon on fixed ids
// after them. Every translation now uses the Douay slugs.
const deuterocanonByNumber: Record<string, string> = {
  68: 'tobias',
  69: 'judith',
  70: 'wisdom',
  71: 'ecclesiasticus',
  73: 'baruch',
  74: '1-machabees',
  75: '2-machabees',
}

async function slugForSavedBook(saved: string): Promise<string | undefined> {
  if (!/^\d+$/.test(saved)) return saved
  if (saved in deuterocanonByNumber) return deuterocanonByNumber[saved]
  const deuterocanon = new Set(Object.values(deuterocanonByNumber))
  const protocanon = (await getDrbBooks()).filter((b) => !deuterocanon.has(b.id))
  return protocanon[Number(saved) - 1]?.id
}

export const useBibleStore = create<BibleState>()(
  immer((set, get) => ({
    bookId: 'genesis',
    chapter: 1,
    places: [],
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

    recordReading: (books) => {
      const { places, bookId, chapter } = get()
      const next = recordPlace(places, books, bookId, chapter, Date.now())
      set((state) => {
        state.places = next
      })
      setPreference('bible-places', JSON.stringify(next))
    },

    hydrate: async () => {
      const [savedBook, chapter, updatedAt, places] = await Promise.all([
        getPreference('bible-book'),
        getPreference('bible-chapter'),
        getPreference('bible-updated-at'),
        getPreference('bible-places'),
      ])
      const bookId = savedBook && (await slugForSavedBook(savedBook))
      set((state) => {
        if (bookId) state.bookId = bookId
        if (chapter) state.chapter = Number.parseInt(chapter, 10)
        if (updatedAt) state.updatedAt = Number(updatedAt)
        if (places) state.places = JSON.parse(places)
        state.hydrated = true
      })
    },
  })),
)
