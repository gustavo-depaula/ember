import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import { columnWidth, pageGutter, wideWidth } from '@/lib/layout'

import { FrameWidth, useFrameWidth, useWidthClass } from './pageWidth'
import { useBottomClearance } from './tabAccessory'

// The website's reading page: a rail of contents, the text in its column, a
// rail of tools.
const leftRail = 220
const rightRail = 240
const railGap = 48

/**
 * A reading page on a wide window: the text keeps its measure in the middle
 * while a rail either side holds what a phone keeps in sheets — where you are
 * in the text, and how it is set. The rails stay put as the text scrolls.
 * Below the `rails` width the frame is not there at all and the page is the
 * phone's.
 */
export function ReaderFrame({
  left,
  right,
  children,
}: {
  left?: ReactNode
  right?: ReactNode
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { rails } = useWidthClass()
  const frame = useFrameWidth()
  if (!rails) return children

  const outer = Math.min(frame, wideWidth + pageGutter * 2)
  const middle = Math.min(outer - pageGutter * 2 - leftRail - rightRail - railGap * 2, columnWidth)
  const railStyle = {
    paddingTop: insets.top + 96,
    paddingBottom: insets.bottom + bottomClearance + pageGutter,
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingLeft={insets.left}
      paddingRight={insets.right}
    >
      <XStack
        flex={1}
        width="100%"
        maxWidth={outer}
        alignSelf="center"
        paddingHorizontal={pageGutter}
        justifyContent="space-between"
      >
        <ScrollView
          style={{ flexGrow: 0, width: leftRail }}
          contentContainerStyle={railStyle}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          {left}
        </ScrollView>
        <YStack width={middle}>
          <FrameWidth width={middle}>{children}</FrameWidth>
        </YStack>
        <ScrollView
          style={{ flexGrow: 0, width: rightRail }}
          contentContainerStyle={railStyle}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          {right}
        </ScrollView>
      </XStack>
    </YStack>
  )
}
