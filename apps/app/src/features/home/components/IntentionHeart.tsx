import { Heart } from 'lucide-react-native'
import { useEffect } from 'react'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

export function IntentionHeart({ active, size = 22 }: { active: boolean; size?: number }) {
  const theme = useTheme()
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (!active) {
      cancelAnimation(opacity)
      opacity.value = withTiming(0.55, { duration: 400 })
      return
    }
    opacity.value = withRepeat(
      withTiming(0.55, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
    return () => cancelAnimation(opacity)
  }, [active, opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={style}>
      <Heart size={size} color={theme.accent?.val} fill={active ? theme.accent?.val : undefined} />
    </Animated.View>
  )
}
