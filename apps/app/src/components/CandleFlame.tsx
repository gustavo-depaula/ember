import { useEffect } from 'react'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { View } from 'tamagui'

type FlameMode = 'dim' | 'alive' | 'fading'

export function CandleFlame({ size = 140, mode = 'alive' }: { size?: number; mode?: FlameMode }) {
  const flicker = useSharedValue(0)
  const presence = useSharedValue(mode === 'dim' ? 0.35 : 1)

  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 820, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 640, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [flicker])

  useEffect(() => {
    const target = mode === 'dim' ? 0.35 : mode === 'fading' ? 0 : 1
    presence.value = withTiming(target, { duration: mode === 'fading' ? 2400 : 800 })
  }, [mode, presence])

  const flameStyle = useAnimatedStyle(() => ({
    opacity: presence.value * interpolate(flicker.value, [0, 1], [0.75, 1]),
    transform: [
      { scaleY: interpolate(flicker.value, [0, 1], [0.92, 1.08]) },
      { scaleX: interpolate(flicker.value, [0, 1], [1.02, 0.96]) },
      { translateX: interpolate(flicker.value, [0, 1], [-0.6, 0.6]) },
    ],
  }))

  const haloStyle = useAnimatedStyle(() => ({
    opacity: presence.value * interpolate(flicker.value, [0, 1], [0.18, 0.32]),
    transform: [{ scale: interpolate(flicker.value, [0, 1], [0.94, 1.06]) }],
  }))

  const coreStyle = useAnimatedStyle(() => ({
    opacity: presence.value * interpolate(flicker.value, [0, 1], [0.9, 1]),
    transform: [{ scaleY: interpolate(flicker.value, [0, 1], [0.88, 1.04]) }],
  }))

  const flameH = size * 0.9
  const flameW = size * 0.42
  const haloSize = size * 1.6
  const coreH = flameH * 0.55
  const coreW = flameW * 0.5
  const candleW = size * 0.22
  const candleH = size * 0.9

  return (
    <View
      position="relative"
      width={size}
      height={size * 2}
      alignItems="center"
      justifyContent="flex-end"
    >
      <View position="absolute" top={size * 0.1} alignItems="center" width={size}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              backgroundColor: '#f5d28a',
              top: -haloSize * 0.25,
            },
            haloStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: flameW,
              height: flameH,
              borderTopLeftRadius: flameW / 2,
              borderTopRightRadius: flameW / 2,
              borderBottomLeftRadius: flameW / 3,
              borderBottomRightRadius: flameW / 3,
              backgroundColor: '#f5a623',
            },
            flameStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: coreW,
              height: coreH,
              borderTopLeftRadius: coreW / 2,
              borderTopRightRadius: coreW / 2,
              borderBottomLeftRadius: coreW / 3,
              borderBottomRightRadius: coreW / 3,
              backgroundColor: '#fff2c5',
              top: flameH * 0.25,
            },
            coreStyle,
          ]}
        />
      </View>

      <View
        width={candleW}
        height={candleH}
        backgroundColor="#e9dfc6"
        borderTopLeftRadius={candleW * 0.15}
        borderTopRightRadius={candleW * 0.15}
      />
      <View
        width={candleW * 1.4}
        height={candleW * 0.15}
        backgroundColor="#b89e6a"
        opacity={0.5}
        borderRadius={2}
      />
    </View>
  )
}
