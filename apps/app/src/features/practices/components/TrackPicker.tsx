import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native'
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
import { Text, useTheme, YStack } from 'tamagui'

import { snappySpring } from '@/config/animation'
import type { LectioTrackDef } from '@/content/types'
import { useSetCursorIndex } from '@/features/divine-office'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatTrackEntry } from '@/lib/lectio'

const itemWidth = 160
const itemGap = 8
const itemSize = itemWidth + itemGap
const renderWindow = 8

export function TrackPicker({
  practiceId,
  trackDef,
  trackState,
}: {
  practiceId: string
  trackDef: LectioTrackDef
  trackState: { track: string; current_index: number }
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const setCursorIndex = useSetCursorIndex()
  const total = trackDef.entries.length
  const initial = trackState.current_index % total

  const [containerWidth, setContainerWidth] = useState(0)
  const centerX = (containerWidth - itemWidth) / 2

  const minOffset = -(total - 1) * itemSize
  const maxOffset = 0

  const offsetX = useSharedValue(-initial * itemSize)
  const startX = useSharedValue(0)
  const [visibleCenter, setVisibleCenter] = useState(initial)
  const lastPersisted = useRef(initial)

  // Only sync from DB when the change was external (not our own persist)
  const dbIndex = trackState.current_index % total
  const prevDbIndex = useRef(dbIndex)
  if (dbIndex !== prevDbIndex.current) {
    prevDbIndex.current = dbIndex
    if (dbIndex !== lastPersisted.current) {
      lastPersisted.current = dbIndex
      offsetX.value = withSpring(clamp(-dbIndex * itemSize, minOffset, maxOffset), snappySpring)
    }
  }

  function onLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width)
  }

  function scrollToIndex(index: number) {
    offsetX.value = withSpring(clamp(-index * itemSize, minOffset, maxOffset), snappySpring)
  }

  function onSnap(index: number) {
    setVisibleCenter(index)
    if (index !== lastPersisted.current) {
      lastPersisted.current = index
      setCursorIndex.mutate({
        cursorId: `${practiceId}/${trackState.track}`,
        index,
      })
    }
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
          offsetX.value = clamp(startX.value + e.translationX, minOffset, maxOffset)
        })
        .onEnd((e) => {
          offsetX.value = withDecay(
            {
              velocity: e.velocityX * 3,
              deceleration: 0.999,
              clamp: [minOffset, maxOffset],
            },
            () => {
              const rounded = Math.round(offsetX.value / itemSize) * itemSize
              offsetX.value = withSpring(clamp(rounded, minOffset, maxOffset), snappySpring)
            },
          )
        }),
    [minOffset, maxOffset],
  )

  useAnimatedReaction(
    () => {
      const idx = Math.round(-offsetX.value / itemSize)
      return clamp(idx, 0, total - 1)
    },
    (current, previous) => {
      if (previous === null || current === previous) return
      runOnJS(lightTap)()
      runOnJS(onSnap)(current)
    },
    [total],
  )

  const accentColor = theme.accent.val
  const bgColor = theme.background.val
  const secondaryColor = theme.colorSecondary.val

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value + centerX }],
  }))

  const resolveBookName = useCallback(
    (slug: string) => t(`bookName.${slug}`, { defaultValue: slug }),
    [t],
  )

  const visibleStart = Math.max(0, visibleCenter - renderWindow)
  const visibleEnd = Math.min(total, visibleCenter + renderWindow + 1)
  const visibleEntries = useMemo(() => {
    const items: { index: number; label: string }[] = []
    for (let i = visibleStart; i < visibleEnd; i++) {
      items.push({
        index: i,
        label: formatTrackEntry(trackDef.source, trackDef.entries[i], resolveBookName),
      })
    }
    return items
  }, [visibleStart, visibleEnd, trackDef, resolveBookName])

  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
        {localizeContent(trackDef.label)}
      </Text>

      <GestureDetector gesture={pan}>
        <View style={styles.container} onLayout={onLayout}>
          {containerWidth > 0 ? (
            <Animated.View style={[styles.strip, { width: total * itemSize }, stripStyle]}>
              {visibleEntries.map(({ index, label }) => (
                <EntryPill
                  key={index}
                  index={index}
                  label={label}
                  offsetX={offsetX}
                  accentColor={accentColor}
                  bgColor={bgColor}
                  secondaryColor={secondaryColor}
                  onTap={() => scrollToIndex(index)}
                />
              ))}
            </Animated.View>
          ) : null}
        </View>
      </GestureDetector>

      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
        {t('track.position', {
          current: (trackState.current_index % total) + 1,
          total,
        })}
      </Text>
    </YStack>
  )
}

function EntryPill({
  index,
  label,
  offsetX,
  accentColor,
  bgColor,
  secondaryColor,
  onTap,
}: {
  index: number
  label: string
  offsetX: SharedValue<number>
  accentColor: string
  bgColor: string
  secondaryColor: string
  onTap: () => void
}) {
  const distance = useDerivedValue(() => Math.abs(index + offsetX.value / itemSize))

  const pillStyle = useAnimatedStyle(() => {
    const d = distance.value
    const scale = interpolate(d, [0, 1, 3], [1, 0.88, 0.75])
    const opacity = interpolate(d, [0, 1, 4], [1, 0.65, 0.25])
    const bg = interpolateColor(d, [0, 0.5], [accentColor, 'transparent'])
    return {
      transform: [{ scale }],
      opacity,
      backgroundColor: bg,
    }
  })

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(distance.value, [0, 0.5], [bgColor, secondaryColor]),
  }))

  return (
    <Pressable
      onPress={onTap}
      style={{ position: 'absolute', left: index * itemSize }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.pill, pillStyle]}>
        <Animated.Text style={[styles.entryText, textStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    height: 48,
  },
  strip: {
    flexDirection: 'row',
    position: 'relative',
  },
  pill: {
    width: itemWidth,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  entryText: {
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 19,
  },
})
