import { useEffect, useState } from 'react'

/**
 * Returns the real wall-clock hour (0–23), reactive to hour changes. Polls
 * every minute but only re-renders when the hour actually advances.
 *
 * Use this — not `useToday().getHours()` — for anything time-of-day: devotion
 * windows, block auto-expand, evening whispers. `useToday()` is normalized to
 * midnight, so its hour is always 0.
 */
export function useCurrentHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours())
  useEffect(() => {
    const id = setInterval(() => {
      const next = new Date().getHours()
      setHour((prev) => (prev === next ? prev : next))
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  return hour
}
