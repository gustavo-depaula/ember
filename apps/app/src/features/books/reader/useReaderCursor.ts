import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { getCursor, setCursor } from '@/db/repositories/cursors'

export type ReadingPosition = { chapterId: string; page: number }

function cursorId(bookId: string): string {
  return `book/${bookId}`
}

/**
 * Load + persist the user's last reading position for a book. The hook
 * snapshots the cursor on first render (returned as `initial`), then queues
 * updates via `save()` into a ref. The ref is flushed to the DB on AppState
 * → 'background' and on unmount so we don't write on every page turn.
 */
export function useReaderCursor(bookId: string | undefined): {
  initial: ReadingPosition | undefined
  save: (pos: ReadingPosition) => void
} {
  const [initial] = useState<ReadingPosition | undefined>(() => {
    if (!bookId) return undefined
    const cursor = getCursor(cursorId(bookId))
    if (!cursor) return undefined
    try {
      return JSON.parse(cursor.position) as ReadingPosition
    } catch {
      return undefined
    }
  })

  const latestRef = useRef<ReadingPosition | undefined>(initial)

  const save = useCallback((pos: ReadingPosition) => {
    latestRef.current = pos
  }, [])

  useEffect(() => {
    if (!bookId) return
    const flush = () => {
      if (!latestRef.current) return
      setCursor(cursorId(bookId), JSON.stringify(latestRef.current))
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') flush()
    })
    return () => {
      flush()
      sub.remove()
    }
  }, [bookId])

  return { initial, save }
}
