import { format, subDays } from 'date-fns'

import { emit, useEventStore } from '@/db/events'
import { getToday } from '@/hooks/useToday'

// `getToday()` respects the user's time-travel setting (per the rest of the
// codebase); `new Date()` would not.
function todayISO(now?: Date): string {
  return format(now ?? getToday(), 'yyyy-MM-dd')
}

function dayBefore(day: string): string {
  return format(subDays(new Date(`${day}T12:00:00`), 1), 'yyyy-MM-dd')
}

function daysRead(bookId: string): Set<string> | undefined {
  return useEventStore.getState().reading.get(bookId)?.days
}

/** Marks today as a day the book was read; a no-op if it already is. */
export async function touchReadingStreak(bookId: string, now?: Date): Promise<void> {
  const today = todayISO(now)
  if (daysRead(bookId)?.has(today)) return
  await emit({ type: 'ReadingLogged', bookId, date: today, ms: 0 })
}

/** The run of consecutive days read that reaches today or yesterday. */
export function getReadingStreak(bookId: string, now?: Date): number {
  const days = daysRead(bookId)
  if (!days) return 0
  const today = todayISO(now)
  let day = days.has(today) ? today : dayBefore(today)
  let count = 0
  while (days.has(day)) {
    count += 1
    day = dayBefore(day)
  }
  return count
}
