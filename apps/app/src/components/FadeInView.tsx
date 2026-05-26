import type { ReactNode } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { fadeDuration, staggerDelay } from '@/config/animation'

// Declarative entering animation (not a hand-driven shared value): native-screen
// reattachment under NativeTabs re-initializes shared values to their starting
// value, which would strand a manual opacity at 0 and blank the content.
export function FadeInView({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * staggerDelay)
        .duration(fadeDuration)
        .withInitialValues({ transform: [{ translateY: 6 }] })}
    >
      {children}
    </Animated.View>
  )
}
