import { useEffect, useState } from 'react'
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useThemeName } from 'tamagui'

import { Typography } from './typography'

const spring = { damping: 26, stiffness: 320, mass: 0.8 }
const height = 40
const pad = 3

/** One of a few options, the chosen one marked by a capsule that slides to it. */
export function SegmentedSelector({
  values,
  selectedIndex,
  onChange,
}: {
  values: string[]
  selectedIndex: number
  onChange: (index: number) => void
}) {
  const isDark = useThemeName().startsWith('dark')
  const [width, setWidth] = useState(0)
  // The indicator moves on the tap, ahead of whatever the choice sets off.
  const [index, setIndex] = useState(selectedIndex)
  useEffect(() => setIndex(selectedIndex), [selectedIndex])

  const segment = values.length > 0 ? (width - pad * 2) / values.length : 0
  const x = useSharedValue(index * segment)
  useEffect(() => {
    x.value = withSpring(index * segment, spring)
  }, [index, segment, x])
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.track,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,45,20,0.07)' },
      ]}
    >
      {segment > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { width: segment },
            isDark ? styles.indicatorDark : styles.indicatorLight,
            slide,
          ]}
        />
      )}
      {values.map((label, i) => {
        const selected = i === index
        return (
          <Pressable
            key={label}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => {
              setIndex(i)
              onChange(i)
            }}
          >
            <Typography
              variant="interface"
              fontSize="$2"
              color={selected ? '$color' : '$colorSecondary'}
            >
              {label}
            </Typography>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height,
    padding: pad,
    borderRadius: height / 2,
  },
  indicator: {
    position: 'absolute',
    top: pad,
    left: pad,
    height: height - pad * 2,
    borderRadius: height / 2,
  },
  indicatorDark: { backgroundColor: 'rgba(255,255,255,0.16)' },
  indicatorLight: { backgroundColor: '#FFFFFF', boxShadow: '0 1 4 0 rgba(60,45,20,0.18)' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
