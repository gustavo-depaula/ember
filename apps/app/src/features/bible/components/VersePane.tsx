import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, YStack } from 'tamagui'

import { useBottomClearance } from '@/components/tabAccessory'

import { PaneBar, PaneKinds, paneFraction, type VersePaneProps } from './VersePaneContent'

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

  const { height: screenHeight } = useWindowDimensions()
  const halfHeight = Math.round(screenHeight * paneFraction)
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
        .onEnd((e) => {
          // Let go, it settles as a sheet does: at its half, drawn up tall,
          // or away, whichever the hand was making for.
          const making = height.value - e.velocityY * 0.15
          if (making < minHeight) {
            runOnJS(onClose)()
            return
          }
          const rest = making > (halfHeight + maxHeight) / 2 ? maxHeight : halfHeight
          height.value = withSpring(rest, { damping: 26, stiffness: 240, mass: 0.8 })
          runOnJS(onResize)(rest)
        }),
    [height, startHeight, halfHeight, maxHeight, onClose, onResize],
  )
  const heightStyle = useAnimatedStyle(() => ({ height: height.value }))

  return (
    <Animated.View entering={FadeIn.duration(180)} style={heightStyle}>
      <YStack
        flex={1}
        backgroundColor="$background"
        // Set off from the page as a sheet is: rounded shoulders and a soft
        // shadow cast up onto the chapter.
        borderTopLeftRadius={18}
        borderTopRightRadius={18}
        borderTopWidth={1}
        borderLeftWidth={1}
        borderRightWidth={1}
        borderColor="$borderColor"
        shadowColor="#000"
        shadowOpacity={0.12}
        shadowRadius={12}
        shadowOffset={{ width: 0, height: -4 }}
        elevation={12}
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
