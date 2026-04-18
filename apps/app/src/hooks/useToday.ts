import { normalizeDate } from '@ember/liturgical'
import { parseISO } from 'date-fns'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Returns today's date normalized to midnight, respecting the time-travel
 * override from settings. Use for day-level logic: liturgical day, date keys,
 * calendar grids, day-rotations.
 *
 * Do NOT call `.getHours()` / `.getMinutes()` on the result — it is always
 * midnight, so hour-math silently reads as 0. For time-of-day (Angelus bells,
 * meal windows, evening whispers), use `new Date()` with a `setInterval` for
 * reactivity. See `features/angelus/hooks.ts` for the pattern.
 */
export function useToday(): Date {
  const timeTravelDate = usePreferencesStore((s) => s.timeTravelDate)
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return normalizeDate(new Date())
}

/** Non-hook version of {@link useToday}. Same midnight-only caveat applies. */
export function getToday(): Date {
  const timeTravelDate = usePreferencesStore.getState().timeTravelDate
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return normalizeDate(new Date())
}
