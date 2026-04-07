import type { ReactNode } from 'react'
import { Pressable, type PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import { calmSpring, pressOpacity, pressScale } from '@/config/animation'

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

export function AnimatedPressable({
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableProps & { children: ReactNode }) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <AnimatedPressableBase
      {...props}
      style={[animatedStyle, typeof style === 'function' ? undefined : style]}
      onPressIn={(e) => {
        scale.value = withSpring(pressScale, calmSpring)
        opacity.value = withSpring(pressOpacity, calmSpring)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, calmSpring)
        opacity.value = withSpring(1, calmSpring)
        onPressOut?.(e)
      }}
    >
      {children}
    </AnimatedPressableBase>
  )
}
