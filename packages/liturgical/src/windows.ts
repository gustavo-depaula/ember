import { addDays, endOfDay, startOfDay, subDays } from 'date-fns'

export type ResolutionLevel = 'daily'

export type ResolutionWindow = {
  starts_at: number
  ends_at: number
}

const DEFAULT_CUTOFF_HOUR = 4

export function logicalDay(now: Date, cutoffHour = DEFAULT_CUTOFF_HOUR): Date {
  const civil = startOfDay(now)
  if (now.getHours() < cutoffHour) return subDays(civil, 1)
  return civil
}

export function windowFor(
  _level: ResolutionLevel,
  anchor: Date,
  forward: 'current' | 'next' = 'next',
): ResolutionWindow {
  const base = forward === 'current' ? logicalDay(anchor) : addDays(logicalDay(anchor), 1)
  return { starts_at: base.getTime(), ends_at: endOfDay(base).getTime() }
}
