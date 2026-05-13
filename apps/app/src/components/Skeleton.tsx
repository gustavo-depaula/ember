/**
 * Pulsing block used to fill space while content loads. One primitive; layouts
 * compose it into shape-specific skeletons (cards, rows, etc).
 */

import { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { YStack } from 'tamagui'

type Props = {
  width?: number | string
  height?: number
  borderRadius?: number
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6 }: Props) {
  const opacity = useSharedValue(0.35)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 900 }), -1, true)
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={style}>
      <YStack
        // biome-ignore lint/suspicious/noExplicitAny: tamagui width type is too narrow
        width={width as any}
        height={height}
        backgroundColor="$borderColor"
        borderRadius={borderRadius}
      />
    </Animated.View>
  )
}
