import { useCallback, useState } from 'react'
import { type LayoutChangeEvent, PixelRatio, Platform } from 'react-native'

/**
 * Keeps iOS from dropping the last line of a paragraph deep in a scroll view.
 *
 * Yoga rounds a node's height to the pixel grid as `round(bottom) −
 * round(top)`, in float. Far down a long scroll both are large numbers, and a
 * five-line paragraph of 39-pt lines comes out 194.99988 tall instead of 195.
 * iOS lays text out in a container exactly the frame's size, and TextKit
 * leaves out any line that does not wholly fit — so the last line is never
 * drawn and its slot stays blank. Known upstream, unfixed in the prebuilt core
 * we ship: facebook/yoga#1860, facebook/react-native#53450.
 *
 * One device pixel of height beyond the lines is enough to absorb the error,
 * and too little to see between paragraphs.
 */
export function lastLineSlack() {
  return 1 / PixelRatio.get()
}

/**
 * The same guard for text whose line count isn't known up front: when a
 * layout comes back just short of a pixel boundary — the rounding error, never
 * a height Yoga meant — the paragraph is given a `minHeight` of that boundary
 * plus `lastLineSlack`, and lays out again with its last line.
 *
 * `key` names what the height was measured from (size, leading, face); the
 * width is tracked here. A change to either lets a stale `minHeight` go rather
 * than leaving blank space under a paragraph that has since got shorter.
 */
export function useLastLineGuard(key: string) {
  const [guard, setGuard] = useState<{ key: string; width: number; minHeight: number }>()

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (Platform.OS !== 'ios') return
      const { width, height } = e.nativeEvent.layout
      const scale = PixelRatio.get()
      const px = height * scale
      const shortBy = Math.round(px) - px
      setGuard((prev) => {
        const current = prev && prev.key === key && Math.abs(prev.width - width) <= 0.5
        // The guarded height is rounded the same way and can come back just as
        // short — of a boundary its lines already clear. Growing it again would
        // never settle.
        if (current) return prev
        if (shortBy > 0 && shortBy < 0.01) {
          return { key, width, minHeight: Math.round(px) / scale + lastLineSlack() }
        }
        return undefined
      })
    },
    [key],
  )

  return { minHeight: guard?.key === key ? guard.minHeight : undefined, onLayout }
}
