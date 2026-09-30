import { Image, type ImageSource } from 'expo-image'
import { type ReactNode, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Image as SvgImage,
} from 'react-native-svg'

import { Typography } from '@/components/typography'
import { HolographicOverlay } from '../components/HolographicOverlay'

const paperTexture = require('../../../../assets/envelope-paper.png')
const maxTilt = 15

/** An envelope's height for its width. */
export const envelopeAspect = 1.28

// The wax: a blob with a lumpy rim, so it reads as poured rather than drawn.
function waxPath(size: number) {
  const c = size / 2
  const r = size * 0.44
  const points = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2
    const k =
      1 + 0.05 * Math.sin(5 * a + 0.7) + 0.035 * Math.sin(9 * a + 1.9) + 0.02 * Math.sin(14 * a)
    return `${i === 0 ? 'M' : 'L'}${(c + Math.cos(a) * r * k).toFixed(2)} ${(c + Math.sin(a) * r * k).toFixed(2)}`
  })
  return `${points.join(' ')} Z`
}

/**
 * Where the card sits once risen out of an envelope of width `w`, as an offset
 * from the envelope's top: the opening glides it from there to its final place.
 */
export function risenCardCenter(w: number) {
  const cardH = w * 0.8 * 1.5
  return w * envelopeAspect - cardH - w * 0.04 - cardH * 0.92 + cardH / 2
}

/**
 * A laid-paper envelope, sealed with red wax and a gold ✠, addressed with the
 * saint's name and the day it was won. Closed, the holy card's own sheen
 * crosses it now and then and, when `tiltable`, it tilts under a finger: a hint
 * of what's inside. Driven by `open` (0 → 1) it plays the opening — the seal
 * splits, the flap swings up, the card rises out shimmering and glides by
 * `exit` to where the full card appears.
 */
export function Envelope({
  width: w,
  name,
  date,
  image,
  open,
  exit = { dy: 0, scale: 1.12 },
  tiltable = false,
}: {
  width: number
  name: ReactNode
  date: string
  /** The card inside; only seen once the envelope opens. */
  image?: ImageSource
  open?: SharedValue<number>
  exit?: { dy: number; scale: number }
  tiltable?: boolean
}) {
  const h = w * envelopeAspect
  const flapH = h * 0.5
  const cardW = w * 0.8
  const cardH = cardW * 1.5
  const seal = w * 0.24
  const still = useSharedValue(0)
  const o = open ?? still

  // Every few seconds a sheen crosses the envelope, as if it tilted in the light.
  const sweep = useSharedValue(0)
  useEffect(() => {
    sweep.value = withRepeat(
      withSequence(
        withDelay(1200, withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) })),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    )
  }, [sweep])

  const touching = useSharedValue(0)
  const touchX = useSharedValue(0)
  const touchY = useSharedValue(0)
  const pan = Gesture.Pan()
    .enabled(tiltable && !open)
    .onBegin((e) => {
      touching.value = 1
      touchY.value = interpolate(e.x, [0, w], [-maxTilt, maxTilt], Extrapolation.CLAMP)
      touchX.value = interpolate(e.y, [0, h], [maxTilt, -maxTilt], Extrapolation.CLAMP)
    })
    .onUpdate((e) => {
      touchY.value = interpolate(e.x, [0, w], [-maxTilt, maxTilt], Extrapolation.CLAMP)
      touchX.value = interpolate(e.y, [0, h], [maxTilt, -maxTilt], Extrapolation.CLAMP)
    })
    .onFinalize(() => {
      touching.value = 0
      touchX.value = withSpring(0)
      touchY.value = withSpring(0)
    })

  const calm = useDerivedValue(() => 1 - Math.min(o.value * 6, 1))
  const holoY = useDerivedValue(() =>
    touching.value ? touchY.value : interpolate(sweep.value, [0, 1], [-maxTilt, maxTilt]),
  )
  const holoX = useDerivedValue(() =>
    touching.value ? touchX.value : interpolate(sweep.value, [0, 1], [5, -5]),
  )
  const holoActive = useDerivedValue(
    () => (touching.value ? 1 : Math.sin(Math.PI * sweep.value)) * calm.value,
  )
  // Only a tiltable envelope moves in 3D: a still one sits among flat siblings
  // (the stack beneath it on Today), and iOS depth-sorts a tilted layer through them.
  const tilt = useAnimatedStyle(() => {
    const k = tiltable ? (touching.value ? 0.6 : 0.18) * calm.value : 0
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${holoX.value * k}deg` },
        { rotateY: `${holoY.value * k}deg` },
      ],
    }
  })

  // The card's own sheen as it rises, fading out as it settles into place.
  const cardHoloY = useDerivedValue(() => interpolate(o.value, [0.3, 1], [-maxTilt, maxTilt]))
  const cardHoloX = useDerivedValue(() =>
    interpolate(o.value, [0.3, 1], [maxTilt * 0.6, -maxTilt * 0.6]),
  )
  const cardHoloActive = useDerivedValue(() =>
    interpolate(o.value, [0.34, 0.5, 0.86, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  )

  // 0–0.15 seal splits · 0.12–0.4 flap swings open · 0.36–0.72 card rises ·
  // 0.7–0.92 envelope falls away · 0.74–1 card glides into place
  const flapClosed = useAnimatedStyle(() => ({
    opacity: o.value < 0.26 ? 1 : 0,
    transform: [
      { perspective: 900 },
      { rotateX: `${interpolate(o.value, [0.12, 0.26], [0, 90], Extrapolation.CLAMP)}deg` },
    ],
  }))
  const flapOpen = useAnimatedStyle(() => ({
    opacity: o.value >= 0.26 ? 1 : 0,
    transform: [
      { perspective: 900 },
      { rotateX: `${interpolate(o.value, [0.26, 0.4], [90, 180], Extrapolation.CLAMP)}deg` },
    ],
  }))
  const card = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          interpolate(o.value, [0.36, 0.72], [0, -cardH * 0.92], Extrapolation.CLAMP) +
          interpolate(o.value, [0.74, 1], [0, exit.dy], Extrapolation.CLAMP),
      },
      { scale: interpolate(o.value, [0.74, 1], [1, exit.scale], Extrapolation.CLAMP) },
    ],
  }))
  const body = useAnimatedStyle(() => ({
    opacity: interpolate(o.value, [0.7, 0.92], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(o.value, [0.7, 0.92], [0, h * 0.35], Extrapolation.CLAMP) },
    ],
  }))

  const pocket = `M0 0 L${w / 2} ${flapH * 0.98} L${w} 0 L${w} ${h} L0 ${h} Z`
  const flap = `M0 0 L${w} 0 L${w / 2} ${flapH} Z`
  const wax = waxPath(seal)

  const texture = (clip: string, width: number, height: number, opacity: number) => (
    <SvgImage
      href={paperTexture}
      x={0}
      y={0}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid slice"
      clipPath={`url(#${clip})`}
      opacity={opacity}
    />
  )

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: w, height: h }, tilt]}>
        {/* the inside of the envelope and the opened flap, both behind the card */}
        <Animated.View style={[StyleSheet.absoluteFill, body]}>
          <Svg width={w} height={h}>
            <Defs>
              <LinearGradient id="inside" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#cdb994" />
                <Stop offset="1" stopColor="#bfa77c" />
              </LinearGradient>
              <ClipPath id="insideClip">
                <Path d={`M0 0 H${w} V${h} H0 Z`} />
              </ClipPath>
            </Defs>
            <Path d={`M0 0 H${w} V${h} H0 Z`} fill="url(#inside)" />
            {texture('insideClip', w, h, 0.5)}
          </Svg>
        </Animated.View>
        <Animated.View
          style={[styles.flap, { width: w, height: flapH, transformOrigin: 'top' }, flapOpen]}
        >
          <Svg width={w} height={flapH}>
            <Defs>
              <LinearGradient id="flapIn" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#d6c29c" />
                <Stop offset="1" stopColor="#e6d7b6" />
              </LinearGradient>
              <ClipPath id="flapInClip">
                <Path d={flap} />
              </ClipPath>
            </Defs>
            <Path d={flap} fill="url(#flapIn)" stroke="#b39a70" strokeWidth={0.8} />
            {texture('flapInClip', w, flapH, 0.45)}
          </Svg>
        </Animated.View>

        {image && (
          <Animated.View
            style={[
              styles.inner,
              { width: cardW, height: cardH, left: (w - cardW) / 2, top: h - cardH - w * 0.04 },
              card,
            ]}
          >
            <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
            <HolographicOverlay
              cardWidth={cardW}
              cardHeight={cardH}
              rotateX={cardHoloX}
              rotateY={cardHoloY}
              isActive={cardHoloActive}
            />
          </Animated.View>
        )}

        {/* the front pocket with its address, the closed flap and the seal */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.shadow, body]} pointerEvents="none">
          <Svg width={w} height={h}>
            <Defs>
              <LinearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#f7efdc" />
                <Stop offset="0.6" stopColor="#efe3c7" />
                <Stop offset="1" stopColor="#e3d2ae" />
              </LinearGradient>
              <ClipPath id="pocketClip">
                <Path d={pocket} />
              </ClipPath>
            </Defs>
            <Path d={pocket} fill="url(#paper)" />
            {texture('pocketClip', w, h, 0.35)}
            <Path
              d={`M0 ${h} L${w / 2} ${h * 0.56} L${w} ${h}`}
              stroke="#b89f76"
              strokeOpacity={0.5}
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={`M0.5 0.5 H${w - 0.5} V${h - 0.5} H0.5 Z`}
              stroke="#c4ad85"
              strokeWidth={1}
              fill="none"
            />
          </Svg>
          <View style={[styles.address, { top: h * 0.64, paddingHorizontal: w * 0.04 }]}>
            <Typography
              fontFamily="$script"
              fontSize={w * 0.1}
              lineHeight={w * 0.14}
              color="#4f3b26"
              textAlign="center"
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {name}
            </Typography>
            <Typography
              variant="reference"
              fontSize={w * 0.045}
              lineHeight={w * 0.08}
              color="#7d6749"
              letterSpacing={w * 0.004}
              textTransform="uppercase"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {date}
            </Typography>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.flap,
            styles.shadow,
            { width: w, height: flapH, transformOrigin: 'top' },
            flapClosed,
          ]}
        >
          <Svg width={w} height={flapH}>
            <Defs>
              <LinearGradient id="flapOut" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f4ead3" />
                <Stop offset="1" stopColor="#e8d9b9" />
              </LinearGradient>
              <ClipPath id="flapOutClip">
                <Path d={flap} />
              </ClipPath>
            </Defs>
            <Path d={flap} fill="url(#flapOut)" stroke="#bea57b" strokeWidth={0.8} />
            {texture('flapOutClip', w, flapH, 0.35)}
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, body]} pointerEvents="none">
          <HolographicOverlay
            cardWidth={w}
            cardHeight={h}
            rotateX={holoX}
            rotateY={holoY}
            isActive={holoActive}
          />
          {/* Twice: the sheen is tuned for a painted card and reads faint on cream paper. */}
          <HolographicOverlay
            cardWidth={w}
            cardHeight={h}
            rotateX={holoX}
            rotateY={holoY}
            isActive={holoActive}
          />
        </Animated.View>

        <View
          style={[
            styles.seal,
            { width: seal, height: seal, left: w / 2 - seal / 2, top: flapH - seal * 0.6 },
          ]}
          pointerEvents="none"
        >
          <SealHalf side="left" size={seal} wax={wax} open={o} />
          <SealHalf side="right" size={seal} wax={wax} open={o} />
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

// One half of the wax seal: the whole seal drawn and clipped to its side, so
// the two halves meet seamlessly until the opening splits them apart.
function SealHalf({
  side,
  size,
  wax,
  open,
}: {
  side: 'left' | 'right'
  size: number
  wax: string
  open: SharedValue<number>
}) {
  const i = side === 'left' ? 0 : 1
  const dir = side === 'left' ? -1 : 1
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0.06, 0.18], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(open.value, [0, 0.16], [0, dir * size * 0.35], Extrapolation.CLAMP),
      },
      { translateY: interpolate(open.value, [0, 0.16], [0, size * 0.28], Extrapolation.CLAMP) },
      { rotate: `${interpolate(open.value, [0, 0.16], [0, dir * 22], Extrapolation.CLAMP)}deg` },
    ],
  }))
  return (
    <Animated.View
      style={[styles.sealHalf, { width: size / 2, height: size, left: i * (size / 2) }, style]}
    >
      <View style={{ position: 'absolute', left: -i * (size / 2), width: size, height: size }}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={`wax-${side}`} cx="38%" cy="32%" r="75%">
              <Stop offset="0" stopColor="#c0474a" />
              <Stop offset="0.45" stopColor="#962a2e" />
              <Stop offset="0.85" stopColor="#6d171b" />
              <Stop offset="1" stopColor="#551014" />
            </RadialGradient>
          </Defs>
          <Path d={wax} fill={`url(#wax-${side})`} />
          {/* the pressed ring: shadow on one side, catch-light on the other */}
          <Circle
            cx={size / 2 + 0.8}
            cy={size / 2 + 0.8}
            r={size * 0.3}
            stroke="#3f0a0d"
            strokeOpacity={0.55}
            strokeWidth={1.6}
            fill="none"
          />
          <Circle
            cx={size / 2 - 0.6}
            cy={size / 2 - 0.6}
            r={size * 0.3}
            stroke="#e7888a"
            strokeOpacity={0.35}
            strokeWidth={1}
            fill="none"
          />
          <Path
            d={`M${size * 0.24} ${size * 0.36} Q${size * 0.32} ${size * 0.2} ${size * 0.5} ${size * 0.16}`}
            stroke="#ffffff"
            strokeOpacity={0.35}
            strokeWidth={size * 0.035}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Typography
            fontFamily="$display"
            fontSize={size * 0.36}
            lineHeight={size * 0.5}
            color="#e0bd68"
          >
            ✠
          </Typography>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  inner: { position: 'absolute', borderRadius: 6, overflow: 'hidden' },
  flap: { position: 'absolute', top: 0, left: 0 },
  shadow: {
    shadowColor: '#3b2a14',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  address: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  seal: {
    position: 'absolute',
    shadowColor: '#2a0608',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  sealHalf: { position: 'absolute', top: 0, overflow: 'hidden' },
})
