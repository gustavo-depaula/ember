import { logicalDay, normalizeDate } from '@ember/liturgical'
import { parseISO } from 'date-fns'
import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import { AppState } from 'react-native'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Returns today's date for the whole app, anchored to a single rule:
 * **a new day starts at 4am, not midnight**. From civil-midnight to 4am the
 * app still reports "yesterday" — the user is mentally on last night until
 * they sleep. After 4am it advances to the new civil day.
 *
 * The cutoff is applied to the live clock only. Settings' time travel honors
 * the user-picked date as-is — that's an explicit "pretend it's this day"
 * request, not a wall-clock observation.
 *
 * This is the day things are recorded, won and begun on. The day Today's date
 * scrubber shows is {@link useViewedDay}, read only by what displays a day.
 *
 * Result is midnight (start) of the logical day in local time. Do NOT call
 * `.getHours()` / `.getMinutes()` on it — it's always 0/0, so hour-math
 * silently reads as 0. For time-of-day (Angelus bells, meal windows,
 * evening whispers) use `useCurrentHour`.
 */
export function useToday(): Date {
  const travelled = usePreferencesStore((s) => s.timeTravelDate)
  const live = useSyncExternalStore(subscribeToDay, liveDay, liveDay)
  if (travelled) return normalizeDate(parseISO(travelled))
  return live
}

/**
 * The day Today's date scrubber has moved to, provided over Today's own tree
 * (`'yyyy-MM-dd'`); absent off Today, and on today itself.
 */
export const ViewedDayContext = createContext<string | undefined>(undefined)

/**
 * The day the screen shows: on Today, the day its scrubber has moved to;
 * elsewhere, today. For what a day *displays* — its liturgy, its plan, its
 * cards. Never record, grant or begin anything by it: that is
 * {@link useToday}'s day, so a look at another day can't change the record.
 */
export function useViewedDay(): Date {
  const viewed = useContext(ViewedDayContext)
  const today = useToday()
  return useMemo(() => (viewed ? normalizeDate(parseISO(viewed)) : today), [viewed, today])
}

// The live logical day, shared by every `useToday` so an app left open rolls
// over at the cutoff instead of showing yesterday until something happens to
// re-render. The same Date object is handed out for the whole day, as
// useSyncExternalStore requires of a snapshot.
let day = logicalDay(new Date())
const dayListeners = new Set<() => void>()
let stopWatchingDay: (() => void) | undefined

function liveDay(): Date {
  const next = logicalDay(new Date())
  if (next.getTime() !== day.getTime()) day = next
  return day
}

function subscribeToDay(listener: () => void): () => void {
  dayListeners.add(listener)
  if (!stopWatchingDay) stopWatchingDay = watchDay()
  return () => {
    dayListeners.delete(listener)
    if (dayListeners.size > 0) return
    stopWatchingDay?.()
    stopWatchingDay = undefined
  }
}

function watchDay(): () => void {
  const check = () => {
    const before = day
    if (liveDay() === before) return
    for (const listener of dayListeners) listener()
  }
  // A minute tick rather than one timer aimed at the cutoff: it also follows a
  // clock or timezone change. Timers are suspended while the app is in the
  // background, so returning to the foreground checks at once.
  const id = setInterval(check, 60_000)
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') check()
  })
  return () => {
    clearInterval(id)
    sub.remove()
  }
}

/** Non-hook version of {@link useToday}. Same 4am-cutoff + midnight caveat. */
export function getToday(): Date {
  const travelled = usePreferencesStore.getState().timeTravelDate
  if (travelled) return normalizeDate(parseISO(travelled))
  return logicalDay(new Date())
}
