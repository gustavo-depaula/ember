import { useEffect, useState } from 'react'
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useTheme, useThemeName } from 'tamagui'
import { create } from 'zustand'

import { Typography } from './typography'

// PROTOTYPE: candidate looks for a segmented selector on Android.
export type SelectorVariant = 'capsule' | 'underline' | 'gold'
const selectorVariants: SelectorVariant[] = ['capsule', 'underline', 'gold']
export const useSelectorVariant = create<{ variant: SelectorVariant }>(() => ({
  variant: 'capsule',
}))
function cycleSelectorVariant() {
  const i = selectorVariants.indexOf(useSelectorVariant.getState().variant)
  useSelectorVariant.setState({ variant: selectorVariants[(i + 1) % selectorVariants.length] })
}

const spring = { damping: 26, stiffness: 320, mass: 0.8 }
const height = 40

/** One of a few options, the chosen one marked by an indicator that slides to it. */
export function SegmentedSelector({
  values,
  selectedIndex,
  onChange,
}: {
  values: string[]
  selectedIndex: number
  onChange: (index: number) => void
}) {
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const variant = useSelectorVariant((s) => s.variant)
  const [width, setWidth] = useState(0)
  // The indicator moves on the tap, ahead of whatever the choice sets off.
  const [index, setIndex] = useState(selectedIndex)
  useEffect(() => setIndex(selectedIndex), [selectedIndex])

  const pad = variant === 'capsule' ? 3 : 0
  const segment = values.length > 0 ? (width - pad * 2) / values.length : 0
  const x = useSharedValue(index * segment)
  useEffect(() => {
    x.value = withSpring(index * segment, spring)
  }, [index, segment, x])
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)

  const track =
    variant === 'capsule'
      ? {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,45,20,0.07)',
          borderRadius: height / 2,
          padding: pad,
        }
      : variant === 'gold'
        ? {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.borderColor.val,
            backgroundColor: theme.backgroundSurface.val,
            overflow: 'hidden' as const,
          }
        : {}

  const indicator =
    variant === 'capsule'
      ? {
          top: pad,
          left: pad,
          height: height - pad * 2,
          borderRadius: height / 2,
          backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : '#FFFFFF',
          boxShadow: isDark ? undefined : '0 1 4 0 rgba(60,45,20,0.18)',
        }
      : variant === 'gold'
        ? { top: 0, left: 0, height, backgroundColor: theme.accent.val }
        : { bottom: 0, left: 0, height: 2, backgroundColor: theme.accent.val }

  return (
    <View onLayout={onLayout} style={[styles.row, { height }, track]}>
      {segment > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            indicator,
            variant === 'underline'
              ? { width: segment * 0.5, marginLeft: segment * 0.25 }
              : { width: segment },
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
            onLongPress={cycleSelectorVariant}
            onPress={() => {
              setIndex(i)
              onChange(i)
            }}
          >
            {variant === 'underline' ? (
              <Typography
                variant="label"
                textTransform="uppercase"
                letterSpacing={1}
                fontSize={13}
                numberOfLines={1}
                color={selected ? '$color' : '$colorSecondary'}
              >
                {label}
              </Typography>
            ) : (
              <Typography
                variant="interface"
                fontSize="$2"
                color={
                  variant === 'gold' && selected
                    ? '$background'
                    : selected
                      ? '$color'
                      : '$colorSecondary'
                }
              >
                {label}
              </Typography>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'stretch' },
  indicator: { position: 'absolute' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
