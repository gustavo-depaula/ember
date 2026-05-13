import { logicalDay, normalizeDate } from '@ember/liturgical'
import { parseISO } from 'date-fns'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Returns today's date for the whole app, anchored to a single rule:
 * **a new day starts at 4am, not midnight**. From civil-midnight to 4am the
 * app still reports "yesterday" — the user is mentally on last night until
 * they sleep. After 4am it advances to the new civil day.
 *
 * The cutoff is applied to the live clock only. Time-travel honors the
 * user-picked date as-is — that's an explicit "pretend it's this day"
 * request, not a wall-clock observation.
 *
 * Result is midnight (start) of the logical day in local time. Do NOT call
 * `.getHours()` / `.getMinutes()` on it — it's always 0/0, so hour-math
 * silently reads as 0. For time-of-day (Angelus bells, meal windows,
 * evening whispers) use `new Date()` with a `setInterval` for reactivity.
 * See `features/angelus/hooks.ts` for the pattern.
 */
export function useToday(): Date {
  const timeTravelDate = usePreferencesStore((s) => s.timeTravelDate)
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return logicalDay(new Date())
}

/** Non-hook version of {@link useToday}. Same 4am-cutoff + midnight caveat. */
export function getToday(): Date {
  const timeTravelDate = usePreferencesStore.getState().timeTravelDate
  if (timeTravelDate) return normalizeDate(parseISO(timeTravelDate))
  return logicalDay(new Date())
}
