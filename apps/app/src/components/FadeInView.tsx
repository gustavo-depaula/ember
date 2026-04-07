import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { fadeDuration, staggerDelay } from '@/config/animation'

export function FadeInView({ index = 0, children }: { index?: number; children: ReactNode }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(index * staggerDelay, withTiming(1, { duration: fadeDuration }))
  }, [index, progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [6, 0]) }],
  }))

  return <Animated.View style={style}>{children}</Animated.View>
}
