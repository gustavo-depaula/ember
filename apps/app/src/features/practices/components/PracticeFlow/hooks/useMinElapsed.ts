import { useEffect, useState } from 'react'

// Returns true once `ms` has elapsed since mount. Gates Threshold flicker
// when content loads faster than the minimum splash duration.
export function useMinElapsed(ms: number): boolean {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setElapsed(true), ms)
    return () => clearTimeout(id)
  }, [ms])
  return elapsed
}
