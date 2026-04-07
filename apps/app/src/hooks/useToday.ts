import { parseISO } from 'date-fns'

import { normalizeDate } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Returns the "current" date, respecting the time-travel override from settings.
 * Use this instead of `new Date()` for all display and liturgical logic.
 */
export function useToday(): Date {
  const timeTravelDate = usePreferencesStore((s) => s.timeTravelDate)
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return normalizeDate(new Date())
}

/** Non-hook version for use outside React components */
export function getToday(): Date {
  const timeTravelDate = usePreferencesStore.getState().timeTravelDate
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return normalizeDate(new Date())
}
