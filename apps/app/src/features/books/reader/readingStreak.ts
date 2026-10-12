import { addDays, format } from 'date-fns'

import { emit, useEventStore } from '@/db/events'
import { getCursor, readingStreakCursorId } from '@/db/repositories/cursors'
import { getToday } from '@/hooks/useToday'

// `getToday()` respects the user's time-travel setting (per the rest of the
// codebase); `new Date()` would not.
function todayISO(now?: Date): string {
  return format(now ?? getToday(), 'yyyy-MM-dd')
}

function dayBefore(day: string): string {
  return format(addDays(new Date(`${day}T12:00:00`), -1), 'yyyy-MM-dd')
}

// Before each day read was recorded, a book kept only its run's last day and
// length; that run still counts.
function daysBeforeRecords(bookId: string): string[] {
  const c = getCursor(readingStreakCursorId(bookId))
  if (!c) return []
  try {
    const v = JSON.parse(c.position) as { lastDay: string; count: number }
    if (typeof v.lastDay !== 'string' || typeof v.count !== 'number') return []
    const days = [v.lastDay]
    while (days.length < v.count) days.push(dayBefore(days[days.length - 1]))
    return days
  } catch (err) {
    console.warn(`[readingStreak] parse failed for ${bookId}:`, err)
    return []
  }
}

function daysRead(bookId: string): Set<string> {
  return new Set([
    ...daysBeforeRecords(bookId),
    ...(useEventStore.getState().reading.get(bookId)?.days ?? []),
  ])
}

/** Marks today as a day the book was read; a no-op if it already is. */
export async function touchReadingStreak(bookId: string, now?: Date): Promise<void> {
  const today = todayISO(now)
  if (daysRead(bookId).has(today)) return
  await emit({ type: 'ReadingLogged', bookId, date: today, ms: 0 })
}

/** The run of consecutive days read that reaches today or yesterday. */
export function getReadingStreak(bookId: string, now?: Date): number {
  const days = daysRead(bookId)
  const today = todayISO(now)
  let day = days.has(today) ? today : dayBefore(today)
  let count = 0
  while (days.has(day)) {
    count += 1
    day = dayBefore(day)
  }
  return count
}
