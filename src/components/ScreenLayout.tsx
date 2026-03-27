import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

const scrollContentStyle = { flexGrow: 1 }

export function ScreenLayout({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
}) {
  const insets = useSafeAreaInsets()
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 })
  }, [opacity])

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const inner = (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <Animated.View style={[{ flex: 1 }, fadeStyle]}>
        <YStack
          flex={1}
          width="100%"
          maxWidth={640}
          alignSelf="center"
          paddingHorizontal={padded ? '$lg' : '$md'}
        >
          {children}
        </YStack>
      </Animated.View>
    </YStack>
  )

  if (!scroll) return inner

  return (
    <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={scrollContentStyle}>
      {inner}
    </ScrollView>
  )
}
