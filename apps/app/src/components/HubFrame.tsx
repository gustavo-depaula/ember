import type { ReactNode } from 'react'
import { ScrollView, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import { pageGutter, pageOuterWidth } from '@/lib/layout'

import { PageWidth, useWidthClass } from './pageWidth'
import { useBottomClearance } from './tabAccessory'

const indexWidth = 200
// With the list's own gutter this makes the 56pt the website sets between the two.
const indexGap = 32

/**
 * A catalogue page: the list fills the wide measure, and once there is room
 * its index stands down the left side instead of across the top. The index
 * stays put while the list scrolls. The child is the page's own scroller and
 * pads itself (`pageGutter` each side); it reads its width from `usePageWidth`.
 */
export function HubFrame({ index, children }: { index?: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { expanded } = useWidthClass()
  const bottomClearance = useBottomClearance()
  const outer = pageOuterWidth(width - insets.left - insets.right, 'wide')
  const showIndex = expanded && !!index
  const mainOuter = showIndex ? outer - pageGutter - indexWidth - indexGap : outer

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingLeft={insets.left}
      paddingRight={insets.right}
    >
      <XStack flex={1} width="100%" maxWidth={outer} alignSelf="center">
        {showIndex && (
          <ScrollView
            style={{ flexGrow: 0, width: pageGutter + indexWidth + indexGap }}
            contentContainerStyle={{
              paddingLeft: pageGutter,
              paddingRight: indexGap,
              paddingTop: insets.top + 120,
              paddingBottom: insets.bottom + bottomClearance + pageGutter,
            }}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
          >
            {index}
          </ScrollView>
        )}
        <YStack flex={1}>
          <PageWidth width={mainOuter - pageGutter * 2}>{children}</PageWidth>
        </YStack>
      </XStack>
    </YStack>
  )
}

/** Whether `HubFrame` is showing its index at this window width. */
export function useHubIndexShown(): boolean {
  return useWidthClass().expanded
}
