import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useTheme, YStack } from 'tamagui'

export function PrayerSpinner({ size = 10 }: { size?: number }) {
  const theme = useTheme()
  const pulse = useSharedValue(0.35)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
  }, [pulse])

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.accent?.val,
          },
          dotStyle,
        ]}
      />
    </YStack>
  )
}
