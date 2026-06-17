import type { ReactNode } from 'react'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'

const duration = 200
const stagger = 40

// The standard list-row entrance shared by the Mass Times lists: a soft fade-in (lightly staggered by
// index) with layout transitions. Pass `exiting` for rows that can be removed in place (the log).
export function AnimatedRow({
  children,
  index = 0,
  exiting = false,
}: {
  children: ReactNode
  index?: number
  exiting?: boolean
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration).delay(Math.min(index, 8) * stagger)}
      exiting={exiting ? FadeOut.duration(150) : undefined}
      layout={LinearTransition.duration(duration)}
    >
      {children}
    </Animated.View>
  )
}
