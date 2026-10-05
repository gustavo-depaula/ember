import { Image } from 'expo-image'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Typography } from '@/components/typography'
import { lightTap } from '@/lib/haptics'
import { Envelope, WaxSeal } from './Envelope'

const paperTexture = require('../../../../assets/envelope-paper.jpg')
const ink = '#3b2a1a'
const rubric = '#8a2a2a'
const turnEase = Easing.bezier(0.45, 0, 0.2, 1)
// Each line of the prayer is written in this long after the one before.
const lineGap = 260

/**
 * The sealed envelope, centred, turning over as one object when tapped: it
 * lifts, turns in depth while growing into a sheet of its own paper (width
 * and height grow apart, which the edge-on moment hides), and the prayer is
 * written in on it, line by line. The wax seal at its foot is the Amen: once
 * `onAmen` resolves, the envelope turns back sealed side up, settling where
 * the opening envelope stands (`riseTop`), and `onTurnedBack` hands over.
 */
export function EnvelopeTurn({
  envelope,
  name,
  lines,
  canTurn,
  riseTop,
  onAmen,
  onTurnedBack,
  error,
}: {
  envelope: { width: number; name: string; date: string; note: string }
  /** The saint's name, heading the prayer. */
  name: string
  lines: string[]
  canTurn: boolean
  riseTop: number
  onAmen: () => Promise<unknown>
  onTurnedBack: () => void
  error: string | undefined
}) {
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const turned = useSharedValue(0)
  const settle = useSharedValue(0)
  const [written, setWritten] = useState(false)
  const [amen, setAmen] = useState(false)
  const restingTop = useRef(0)
  const envW = envelope.width
  const envH = envW * 1.28
  const sheetW = width - 24
  const sheetH = Math.min(height - insets.top - insets.bottom - 32, sheetW * 1.75)
  const growX = sheetW / envW
  const growY = sheetH / envH

  const turn = (to: 0 | 1, then?: () => void) => {
    void lightTap()
    if (to === 0) setWritten(false)
    turned.value = withTiming(to, { duration: to ? 1100 : 800, easing: turnEase }, (done) => {
      if (!done) return
      if (to === 1) runOnJS(setWritten)(true)
      if (then) runOnJS(then)()
    })
  }

  // The envelope glides to the screen's centre as it turns, so the grown
  // sheet sits centred.
  const turnOver = () => {
    settle.value = withTiming(height / 2 - (restingTop.current + envH / 2), {
      duration: 1100,
      easing: turnEase,
    })
    turn(1)
  }

  const sayAmen = () => {
    setAmen(true)
    onAmen().then(
      () => {
        settle.value = withTiming(riseTop - restingTop.current, { duration: 800, easing: turnEase })
        turn(0, onTurnedBack)
      },
      () => setAmen(false),
    )
  }

  // A little lift before turning, then the growth through the turn.
  const scaleOf = (p: number, grow: number) => {
    'worklet'
    return interpolate(p, [0, 0.12, 1], [1, 1.05, grow], Extrapolation.CLAMP)
  }
  const stage = useAnimatedStyle(() => ({ transform: [{ translateY: settle.value }] }))
  const front = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${interpolate(turned.value, [0.08, 1], [0, 180], Extrapolation.CLAMP)}deg` },
      { scaleX: scaleOf(turned.value, growX) },
      { scaleY: scaleOf(turned.value, growY) },
    ],
  }))
  const back = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${interpolate(turned.value, [0.08, 1], [-180, 0], Extrapolation.CLAMP)}deg` },
      { scaleX: scaleOf(turned.value, growX) / growX },
      { scaleY: scaleOf(turned.value, growY) / growY },
    ],
  }))
  const shadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(turned.value, [0, 0.5, 1], [0.35, 0.7, 0.45]),
    shadowRadius: interpolate(turned.value, [0, 0.5, 1], [10, 30, 18]),
  }))
  const sealDelay = 500 + lines.length * lineGap

  return (
    <View style={styles.center}>
      <Animated.View
        style={[{ width: envW, height: envH }, stage]}
        onLayout={(e) => {
          restingTop.current = e.nativeEvent.layout.y
        }}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, shadow, front]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.turnEnvelope')}
            disabled={!canTurn || written || amen}
            onPress={turnOver}
          >
            <Envelope {...envelope} shimmer={!written && !amen} />
          </Pressable>
        </Animated.View>

        <Animated.View
          pointerEvents={written ? 'box-none' : 'none'}
          style={[
            styles.face,
            styles.paper,
            {
              width: sheetW,
              height: sheetH,
              left: (envW - sheetW) / 2,
              top: (envH - sheetH) / 2,
            },
            shadow,
            back,
          ]}
        >
          <Image source={paperTexture} style={[StyleSheet.absoluteFill, styles.texture]} />
          <View style={styles.rule} />
          {written && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.writing}>
              <Animated.View entering={FadeIn.duration(700)}>
                <Typography fontFamily="$script" fontSize={30} lineHeight={42} color={ink}>
                  {name}
                </Typography>
                <Typography
                  variant="label"
                  textTransform="uppercase"
                  letterSpacing={1.5}
                  color={rubric}
                  paddingTop="$sm"
                  paddingBottom="$xs"
                >
                  {t('saints.redeem.letUsPray')}
                </Typography>
              </Animated.View>
              {lines.map((line, i) => (
                <Animated.View key={line} entering={FadeIn.delay(500 + i * lineGap).duration(600)}>
                  <Typography fontSize={18} lineHeight={27} color={ink}>
                    {line}
                  </Typography>
                </Animated.View>
              ))}
            </ScrollView>
          )}
          {written && (
            <Animated.View entering={FadeIn.delay(sealDelay).duration(600)} style={styles.foot}>
              {error && (
                <Typography variant="annotation" color={rubric} paddingBottom="$xs">
                  {error}
                </Typography>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('a11y.amenOpen')}
                hitSlop={12}
                disabled={amen}
                onPress={sayAmen}
                style={({ pressed }) => [styles.amen, pressed && styles.pressed]}
              >
                <Typography fontFamily="$script" fontSize={22} lineHeight={30} color={rubric}>
                  {t('saints.redeem.amen')}
                </Typography>
                <Breathing>
                  <WaxSeal size={46} />
                </Breathing>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  )
}

// A slow swell now and then: the one thing on the paper waiting for a touch.
function Breathing({ children }: { children: ReactNode }) {
  const swell = useSharedValue(0)
  useEffect(() => {
    swell.value = withRepeat(
      withSequence(
        withDelay(1400, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    )
  }, [swell])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + swell.value * 0.06 }] }))
  return <Animated.View style={style}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  face: {
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
  },
  paper: {
    position: 'absolute',
    backgroundColor: '#f4ead3',
    borderWidth: 1,
    borderColor: '#c4ad85',
    overflow: 'hidden',
  },
  texture: { opacity: 0.35 },
  rule: {
    position: 'absolute',
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderWidth: 0.5,
    borderColor: '#cdb994',
  },
  writing: { flexGrow: 1, justifyContent: 'center', padding: 30, paddingBottom: 90 },
  foot: { position: 'absolute', right: 26, bottom: 20, alignItems: 'flex-end' },
  amen: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pressed: { transform: [{ scale: 0.92 }] },
})
