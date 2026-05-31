import { type Href, Link } from 'expo-router'
import type { ReactNode } from 'react'

// iOS zoom-morph link source: the tapped element's bounds morph into the
// destination screen (Apple Photos / App Store style). The child must be a
// single pressable that forwards onPress + accessibility props (e.g.
// AnimatedPressable) — same shape as the NowPlayingBar / custody usages.
export function ZoomLink({
  href,
  onPress,
  children,
}: {
  href: Href
  onPress?: () => void
  children: ReactNode
}) {
  return (
    <Link href={href} push asChild onPress={onPress}>
      <Link.AppleZoom>{children}</Link.AppleZoom>
    </Link>
  )
}
