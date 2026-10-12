import { format } from 'date-fns'

import { emit, useEventStore } from '@/db/events'
import { getCursor, readingTimeCursorId } from '@/db/repositories/cursors'
import { getToday } from '@/hooks/useToday'

// The time read is the sum of what each session added (`ReadingLogged`), on
// top of the single running total kept before sessions were recorded.
function totalBeforeSessions(bookId: string): number {
  const c = getCursor(readingTimeCursorId(bookId))
  if (!c) return 0
  try {
    const v = JSON.parse(c.position) as { totalMs: number }
    return typeof v.totalMs === 'number' && v.totalMs > 0 ? v.totalMs : 0
  } catch (err) {
    console.warn(`[readingTime] parse failed for ${bookId}:`, err)
    return 0
  }
}

export function getReadingTimeMs(bookId: string): number {
  return totalBeforeSessions(bookId) + (useEventStore.getState().reading.get(bookId)?.ms ?? 0)
}

export async function addReadingTime(bookId: string, ms: number): Promise<void> {
  if (ms < 1000) return
  await emit({ type: 'ReadingLogged', bookId, date: format(getToday(), 'yyyy-MM-dd'), ms })
}
