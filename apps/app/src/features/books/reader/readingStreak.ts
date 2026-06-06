import { getCursor, readingStreakCursorId, setCursor } from '@/db/repositories/cursors'

type StoredStreak = {
  /** YYYY-MM-DD of the last day this book was opened to a relocate. */
  lastDay: string
  count: number
}

function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isYesterday(prev: string, today: string): boolean {
  const prevDate = new Date(`${prev}T00:00:00`)
  const todayDate = new Date(`${today}T00:00:00`)
  const diff = todayDate.getTime() - prevDate.getTime()
  return diff > 0 && diff < 2 * 24 * 60 * 60 * 1000
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
  } catch {}
  return undefined
}
