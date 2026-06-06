import { differenceInCalendarDays, format } from 'date-fns'
import { getCursor, readingStreakCursorId, setCursor } from '@/db/repositories/cursors'
import { getToday } from '@/hooks/useToday'

type StoredStreak = {
  /** YYYY-MM-DD of the last day this book was opened to a relocate. */
  lastDay: string
  count: number
}

// `getToday()` respects the user's time-travel setting (per the rest of the
// codebase); `new Date()` would not.
function todayISO(now?: Date): string {
  return format(now ?? getToday(), 'yyyy-MM-dd')
}

function isYesterday(prev: string, today: string): boolean {
  return differenceInCalendarDays(new Date(today), new Date(prev)) === 1
}

/** Bump the streak: same-day no-op; consecutive day increments; gap resets. */
export async function touchReadingStreak(bookId: string, now?: Date): Promise<void> {
  const today = todayISO(now)
  const existing = readStoredStreak(bookId)
  if (existing?.lastDay === today) return
  const next: StoredStreak = {
    lastDay: today,
    count: existing && isYesterday(existing.lastDay, today) ? existing.count + 1 : 1,
  }
  await setCursor(readingStreakCursorId(bookId), JSON.stringify(next))
}

export function getReadingStreak(bookId: string, now?: Date): number {
  const stored = readStoredStreak(bookId)
  if (!stored) return 0
  const today = todayISO(now)
  if (stored.lastDay === today) return stored.count
  if (isYesterday(stored.lastDay, today)) return stored.count
  return 0
}

function readStoredStreak(bookId: string): StoredStreak | undefined {
  const c = getCursor(readingStreakCursorId(bookId))
  if (!c) return undefined
  try {
    const v = JSON.parse(c.position) as StoredStreak
    if (typeof v.lastDay === 'string' && typeof v.count === 'number') return v
  } catch (err) {
    console.warn(`[readingStreak] parse failed for ${bookId}:`, err)
  }
  return undefined
}
