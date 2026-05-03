import { addDays, format, parseISO } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import type { SharedValue } from 'react-native-reanimated'
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

import { snappySpring } from '@/config/animation'
import { lightTap } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'

const itemWidth = 30
const itemGap = 4
const itemSize = itemWidth + itemGap
const pastDays = 60
const futureDays = 60
const totalDays = pastDays + futureDays + 1
const todayIndex = pastDays
const monthGap = 6
const lineHeight = 32

export function DateScrubber({
  today,
  onSelectDate,
}: {
  today: string
  onSelectDate: (date: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [centeredIdx, setCenteredIdx] = useState(todayIndex)
  const [awayDir, setAwayDir] = useState<'past' | 'future' | false>(false)

  const days = useMemo(() => {
    const todayDate = parseISO(today)
    const dates: string[] = []
    const dateObjs: Date[] = []
    for (let i = -pastDays; i <= futureDays; i++) {
      const d = addDays(todayDate, i)
      dates.push(format(d, 'yyyy-MM-dd'))
      dateObjs.push(d)
    }
    return { dates, dateObjs }
  }, [today])

  const minOffset = -(totalDays - 1) * itemSize
  const maxOffset = 0

  const offsetX = useSharedValue(-todayIndex * itemSize)
  const startX = useSharedValue(0)

  function scrollToIndex(index: number) {
    offsetX.value = withSpring(clamp(-index * itemSize, minOffset, maxOffset), snappySpring)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollToIndex uses stable shared values
  const goToToday = useCallback(() => {
    scrollToIndex(todayIndex)
    onSelectDate(today)
  }, [today, onSelectDate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable refs
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .shouldCancelWhenOutside(false)
        .onStart(() => {
          startX.value = offsetX.value
        })
        .onUpdate((e) => {
          offsetX.value = clamp(startX.value + e.translationX, minOffset, maxOffset)
        })
        .onEnd((e) => {
          offsetX.value = withDecay(
            {
              velocity: e.velocityX,
              deceleration: 0.997,
              clamp: [minOffset, maxOffset],
            },
            () => {
              const rounded = Math.round(offsetX.value / itemSize) * itemSize
              offsetX.value = withSpring(clamp(rounded, minOffset, maxOffset), snappySpring)
            },
          )
        })
        // Fallback: if the gesture is cancelled (e.g. on web when the pointer
        // leaves the GestureDetector bounds), onEnd never fires. Snap to the
        // nearest day at the current offset so the swipe isn't lost.
        .onFinalize((_e, success) => {
          if (success) return
          const rounded = Math.round(offsetX.value / itemSize) * itemSize
          offsetX.value = withSpring(clamp(rounded, minOffset, maxOffset), snappySpring)
        }),
    [minOffset],
  )

  useAnimatedReaction(
    () => {
      const idx = Math.round(-offsetX.value / itemSize)
      return clamp(idx, 0, totalDays - 1)
    },
    (current, previous) => {
      if (previous === null || current === previous) return
      runOnJS(lightTap)()
      runOnJS(setCenteredIdx)(current)
      runOnJS(setAwayDir)(current === todayIndex ? false : current < todayIndex ? 'future' : 'past')
      const date = days.dates[current]
      if (date) runOnJS(onSelectDate)(date)
    },
    [days.dates, onSelectDate],
  )

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }))

  const monthLabel = useMemo(() => {
    const dateObj = days.dateObjs[centeredIdx]
    if (!dateObj) return ''
    return formatLocalized(dateObj, 'MMMM').replace(/^\w/, (c) => c.toUpperCase())
  }, [centeredIdx, days.dateObjs])

  const accentColor = theme.accent.val
  const colorSecondary = theme.colorSecondary.val

  return (
    <View>
      <GestureDetector gesture={pan}>
        <View style={styles.container}>
          <View style={styles.composition}>
            <Animated.Text
              style={[styles.monthText, { color: colorSecondary }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {monthLabel}
            </Animated.Text>
            <View style={styles.gap} />
            <View style={styles.slot}>
              <Animated.View style={[styles.strip, { width: totalDays * itemSize }, stripStyle]}>
                {days.dateObjs.map((dateObj, index) => (
                  <DayItem
                    key={days.dates[index]}
                    index={index}
                    dateObj={dateObj}
                    offsetX={offsetX}
                    color={colorSecondary}
                    onTap={() => scrollToIndex(index)}
                  />
                ))}
              </Animated.View>
            </View>
          </View>
        </View>
      </GestureDetector>

      {awayDir && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <Pressable
            onPress={goToToday}
            style={styles.todayButton}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.goToToday')}
          >
            <Animated.Text
              style={[styles.todayButtonText, { color: accentColor }]}
              maxFontSizeMultiplier={1.5}
            >
              {awayDir === 'past' ? '‹ ' : ''}
              {t('plan.today')}
              {awayDir === 'future' ? ' ›' : ''}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}

function DayItem({
  index,
  dateObj,
  offsetX,
  color,
  onTap,
}: {
  index: number
  dateObj: Date
  offsetX: SharedValue<number>
  color: string
  onTap: () => void
}) {
  const dayNumber = dateObj.getDate()
  const fullDateLabel = formatLocalized(dateObj, 'EEEE, MMMM d')

  // Signed distance from centered slot: positive = right (future), negative = left (past)
  const signedDistance = useDerivedValue(() => index + offsetX.value / itemSize)

  const animatedStyle = useAnimatedStyle(() => {
    const d = signedDistance.value
    const opacity =
      d >= 0
        ? interpolate(d, [0, 1, 2, 3, 4, 5, 7], [1, 0.5, 0.32, 0.2, 0.1, 0.04, 0])
        : interpolate(-d, [0, 0.5, 1, 2], [1, 0.4, 0.08, 0])
    return { opacity }
  })

  return (
    <Pressable
      onPress={onTap}
      style={{ position: 'absolute', left: index * itemSize, width: itemWidth, height: lineHeight }}
      accessibilityRole="button"
      accessibilityLabel={fullDateLabel}
    >
      <Animated.Text
        style={[styles.dayNumber, { color }, animatedStyle]}
        maxFontSizeMultiplier={1.2}
      >
        {dayNumber}
      </Animated.Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    height: lineHeight,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composition: {
    flexDirection: 'row',
    alignItems: 'center',
    height: lineHeight,
  },
  gap: {
    width: monthGap,
  },
  slot: {
    width: itemWidth,
    height: lineHeight,
    position: 'relative',
  },
  strip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: lineHeight,
  },
  monthText: {
    fontFamily: 'PinyonScript_400Regular',
    fontSize: 22,
    lineHeight: lineHeight,
  },
  dayNumber: {
    fontFamily: 'PinyonScript_400Regular',
    fontSize: 22,
    lineHeight: lineHeight,
    textAlign: 'center',
    width: itemWidth,
  },
  todayButton: {
    alignSelf: 'center',
    marginTop: 6,
    paddingVertical: 2,
  },
  todayButtonText: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 15,
    letterSpacing: 1,
  },
})
