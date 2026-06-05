import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { getCursor, setCursor } from '@/db/repositories/cursors'

export type ReaderPosition = {
  /** Chapter id (one of the TOC leaves' ids). */
  chapterId: string
  /** 0..1 within the chapter — foliate's relocate.fraction. */
  fraction: number
}

type LegacyPosition = { chapterId: string; page?: number }

function cursorId(bookId: string) {
  return `book/${bookId}`
}

export function parseReaderPosition(raw: string): ReaderPosition | undefined {
  try {
    const v = JSON.parse(raw) as ReaderPosition & LegacyPosition
    if (!v.chapterId) return undefined
    // Old cursors stored `page` instead of `fraction`; we lose intra-chapter
    // precision but land on the right chapter, which is the load-bearing bit.
    const fraction = typeof v.fraction === 'number' ? v.fraction : 0
    return { chapterId: v.chapterId, fraction }
  } catch {
    return undefined
  }
}

/**
 * Loads the saved {chapterId, fraction} for a book and returns a setter that
 * the reader calls (frequently — debounce in the caller) as the user moves
 * through pages. Position is flushed on unmount and when the app backgrounds.
 */
export function useReaderCursor(bookId: string | undefined) {
  const [initial, setInitial] = useState<{
    position: ReaderPosition | undefined
    loaded: boolean
  }>({ position: undefined, loaded: false })

  const latestRef = useRef<ReaderPosition | undefined>(undefined)

  useEffect(() => {
    if (!bookId) {
      setInitial({ position: undefined, loaded: true })
      return
    }
    const c = getCursor(cursorId(bookId))
    const parsed = c ? parseReaderPosition(c.position) : undefined
    latestRef.current = parsed
    setInitial({ position: parsed, loaded: true })
  }, [bookId])

  const save = (position: ReaderPosition) => {
    latestRef.current = position
    if (!bookId) return
    void setCursor(cursorId(bookId), JSON.stringify(position))
  }

  // Flush on background and unmount so we never lose the last-known location.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'background' && s !== 'inactive') return
      const pos = latestRef.current
      if (bookId && pos) void setCursor(cursorId(bookId), JSON.stringify(pos))
    })
    return () => {
      sub.remove()
      const pos = latestRef.current
      if (bookId && pos) void setCursor(cursorId(bookId), JSON.stringify(pos))
    }
  }, [bookId])

  return { initial, save }
}
