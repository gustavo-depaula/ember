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
  } catch {
    return 0
  }
}

/** Append `elapsedMs` to the running total. No-op for trivial sessions. */
export async function addReadingTime(bookId: string, elapsedMs: number): Promise<void> {
  if (!elapsedMs || elapsedMs < 1000) return
  const current = getReadingTimeMs(bookId)
  await setCursor(readingTimeCursorId(bookId), JSON.stringify({ totalMs: current + elapsedMs }))
}
