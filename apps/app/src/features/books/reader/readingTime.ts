import { format } from 'date-fns'

import { emit, useEventStore } from '@/db/events'
import { getToday } from '@/hooks/useToday'

export function getReadingTimeMs(bookId: string): number {
  return useEventStore.getState().reading.get(bookId)?.ms ?? 0
}

/** Each session adds to the total, so what two devices read apart sums. */
export async function addReadingTime(bookId: string, ms: number): Promise<void> {
  if (ms < 1000) return
  await emit({ type: 'ReadingLogged', bookId, date: format(getToday(), 'yyyy-MM-dd'), ms })
}
