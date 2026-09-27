import { addDays, format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import type { SharedValue } from 'react-native-reanimated'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

import { snappySpring } from '@/config/animation'
import { lightTap } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'

// Swipe distance per day, and the line the title sets on.
const itemSize = 58
const lineHeight = 60
const span = 60
// The selected day sits full size; the days after it trail off smaller and
// tighter, a caption to the date rather than a row of equals.
const firstGap = 48
const trailStep = 31
const trailScale = 0.6

/**
 * Today's title, which is also its time travel: "Setembro 27 28 29", the
 * coming days fading off to the right and the past hidden behind the month.
 * Swiping walks through the days; away from today the chosen day turns gold,
 * and tapping it comes home.
 */
export function DateScrubber({
  today,
  onSelectDate,
}: {
  today: string
  onSelectDate: (date: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const days = useMemo(
    () => Array.from({ length: span * 2 + 1 }, (_, i) => addDays(parseISO(today), i - span)),
    [today],
  )
  // Formatted up front: the reaction below runs on the UI thread.
  const keys = useMemo(() => days.map((d) => format(d, 'yyyy-MM-dd')), [days])
  const [index, setIndex] = useState(span)
  const offsetX = useSharedValue(-span * itemSize)
  const startX = useSharedValue(0)
  const minOffset = -(days.length - 1) * itemSize

  const snap = (to: number) => {
    'worklet'
    offsetX.value = withSpring(
      clamp(Math.round(to / itemSize) * itemSize, minOffset, 0),
      snappySpring,
    )
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable refs
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .onStart(() => {
          startX.value = offsetX.value
        })
        .onUpdate((e) => {
          offsetX.value = clamp(startX.value + e.translationX, minOffset, 0)
        })
        .onEnd((e) => {
          offsetX.value = withDecay(
            { velocity: e.velocityX, deceleration: 0.997, clamp: [minOffset, 0] },
            () => snap(offsetX.value),
          )
        })
        // On web a pointer leaving the detector cancels without onEnd.
        .onFinalize((_e, success) => {
          if (!success) snap(offsetX.value)
        }),
    [minOffset],
  )

  useAnimatedReaction(
    () => clamp(Math.round(-offsetX.value / itemSize), 0, days.length - 1),
    (current, previous) => {
      if (previous === null || current === previous) return
      runOnJS(lightTap)()
      runOnJS(setIndex)(current)
      runOnJS(onSelectDate)(keys[current])
    },
    [keys, onSelectDate],
  )

  const month = formatLocalized(days[index], 'MMMM').replace(/^\w/, (c) => c.toUpperCase())
  const away = index !== span
  const color = theme.color.val

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.row}>
        <Text style={[styles.title, { color }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {month}{' '}
        </Text>
        <View style={styles.slot}>
          {days.map((date, i) => (
            <DayItem
              key={keys[i]}
              index={i}
              date={date}
              offsetX={offsetX}
              color={i === index && away ? theme.accent.val : color}
              label={i === index && away ? t('a11y.goToToday') : undefined}
              onTap={() => snap(-(i === index ? span : i) * itemSize)}
            />
          ))}
        </View>
      </View>
    </GestureDetector>
  )
}

function DayItem({
  index,
  date,
  offsetX,
  color,
  label,
  onTap,
}: {
  index: number
  date: Date
  offsetX: SharedValue<number>
  color: string
  label?: string
  onTap: () => void
}) {
  const place = useAnimatedStyle(() => {
    const d = index + offsetX.value / itemSize
    const x = d <= 0 ? d * itemSize : d <= 1 ? d * firstGap : firstGap + (d - 1) * trailStep
    return { transform: [{ translateX: x }] }
  })
  const look = useAnimatedStyle(() => {
    const d = index + offsetX.value / itemSize
    return {
      opacity:
        d >= 0
          ? interpolate(d, [0, 1, 2, 3, 4, 5], [1, 0.4, 0.25, 0.14, 0.06, 0])
          : interpolate(-d, [0, 0.5, 1], [1, 0.3, 0]),
      transform: [{ scale: interpolate(Math.abs(d), [0, 1], [1, trailScale], 'clamp') }],
    }
  })

  return (
    <Animated.View style={[styles.day, place]}>
      <Pressable
        onPress={onTap}
        accessibilityRole="button"
        accessibilityLabel={label ?? formatLocalized(date, 'EEEE, d MMMM')}
      >
        <Animated.Text
          style={[styles.title, styles.dayNumber, { color }, look]}
          maxFontSizeMultiplier={1.2}
        >
          {date.getDate()}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: lineHeight,
    overflow: 'hidden',
  },
  slot: {
    width: itemSize,
    height: lineHeight,
  },
  day: {
    position: 'absolute',
    left: 0,
    height: lineHeight,
  },
  title: {
    fontFamily: 'Junicode_Italic',
    fontSize: 46,
    lineHeight,
  },
  // The trailing days shrink toward the title's vertical middle.
  dayNumber: {
    transformOrigin: ['0%', '50%', 0],
  },
})
