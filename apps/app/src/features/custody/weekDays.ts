import type { Schedule } from './types'

// Days are JS-native: 0=Sun, 1=Mon … 6=Sat. UI orders them Mon-first per Opal /
// most calendar apps; the schedule struct holds them in JS-native order.
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon-first
export const WEEK_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function selectedDays(schedule: Schedule): number[] {
  if (schedule.type === 'days-of-week') return schedule.days
  return ALL_DAYS
}

export function scheduleFromDays(days: number[], existing: Schedule): Schedule {
  const seasons = existing.seasons
  // 7 selected = daily (cleaner than "days-of-week with all seven"); 0 selected
  // stays as days-of-week with empty array so the editor can surface a 'pick at
  // least one day' state instead of silently flipping back to daily.
  if (days.length === 7) {
    return seasons ? { type: 'daily', seasons } : { type: 'daily' }
  }
  return seasons ? { type: 'days-of-week', days, seasons } : { type: 'days-of-week', days }
}
