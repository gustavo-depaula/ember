import { logicalDay, normalizeDate } from '@ember/liturgical'
import { parseISO } from 'date-fns'
import { useSyncExternalStore } from 'react'
import { AppState } from 'react-native'
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
 * evening whispers) use `useCurrentHour`.
 */
export function useToday(): Date {
  const ephemeral = usePreferencesStore((s) => s.timeTravelDate)
  const stable = useStableToday()
  if (ephemeral) return normalizeDate(parseISO(ephemeral))
  return stable
}

/**
 * Like {@link useToday}, but ignores the ephemeral overlay set by transient
 * UI (e.g. the day scrubber's pan-driven selection). Use this for anchors
 * that must stay put while the user scrubs — re-centering a carousel on a
 * date that moves with every snap would yank the strip under their finger.
 */
export function useStableToday(): Date {
  const persisted = usePreferencesStore((s) => s.persistedTimeTravelDate)
  const live = useSyncExternalStore(subscribeToDay, liveDay, liveDay)
  if (persisted) return normalizeDate(parseISO(persisted))
  return live
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
  const ephemeral = usePreferencesStore.getState().timeTravelDate
  if (ephemeral) return normalizeDate(parseISO(ephemeral))
  return getStableToday()
}

/** Non-hook version of {@link useStableToday}. */
export function getStableToday(): Date {
  const persisted = usePreferencesStore.getState().persistedTimeTravelDate
  if (persisted) return normalizeDate(parseISO(persisted))
  return logicalDay(new Date())
}
