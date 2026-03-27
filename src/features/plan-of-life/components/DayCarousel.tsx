import { addDays, format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import type { SharedValue } from 'react-native-reanimated'
import Animated, {
  clamp,
  interpolate,
  interpolateColor,
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

const pillWidth = 48
const pillGap = 6
const itemSize = pillWidth + pillGap
const pastDays = 60
const futureDays = 14
const totalDays = pastDays + futureDays + 1
const todayIndex = pastDays

export function DayCarousel({
  onSelectDate,
  today,
}: {
  onSelectDate: (date: string) => void
  today: string
}) {
  const theme = useTheme()
  const [containerWidth, setContainerWidth] = useState(0)
  const centerX = (containerWidth - pillWidth) / 2

  function onLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width)
  }

  const days = useMemo(() => {
    const todayDate = parseISO(today)
    const result: string[] = []
    const dateObjs: Date[] = []
    for (let i = -pastDays; i <= futureDays; i++) {
      const d = addDays(todayDate, i)
      result.push(format(d, 'yyyy-MM-dd'))
      dateObjs.push(d)
    }
    return { dates: result, dateObjs }
  }, [today])

  const minOffset = -(totalDays - 1) * itemSize
  const maxOffset = 0

  const offsetX = useSharedValue(-todayIndex * itemSize)
  const startX = useSharedValue(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: shared values are stable refs
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
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
      const date = days.dates[current]
      if (date) {
        runOnJS(onSelectDate)(date)
      }
    },
    [days.dates, onSelectDate],
  )

  const accentColor = theme.accent.val
  const bgColor = theme.background.val
  const secondaryColor = theme.colorSecondary.val

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value + centerX }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, { height: 64 }]} onLayout={onLayout}>
        {containerWidth > 0 ? (
          <Animated.View style={[styles.strip, { width: totalDays * itemSize }, stripStyle]}>
            {days.dateObjs.map((dateObj, index) => (
              <DayPill
                key={days.dates[index]}
                index={index}
                dateObj={dateObj}
                dateStr={days.dates[index]}
                offsetX={offsetX}
                accentColor={accentColor}
                bgColor={bgColor}
                secondaryColor={secondaryColor}
                today={today}
              />
            ))}
          </Animated.View>
        ) : null}
      </View>
    </GestureDetector>
  )
}

function DayPill({
  index,
  dateObj,
  dateStr,
  offsetX,
  accentColor,
  bgColor,
  secondaryColor,
  today,
}: {
  index: number
  dateObj: Date
  dateStr: string
  offsetX: SharedValue<number>
  accentColor: string
  bgColor: string
  secondaryColor: string
  today: string
}) {
  const isFuture = dateStr > today
  const isToday = dateStr === today
  const dayLabel = formatLocalized(dateObj, 'EEEEE')
  const dayNumber = dateObj.getDate()

  const distance = useDerivedValue(() => Math.abs(index + offsetX.value / itemSize))

  const animatedStyle = useAnimatedStyle(() => {
    const d = distance.value
    const scale = interpolate(d, [0, 1, 3], [1, 0.9, 0.8])
    const opacity = interpolate(d, [0, 1, 3], [1, 0.7, 0.35])
    const bg = interpolateColor(d, [0, 0.5], [accentColor, 'transparent'])

    return {
      transform: [{ scale }],
      opacity: isFuture ? opacity * 0.6 : opacity,
      backgroundColor: bg,
    }
  })

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(distance.value, [0, 0.5], [bgColor, accentColor]),
  }))

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(distance.value, [0, 0.5], [bgColor, secondaryColor]),
  }))

  return (
    <Animated.View
      style={[
        styles.pill,
        { left: index * itemSize },
        animatedStyle,
        isToday && { borderWidth: 1.5, borderColor: `${accentColor}40` },
      ]}
    >
      <Animated.Text style={[styles.dayLabel, labelStyle]}>{dayLabel}</Animated.Text>
      <Animated.Text style={[styles.dayNumber, textStyle]}>{dayNumber}</Animated.Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  strip: {
    flexDirection: 'row',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    width: pillWidth,
    height: 60,
    borderRadius: pillWidth / 2,
    alignItems: 'center',
    justifyContent: 'center',
    top: 2,
  },
  dayLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 20,
  },
})
