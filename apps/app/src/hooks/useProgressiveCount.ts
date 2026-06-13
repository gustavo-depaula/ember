import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

/**
 * Progressively grow a render count so long lists of heavy components mount
 * in chunks instead of all at once. Practice screens (Mass, offices) render
 * hundreds of nested Tamagui primitives; mounting them synchronously on
 * navigation blocks the JS thread for the whole transition.
 *
 * Chunks are scheduled after interactions + a frame, so each increment lands
 * between frames and appends below the fold — already-mounted items keep
 * their position and never remount (callers must slice a stable array prefix
 * with stable keys).
 *
 * Resets when `resetKey` changes identity (e.g. the sections array after a
 * language switch). Note: chunking is top-level only — a flow that is one
 * giant `container` primitive won't benefit.
 */
export function useProgressiveCount(
  total: number,
  resetKey: unknown,
  initial = 16,
  step = 24,
): number {
  const [visible, setVisible] = useState(() => Math.min(initial, total))

  const [prevKey, setPrevKey] = useState(resetKey)
  if (prevKey !== resetKey) {
    setPrevKey(resetKey)
    setVisible(Math.min(initial, total))
  }

  useEffect(() => {
    if (visible >= total) return
    let cancelled = false
    let raf: number | undefined
    const handle = InteractionManager.runAfterInteractions(() => {
      raf = requestAnimationFrame(() => {
        if (!cancelled) setVisible((v) => Math.min(v + step, total))
      })
    })
    return () => {
      cancelled = true
      handle.cancel()
      if (raf !== undefined) cancelAnimationFrame(raf)
    }
  }, [visible, total, step])

  return Math.min(visible, total)
}
