import type { ReactNode, RefObject } from 'react'
import { type ScrollView as NativeScrollView, RefreshControl } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

import { type PageMeasure, pageGutter, pageOuterWidth } from '@/lib/layout'

import { GlassBackdrop } from './glassBackdrop'
import { PageWidth, useFrameWidth } from './pageWidth'
import { useBottomClearance } from './tabAccessory'

const scrollContentStyle = { flexGrow: 1 }
const fill = { flex: 1 }

export function ScreenLayout({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  modal = false,
  measure = 'column',
  scrollRef,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
  /** fullScreenModal route — the modal covers the tab bar and the
   * now-playing accessory, so skip the manual bottom clearance. Without
   * this, modals reserve ~128pt of empty padding at the bottom. */
  modal?: boolean
  /** `wide` lets a hub, shelf or split page leave the reading column on a
   * wide window; on a phone the two are the same page. */
  measure?: PageMeasure
  /** The page's own scroller, for a rail or an index that jumps within it. */
  scrollRef?: RefObject<NativeScrollView | null>
}) {
  const insets = useSafeAreaInsets()
  const outerWidth = pageOuterWidth(useFrameWidth(), measure)
  const gutter = padded ? pageGutter : 16
  const tabClearance = useBottomClearance()
  // The tabs disable automatic content insets so this manual padding is the
  // single source of truth (lets the home flourish bleed into the notch).
  const bottomClearance = modal ? 0 : tabClearance

  const inner = (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingLeft={insets.left}
      paddingRight={insets.right}
      paddingBottom={insets.bottom + bottomClearance}
    >
      <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
        <YStack
          flex={1}
          width="100%"
          maxWidth={outerWidth}
          alignSelf="center"
          paddingHorizontal={gutter}
        >
          <PageWidth width={outerWidth - gutter * 2}>{children}</PageWidth>
        </YStack>
      </Animated.View>
    </YStack>
  )

  if (!scroll) return <GlassBackdrop style={fill}>{inner}</GlassBackdrop>

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
  ) : undefined

  return (
    <GlassBackdrop style={fill}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {/* Keyboard handling belongs to the KeyboardAvoidingView alone. Do NOT
          add `automaticallyAdjustKeyboardInsets` here: on the new architecture
          RN's inset bookkeeping leaks — keyboard events from other surfaces
          (the iOS 26 search tab's field, sheets) leave a phantom bottom
          contentInset on every mounted tab ScrollView, letting users scroll
          far past the content into a void they can't obviously escape. */}
        <ScrollView
          ref={scrollRef}
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
    </GlassBackdrop>
  )
}
