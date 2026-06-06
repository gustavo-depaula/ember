import { useEffect, useState } from 'react'

/** Debounce any value — returns the latest input after no changes for `ms`. */
export function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}
