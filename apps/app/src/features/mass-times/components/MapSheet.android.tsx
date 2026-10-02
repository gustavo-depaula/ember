import { type ReactNode, useEffect } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

/** How far up the sheet rides: just its search field, half the screen, or all of it. */
export type SheetDetent = 'peek' | 'half' | 'full'

// Grabber, search row and the filter chips: at rest the sheet still filters the
// map. (iOS stops at the search row; its chips would sit under the home bar.)
const peekHeight = 152
const halfFraction = 0.55
// Fully up, the sheet stops short of the screen's back button — a native iOS
// sheet covers it, but here it is drawn above the sheet.
const topGap = 60
const grabberZone = 28
const sheetSpring = { damping: 24, stiffness: 240, mass: 0.9 }
// How far a flick carries the sheet past where the finger let go, in seconds of its velocity.
const flickReach = 0.15

/**
 * A live map with a sheet that never leaves riding over it. Material's own
 * sheets are modal — they dim and block what lies behind — so this one is
 * drawn here: the map fills the screen and stays live, and the sheet slides
 * over it between three rests.
 *
 * Short of the top a vertical drag anywhere on the sheet moves it, so its lists
 * scroll only once it is fully up; there the grabber alone drags it back down.
 */
export function MapSheet({
  map,
  detent,
  onDetent,
  children,
}: {
  map: ReactNode
  detent: SheetDetent
  onDetent: (detent: SheetDetent) => void
  children: ReactNode
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()

  // The sheet is laid out at its full height and slid down by `offset`; each rest is how far.
  const fullHeight = windowHeight - insets.top - topGap
  const peekOffset = fullHeight - (peekHeight + insets.bottom)
  const halfOffset = fullHeight - windowHeight * halfFraction
  const restOffset = detent === 'full' ? 0 : detent === 'half' ? halfOffset : peekOffset

  const offset = useSharedValue(restOffset)
  const dragStart = useSharedValue(0)

  useEffect(() => {
    offset.value = withSpring(restOffset, sheetSpring)
  }, [restOffset, offset])

  const drag = () =>
    Gesture.Pan()
      // Leaves taps to the rows and fields, and sideways swipes to the filter chips.
      .activeOffsetY([-10, 10])
      .failOffsetX([-24, 24])
      .onBegin(() => {
        dragStart.value = offset.value
      })
      .onUpdate((e) => {
        offset.value = Math.min(Math.max(dragStart.value + e.translationY, 0), peekOffset)
      })
      .onEnd((e) => {
        const landing = offset.value + e.velocityY * flickReach
        const rests: [SheetDetent, number][] = [
          ['full', 0],
          ['half', halfOffset],
          ['peek', peekOffset],
        ]
        let nearest = rests[0]
        for (const rest of rests) {
          if (Math.abs(rest[1] - landing) < Math.abs(nearest[1] - landing)) nearest = rest
        }
        offset.value = withSpring(nearest[1], sheetSpring)
        runOnJS(onDetent)(nearest[0])
      })

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }))

  return (
    <View style={styles.fill}>
      {map}
      <Animated.View
        style={[
          styles.sheet,
          { top: insets.top + topGap, height: fullHeight, backgroundColor: theme.background.val },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={drag()}>
          <View
            style={styles.grabberZone}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <View style={[styles.grabber, { backgroundColor: theme.borderColor.val }]} />
          </View>
        </GestureDetector>
        <GestureDetector gesture={drag().enabled(detent !== 'full')}>
          <View style={styles.fill}>{children}</View>
        </GestureDetector>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 16,
  },
  grabberZone: { height: grabberZone, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 36, height: 5, borderRadius: 3 },
})
