import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from './ScreenLayout'

export function Threshold({ word, subtitle }: { word: string; subtitle?: string }) {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <ScreenLayout>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$sm" padding="$xl">
        <Animated.View style={style}>
          <Text
            fontFamily="$script"
            fontSize={'$5' as any}
            color="$accent"
            letterSpacing={2}
            textAlign="center"
          >
            {word}
          </Text>
        </Animated.View>
        {subtitle && (
          <Animated.View style={style}>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
              {subtitle}
            </Text>
          </Animated.View>
        )}
      </YStack>
    </ScreenLayout>
  )
}
