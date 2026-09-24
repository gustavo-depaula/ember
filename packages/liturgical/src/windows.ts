import { startOfDay, subDays } from 'date-fns'

const DEFAULT_CUTOFF_HOUR = 4

/**
 * Map a wall-clock instant onto the logical day for spiritual practice. Times
 * before the cutoff hour (default 4am) belong to the previous civil day —
 * e.g. an Examen prayed at Wed 1am still belongs to Tuesday.
 *
 * The returned Date is the midnight (start) of the logical day in local time.
 */
export function logicalDay(now: Date, cutoffHour = DEFAULT_CUTOFF_HOUR): Date {
  const civil = startOfDay(now)
  if (now.getHours() < cutoffHour) return subDays(civil, 1)
  return civil
}
