import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { followLog } from '@/db/events'
import {
  biblePlacesCursorId,
  biblePositionCursorId,
  getCursor,
  setCursor,
} from '@/db/repositories/cursors'
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
      setCursor(biblePositionCursorId, JSON.stringify({ bookId, chapter, updatedAt: now }))
    },

    recordReading: (books) => {
      const { places, bookId, chapter } = get()
      const next = recordPlace(places, books, bookId, chapter, Date.now())
      set((state) => {
        state.places = next
      })
      setCursor(biblePlacesCursorId, JSON.stringify(next))
    },

    setPaneKind: (id) => {
      set((state) => {
        state.paneKind = id
      })
      setPreference('bible-commentary', id)
    },

    hydrate: async () => {
      const position = getCursor(biblePositionCursorId)?.position
      const saved = position ? (JSON.parse(position) as Position) : undefined
      const places = getCursor(biblePlacesCursorId)?.position
      const commentary = await getPreference('bible-commentary')
      const bookId = saved && (await slugForSavedBook(saved.bookId))
      set((state) => {
        if (bookId) state.bookId = bookId
        if (saved?.chapter) state.chapter = saved.chapter
        if (saved?.updatedAt) state.updatedAt = saved.updatedAt
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

// The position lives in the event log, which can change under this store.
followLog(
  (state, previous) =>
    useBibleStore.getState().hydrated &&
    (state.preferences !== previous.preferences ||
      [biblePositionCursorId, biblePlacesCursorId].some(
        (id) => state.cursors.get(id) !== previous.cursors.get(id),
      )),
  () => useBibleStore.getState().hydrate(),
)
