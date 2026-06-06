import { getCursor, readingTimeCursorId, setCursor } from '@/db/repositories/cursors'

type StoredReadingTime = {
  totalMs: number
}

export function getReadingTimeMs(bookId: string): number {
  const c = getCursor(readingTimeCursorId(bookId))
  if (!c) return 0
  try {
    const v = JSON.parse(c.position) as StoredReadingTime
    return typeof v.totalMs === 'number' && v.totalMs > 0 ? v.totalMs : 0
  } catch (err) {
    console.warn(`[readingTime] parse failed for ${bookId}:`, err)
    return 0
  }
}

/**
 * Persist `totalMs` directly. The caller owns the running total so concurrent
 * AppState flushes don't race a read-then-write — BookReader holds the
 * accumulator and just writes the latest value on each flush.
 */
export async function persistReadingTimeMs(bookId: string, totalMs: number): Promise<void> {
  if (!totalMs || totalMs < 1000) return
  await setCursor(readingTimeCursorId(bookId), JSON.stringify({ totalMs }))
}
