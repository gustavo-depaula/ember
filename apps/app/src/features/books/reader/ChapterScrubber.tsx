import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { Text } from 'tamagui'

import { GlassSurface } from '@/components/GlassSurface'

const PILL_HEIGHT = 48
const THUMB_SIZE = 14
const TRACK_HEIGHT = 3
const TICK_WIDTH = 2
const TICK_HEIGHT = 10
const SIDE_PADDING = 14

type Props = {
  /** Current chapter-fraction 0..1 from the live reader state. */
  fraction: number
  /** Foliate's total page count for the current chapter (sentinel-inclusive). */
  pages: number
  /** Foliate's 1-indexed current page within chapter. */
  page: number
  color: string
  isDark: boolean
  /** Bookmark fractions in the current chapter; rendered as ticks on the track. */
  bookmarkFractions?: number[]
  onScrub: (fraction: number) => void
  onScrubEnd: (fraction: number) => void
}

export function ChapterScrubber({
  fraction,
  pages,
  page,
  color,
  isDark,
  bookmarkFractions,
  onScrub,
  onScrubEnd,
}: Props) {
  const { t } = useTranslation()
  const [trackWidth, setTrackWidth] = useState(0)
  // Foliate's `pages` includes 2 sentinel pages; show the human-visible total.
  const visiblePages = Math.max(1, pages - 2)

  const dragFraction = useSharedValue(fraction)
  const isDragging = useSharedValue(false)
  const lastReportedPage = useSharedValue(page)

  const [previewPage, setPreviewPage] = useState(page)

  // Sync prop changes into the shared value while the user is not dragging.
  // During a drag, the gesture owns the position.
  useEffect(() => {
    if (!isDragging.value) {
      dragFraction.value = fraction
      setPreviewPage(page)
    }
  }, [fraction, page, dragFraction, isDragging])

  const thumbStyle = useAnimatedStyle(() => {
    const usable = Math.max(0, trackWidth - THUMB_SIZE)
    return { transform: [{ translateX: clamp(dragFraction.value, 0, 1) * usable }] }
  })

  const fillStyle = useAnimatedStyle(() => ({
    width: clamp(dragFraction.value, 0, 1) * trackWidth,
  }))

  // Bridge UI-thread fraction → JS-thread preview page, only when the integer
  // page changes (avoids a setState every frame during drag).
  useAnimatedReaction(
    () => Math.max(1, Math.min(visiblePages, Math.ceil(dragFraction.value * visiblePages) || 1)),
    (current, previous) => {
      if (previous === null || current !== previous) {
        lastReportedPage.value = current
        runOnJS(setPreviewPage)(current)
      }
    },
  )

  const pan = Gesture.Pan()
    // Only own horizontal motion; surrender vertical to the modal-dismiss gesture.
    .activeOffsetX([-5, 5])
    .failOffsetY([-12, 12])
    .onBegin((e) => {
      isDragging.value = true
      const f = trackWidth > 0 ? clamp(e.x / trackWidth, 0, 1) : 0
      dragFraction.value = f
      runOnJS(onScrub)(f)
    })
    .onUpdate((e) => {
      const f = trackWidth > 0 ? clamp(e.x / trackWidth, 0, 1) : 0
      dragFraction.value = f
      runOnJS(onScrub)(f)
    })
    .onEnd(() => {
      isDragging.value = false
      runOnJS(onScrubEnd)(clamp(dragFraction.value, 0, 1))
    })
    .onFinalize(() => {
      isDragging.value = false
    })

  const tintColor = isDark ? 'rgba(28,26,24,0.6)' : 'rgba(244,240,234,0.7)'

  return (
    <GlassSurface
      isDark={isDark}
      tintColor={tintColor}
      style={[styles.pill, { height: PILL_HEIGHT }]}
    >
      <GestureDetector gesture={pan}>
        <View
          style={styles.gestureZone}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.track, { backgroundColor: color, opacity: 0.15 }]} />
          <Animated.View
            style={[styles.fill, fillStyle, { backgroundColor: color, opacity: 0.45 }]}
          />
          {bookmarkFractions?.map((f) => (
            <View
              key={f}
              pointerEvents="none"
              style={[
                styles.tick,
                {
                  left: Math.max(0, Math.min(trackWidth - 2, f * trackWidth - 1)),
                  backgroundColor: color,
                  top: PILL_HEIGHT / 2 - TICK_HEIGHT / 2,
                },
              ]}
            />
          ))}
          <Animated.View
            style={[
              styles.thumb,
              thumbStyle,
              {
                backgroundColor: color,
                top: PILL_HEIGHT / 2 - THUMB_SIZE / 2,
              },
            ]}
          />
        </View>
      </GestureDetector>
      <Text
        fontFamily="$body"
        fontSize="$1"
        color={color}
        opacity={0.6}
        style={styles.label}
        numberOfLines={1}
      >
        {t('books.pageOfTotal', {
          defaultValue: '{{page}} / {{total}}',
          page: previewPage,
          total: visiblePages,
        })}
      </Text>
    </GlassSurface>
  )
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    overflow: 'hidden',
    paddingHorizontal: SIDE_PADDING,
  },
  gestureZone: {
    flex: 1,
    height: PILL_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    width: '100%',
  },
  fill: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    left: 0,
  },
  tick: {
    position: 'absolute',
    width: TICK_WIDTH,
    height: TICK_HEIGHT,
    borderRadius: 1,
    opacity: 0.65,
  },
  label: {
    minWidth: 56,
    marginLeft: 10,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
})
