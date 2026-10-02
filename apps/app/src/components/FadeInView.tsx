import type { ReactNode } from 'react'
import { Platform } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

import { fadeDuration, staggerDelay } from '@/config/animation'

// Declarative entering animation (not a hand-driven shared value): native-screen
// reattachment under NativeTabs re-initializes shared values to their starting
// value, which would strand a manual opacity at 0 and blank the content.
//
// Web gets a plain preset: Reanimated's web cleanup for a custom-named entering
// animation (which `withInitialValues` creates) pins the view with `position:
// absolute` at its snapshot once it ends, pulling it out of the column so the
// blocks below slide up underneath it.
const entering = (index: number) =>
  Platform.OS === 'web'
    ? FadeIn.delay(index * staggerDelay).duration(fadeDuration)
    : FadeInDown.delay(index * staggerDelay)
        .duration(fadeDuration)
        .withInitialValues({ transform: [{ translateY: 6 }] })

export function FadeInView({ index = 0, children }: { index?: number; children: ReactNode }) {
  return <Animated.View entering={entering(index)}>{children}</Animated.View>
}
