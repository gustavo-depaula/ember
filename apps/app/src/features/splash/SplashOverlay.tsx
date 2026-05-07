import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'

import { darkTheme, lightTheme } from '@/config/themes'

type Theme = 'light' | 'dark' | (string & {}) | null | undefined

const palette = {
  light: {
    background: lightTheme.background,
    wordmark: lightTheme.color,
    flame: lightTheme.accent,
    rule: lightTheme.accentSubtle,
  },
  dark: {
    background: darkTheme.background,
    wordmark: darkTheme.color,
    flame: darkTheme.accent,
    rule: darkTheme.accentSubtle,
  },
} as const

export function SplashOverlay({
  theme,
  ready,
  onHidden,
}: {
  theme: Theme
  ready: boolean
  onHidden?: () => void
}) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
  }, [opacity])

  useEffect(() => {
    if (!ready) return
    opacity.value = withDelay(
      120,
      withTiming(0, { duration: 360, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished && onHidden) runOnJS(onHidden)()
      }),
    )
    scale.value = withDelay(
      120,
      withTiming(1.04, { duration: 360, easing: Easing.in(Easing.quad) }),
    )
  }, [ready, opacity, scale, onHidden])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const c = theme === 'dark' ? palette.dark : palette.light

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      style={[styles.overlay, { backgroundColor: c.background }, animatedStyle]}
    >
      <View style={styles.center}>
        <FlameMark color={c.flame} />
        <Text allowFontScaling={false} style={[styles.wordmark, { color: c.wordmark }]}>
          Ember
        </Text>
        <View style={styles.ruleRow}>
          <View style={[styles.rule, { backgroundColor: c.rule }]} />
          <View style={[styles.dot, { backgroundColor: c.rule }]} />
          <View style={[styles.rule, { backgroundColor: c.rule }]} />
        </View>
      </View>
    </Animated.View>
  )
}

function FlameMark({ color }: { color: string }) {
  return (
    <Svg width={56} height={64} viewBox="0 0 56 64" accessible={false}>
      <Path
        d="M28 4 C30 14, 40 20, 42 32 C44 44, 36 54, 28 56 C20 54, 12 44, 14 32 C16 22, 24 18, 24 12 C24 16, 26 18, 28 16 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M28 22 C29 28, 34 32, 34 40 C34 47, 30 51, 28 52 C26 51, 22 47, 22 40 C22 33, 26 30, 26 24 Z"
        fill={color}
        opacity={0.18}
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'UnifrakturMaguntia',
    fontSize: 56,
    lineHeight: 70,
    marginTop: 18,
    letterSpacing: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  rule: {
    width: 36,
    height: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 6,
  },
})
