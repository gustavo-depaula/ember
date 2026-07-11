import type { ReactNode } from 'react'
import { RefreshControl } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

import { useNowPlayingClearance } from '@/stores/creatorsStore'

const scrollContentStyle = { flexGrow: 1 }
// Native iOS 26 glass tab bar content height + breathing room. Every screen is
// hosted under the tab bar now, so always reserve clearance for it.
const nativeTabBarClearance = 56

export function ScreenLayout({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  modal = false,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /** Pull-to-refresh: when provided, the scroll view shows a RefreshControl. */
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
  /** fullScreenModal route — the modal covers the tab bar and the
   * now-playing accessory, so skip the manual bottom clearance. Without
   * this, modals reserve ~128pt of empty padding at the bottom. */
  modal?: boolean
}) {
  const insets = useSafeAreaInsets()
  const nowPlayingClearance = useNowPlayingClearance()
  // The tabs disable automatic content insets so this manual padding is the
  // single source of truth (lets the home flourish bleed into the notch).
  const bottomClearance = modal ? 0 : nativeTabBarClearance + nowPlayingClearance

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
      {/* Keyboard handling belongs to the KeyboardAvoidingView alone. Do NOT
          add `automaticallyAdjustKeyboardInsets` here: on the new architecture
          RN's inset bookkeeping leaks — keyboard events from other surfaces
          (the iOS 26 search tab's field, sheets) leave a phantom bottom
          contentInset on every mounted tab ScrollView, letting users scroll
          far past the content into a void they can't obviously escape. */}
      <ScrollView
        flex={1}
        backgroundColor="$background"
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        refreshControl={refreshControl}
      >
        {inner}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
