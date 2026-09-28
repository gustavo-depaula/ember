import { useIsFocused } from 'expo-router'
import { useEffect, useState } from 'react'

/**
 * NativeTabs mounts every tab at launch, so an unvisited tab's whole tree —
 * render, commit, queries — would compete with Today for the JS thread and
 * hold the splash. A tab root waits until it is focused or the JS thread first
 * goes idle (so a later switch still finds it rendered), then stays mounted.
 */
export function useDeferredTabMount(): boolean {
  const focused = useIsFocused()
  const [ready, setReady] = useState(focused)

  useEffect(() => {
    if (ready) return
    if (focused) {
      setReady(true)
      return
    }
    // Safari has no requestIdleCallback.
    if (typeof requestIdleCallback !== 'function') {
      const timer = setTimeout(() => setReady(true), 1500)
      return () => clearTimeout(timer)
    }
    const handle = requestIdleCallback(() => setReady(true), { timeout: 3000 })
    return () => cancelIdleCallback(handle)
  }, [focused, ready])

  return ready || focused
}
