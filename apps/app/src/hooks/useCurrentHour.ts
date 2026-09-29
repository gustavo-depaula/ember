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

/** Minutes since local midnight, re-rendering as each minute turns. */
export function useMinuteOfDay(): number {
  const [minute, setMinute] = useState(clockMinute)
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    const tick = () => {
      setMinute(clockMinute())
      id = setTimeout(tick, 60_000 - (Date.now() % 60_000))
    }
    id = setTimeout(tick, 60_000 - (Date.now() % 60_000))
    return () => clearTimeout(id)
  }, [])
  return minute
}

function clockMinute(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}
