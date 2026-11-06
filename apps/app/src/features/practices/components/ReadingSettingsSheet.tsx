import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, useTheme, YStack } from 'tamagui'

import { ReadingConfig } from '@/components'
import { pullDown } from '@/components/NativeSheet'

// Single fixed detent. The RN ScrollView inside a native SwiftUI sheet only
// scrolls when its frame is height-bounded — `flex` alone gets no bound from the
// native host — so we give the content an explicit height matching the snap.
const sheetFraction = 0.9

/**
 * How the praying experience is set (type, size, spacing, margins), in the native
 * `@expo/ui` bottom sheet. `open` drives the snap index; swipe-down / backdrop
 * tap calls `onClose`.
 */
export function ReadingSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} width="100%" paddingHorizontal="$lg" paddingTop="$md">
        <ScrollView
          {...pullDown(onClose)}
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        >
          <ReadingConfig />
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}
