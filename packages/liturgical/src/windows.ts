import { addDays, endOfDay, startOfDay, subDays } from 'date-fns'

export type ResolutionLevel = 'daily'

export type ResolutionWindow = {
  starts_at: number
  ends_at: number
}

const DEFAULT_CUTOFF_HOUR = 4

/**
 * Map a wall-clock instant onto the logical day for spiritual practice. Times
 * before the cutoff hour (default 4am) belong to the previous civil day —
 * e.g. an Examen done at Wed 1am still reviews Tuesday's resolution.
 *
 * The returned Date is the midnight (start) of the logical day in local time.
 */
export function logicalDay(now: Date, cutoffHour = DEFAULT_CUTOFF_HOUR): Date {
  const civil = startOfDay(now)
  if (now.getHours() < cutoffHour) return subDays(civil, 1)
  return civil
}

/**
 * Compute the [starts_at, ends_at] window for a resolution at the given level.
 *
 * @param anchor The logical-day midnight to anchor against — call sites
 *   produce this with `logicalDay(now)`. Passing a wall-clock Date directly
 *   would double-apply the cutoff (the function would re-bucket midnight as
 *   "yesterday") so callers MUST pre-apply `logicalDay`.
 * @param forward `'current'` = the day of `anchor`. `'next'` = the day after.
 */
export function windowFor(
  _level: ResolutionLevel,
  anchor: Date,
  forward: 'current' | 'next' = 'next',
): ResolutionWindow {
  const base = forward === 'current' ? startOfDay(anchor) : addDays(startOfDay(anchor), 1)
  return { starts_at: base.getTime(), ends_at: endOfDay(base).getTime() }
}
