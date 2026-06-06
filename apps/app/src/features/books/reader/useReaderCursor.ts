import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { bookCursorId, getCursor, setCursor } from '@/db/repositories/cursors'

export type ReaderPosition = {
  chapterId: string
  /** 0..1 within the chapter — foliate's relocate.fraction. */
  fraction: number
}

type LegacyPosition = { chapterId: string; page?: number }

const SAVE_DEBOUNCE_MS = 1000
const SAME_FRACTION_EPSILON = 0.001

export function parseReaderPosition(raw: string): ReaderPosition | undefined {
  try {
    const v = JSON.parse(raw) as ReaderPosition & LegacyPosition
    if (!v.chapterId) return undefined
    // Legacy {chapterId, page} cursors lose intra-chapter precision but land
    // on the right chapter, which is the load-bearing bit.
    const fraction = typeof v.fraction === 'number' ? v.fraction : 0
    return { chapterId: v.chapterId, fraction }
  } catch {
    return undefined
  }
}

function samePosition(a: ReaderPosition | undefined, b: ReaderPosition | undefined): boolean {
  if (!a || !b) return a === b
  return a.chapterId === b.chapterId && Math.abs(a.fraction - b.fraction) < SAME_FRACTION_EPSILON
}

/**
 * Loads the saved {chapterId, fraction} for a book and exposes `save` that
 * the reader calls on every relocate. Writes are debounced 1s and skipped
 * when the position hasn't actually changed; the latest position is flushed
 * synchronously on AppState background and unmount so we never lose the
 * last second of reading.
 */
export function useReaderCursor(bookId: string | undefined) {
  const [initial, setInitial] = useState<{
    position: ReaderPosition | undefined
    loaded: boolean
  }>({ position: undefined, loaded: false })

  const latestRef = useRef<ReaderPosition | undefined>(undefined)
  const lastWrittenRef = useRef<ReaderPosition | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!bookId) {
      setInitial({ position: undefined, loaded: true })
      return
    }
    const c = getCursor(bookCursorId(bookId))
    const parsed = c ? parseReaderPosition(c.position) : undefined
    latestRef.current = parsed
    lastWrittenRef.current = parsed
    setInitial({ position: parsed, loaded: true })
  }, [bookId])

  const flush = useCallback(() => {
    const pos = latestRef.current
    if (!bookId || !pos) return
    if (samePosition(pos, lastWrittenRef.current)) return
    lastWrittenRef.current = pos
    void setCursor(bookCursorId(bookId), JSON.stringify(pos))
  }, [bookId])

  const save = useCallback(
    (position: ReaderPosition) => {
      latestRef.current = position
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS)
    },
    [flush],
  )

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') flush()
    })
    return () => {
      sub.remove()
      if (timerRef.current) clearTimeout(timerRef.current)
      flush()
    }
  }, [flush])

  return { initial, save }
}
