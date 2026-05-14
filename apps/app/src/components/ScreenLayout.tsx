import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

import { useNowPlayingClearance } from '@/stores/creatorsStore'

const scrollContentStyle = { flexGrow: 1 }

export function ScreenLayout({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /** Pull-to-refresh: when provided, the scroll view shows a RefreshControl. */
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
}) {
  const insets = useSafeAreaInsets()
  const nowPlayingClearance = useNowPlayingClearance()
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
      paddingBottom={insets.bottom + nowPlayingClearance}
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

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
  ) : undefined

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        flex={1}
        backgroundColor="$background"
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        refreshControl={refreshControl}
      >
        {inner}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
