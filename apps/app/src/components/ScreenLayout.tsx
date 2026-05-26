import type { ReactNode } from 'react'
import { RefreshControl } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

import { useNowPlayingClearance } from '@/stores/creatorsStore'

const scrollContentStyle = { flexGrow: 1 }
// Native iOS 26 glass tab bar content height + breathing room, so the last
// scroll item clears the bar on tab screens.
const nativeTabBarClearance = 56

export function ScreenLayout({
  children,
  scroll = true,
  padded = true,
  tabBar = false,
  refreshing,
  onRefresh,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /**
   * Set on screens hosted directly by the native tab bar. Reserves bottom
   * clearance for the bar and makes ScreenLayout's manual safe-area padding
   * authoritative (NativeTabs otherwise auto-adjusts the scroll content inset,
   * which double-pads and pushes notch-bleeding decorations down).
   */
  tabBar?: boolean
  /** Pull-to-refresh: when provided, the scroll view shows a RefreshControl. */
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
}) {
  const insets = useSafeAreaInsets()
  const nowPlayingClearance = useNowPlayingClearance()
  const bottomClearance = (tabBar ? nativeTabBarClearance : 0) + nowPlayingClearance

  const inner = (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom + bottomClearance}
    >
      <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        flex={1}
        backgroundColor="$background"
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior={tabBar ? 'never' : undefined}
        refreshControl={refreshControl}
      >
        {inner}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
