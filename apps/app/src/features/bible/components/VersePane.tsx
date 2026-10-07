import { useMemo } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, YStack } from 'tamagui'

import { useBottomClearance } from '@/components/tabAccessory'

import { PaneBar, PaneKinds, type VersePaneProps } from './VersePaneContent'

/**
 * The lower half of the divided page, where the platform has no sheet that
 * leaves the page above it in use (Android's is modal): the page gives up
 * its lower half to it. The bar drags to give either half more room; dragged
 * to the foot, it closes. On iOS the same content rides a native sheet
 * (`VersePane.ios.tsx`).
 */
export function VersePane(props: VersePaneProps) {
  if (props.verse === undefined) return undefined
  return <DividedPane {...props} verse={props.verse} />
}

function DividedPane({
  initialHeight,
  maxHeight,
  onResize,
  onClose,
  ...content
}: VersePaneProps & { verse: number }) {
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()

  const minHeight = 120
  const height = useSharedValue(initialHeight)
  const startHeight = useSharedValue(initialHeight)
  const drag = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-6, 6])
        .onStart(() => {
          startHeight.value = height.value
        })
        .onUpdate((e) => {
          height.value = clamp(startHeight.value - e.translationY, 0, maxHeight)
        })
        .onEnd(() => {
          if (height.value < minHeight) runOnJS(onClose)()
          else runOnJS(onResize)(height.value)
        }),
    [height, startHeight, maxHeight, onClose, onResize],
  )
  const heightStyle = useAnimatedStyle(() => ({ height: height.value }))

  return (
    <Animated.View entering={FadeIn.duration(180)} style={heightStyle}>
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <GestureDetector gesture={drag}>
          <YStack paddingHorizontal="$lg" paddingTop={6}>
            <View
              alignSelf="center"
              width={36}
              height={3}
              borderRadius={2}
              backgroundColor="$borderColor"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <PaneBar {...content} onClose={onClose} />
          </YStack>
        </GestureDetector>
        <PaneKinds
          {...content}
          // The tab bar floats over the foot of the pane; the last line clears it.
          bottomPadding={insets.bottom + bottomClearance + 24}
        />
      </YStack>
    </Animated.View>
  )
}
