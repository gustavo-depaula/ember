import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { useEventStore } from '@/db/events'
import { getCursor, setCursor } from '@/db/repositories/cursors'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { defaultCommentarySource, findCommentarySource } from '@/features/bible/commentary'
import { type BiblePlace, recordPlace } from '@/features/bible/recents'
import { isReferenceKind } from '@/features/bible/references'
import { type Book, getDrbBooks } from '@/lib/content'

type BibleState = {
  bookId: string
  chapter: number
  /** Unix ms of the last move, so Continue can order the Bible among books. */
  updatedAt?: number
  /** The last few books read, each at its last chapter, most recent first. */
  places: BiblePlace[]
  /** What was last read beside the text: a commentator's id, or a kind of reference. */
  paneKind: string
  hydrated: boolean
  setPosition: (bookId: string, chapter: number) => void
  /** Counts the open chapter as read: it becomes, or moves, a place. */
  recordReading: (books: Book[]) => void
  setPaneKind: (id: string) => void
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

// Where the reader stands and the books lately read are reading positions,
// kept with the books' own as cursors.
const positionCursor = 'bible'
const placesCursor = 'bible/places'

type Position = { bookId: string; chapter: number; updatedAt?: number }

export const useBibleStore = create<BibleState>()(
  immer((set, get) => ({
    bookId: 'genesis',
    chapter: 1,
    places: [],
    paneKind: defaultCommentarySource,
    hydrated: false,

    setPosition: (bookId, chapter) => {
      const now = Date.now()
      set((state) => {
        state.bookId = bookId
        state.chapter = chapter
        state.updatedAt = now
      })
      setCursor(positionCursor, JSON.stringify({ bookId, chapter, updatedAt: now }))
    },

    recordReading: (books) => {
      const { places, bookId, chapter } = get()
      const next = recordPlace(places, books, bookId, chapter, Date.now())
      set((state) => {
        state.places = next
      })
      setCursor(placesCursor, JSON.stringify(next))
    },

    setPaneKind: (id) => {
      set((state) => {
        state.paneKind = id
      })
      setPreference('bible-commentary', id)
    },

    hydrate: async () => {
      const position = getCursor(positionCursor)?.position
      const saved = position ? (JSON.parse(position) as Position) : undefined
      const places = getCursor(placesCursor)?.position
      const commentary = await getPreference('bible-commentary')
      const bookId = saved && (await slugForSavedBook(String(saved.bookId)))
      set((state) => {
        if (bookId) state.bookId = bookId
        if (saved?.chapter) state.chapter = Number(saved.chapter)
        if (saved?.updatedAt) state.updatedAt = Number(saved.updatedAt)
        if (places) state.places = JSON.parse(places)
        if (commentary) {
          state.paneKind = isReferenceKind(commentary)
            ? commentary
            : findCommentarySource(commentary).id
        }
        state.hydrated = true
      })
    },
  })),
)

// The position lives in the event log, which can change under this store:
// another tab's write, another device's reading.
useEventStore.subscribe((state, previous) => {
  if (!useBibleStore.getState().hydrated) return
  const moved = [positionCursor, placesCursor].some(
    (id) => state.cursors.get(id) !== previous.cursors.get(id),
  )
  if (!moved && state.preferences === previous.preferences) return
  useBibleStore
    .getState()
    .hydrate()
    .catch((err) => console.warn('[bible] failed to follow the log:', err))
})
