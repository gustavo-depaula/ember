import { Image, type ImageSource } from 'expo-image'
import { type ReactNode, useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
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

const paperTexture = require('../../../../assets/envelope-paper.jpg')
const maxTilt = 15
const envelopeAspect = 1.28
const paper = { light: '#f4ead3', mid: '#e8d9b9', deep: '#dccaa3' }

/**
 * The holy card inside an envelope of width `w`: its size, where it rests
 * (from the envelope's top), and how far the opening lifts it.
 */
export function envelopeCard(w: number) {
  const width = w * 0.8
  const height = width * 1.5
  const top = w * envelopeAspect - height - w * 0.04
  return { width, height, top, rise: height * 0.92 }
}

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
 * A laid-paper envelope, sealed with red wax and a gold ✠, addressed with the
 * saint's name and the day it was won. Closed, the holy card's own sheen
 * crosses it now and then (while `shimmer`) and, when `tiltable`, it tilts
 * under a finger: a hint of what's inside. Driven by `open` (0 → 1) it plays
 * the opening — the seal splits, the flap swings up, the card rises out
 * shimmering and glides by `exit` to where the full card appears.
 */
export function Envelope({
  width: w,
  name,
  date,
  image,
  open,
  exit = { dy: 0, scale: 1 },
  tiltable = false,
  shimmer = true,
  note,
}: {
  width: number
  name: string
  date: string
  /** The card inside; only seen once the envelope opens. */
  image?: ImageSource
  open?: SharedValue<number>
  exit?: { dy: number; scale: number }
  tiltable?: boolean
  /** Off while the envelope is out of sight, so the sheen doesn't run unseen. */
  shimmer?: boolean
  /** A line on the flap, above the seal: how the card was won. */
  note?: string
}) {
  const h = w * envelopeAspect
  const flapH = h * 0.5
  const inner = envelopeCard(w)
  const seal = w * 0.24
  const still = useSharedValue(0)
  const o = open ?? still

  // Every few seconds a sheen crosses the envelope, as if it tilted in the light.
  const sweep = useSharedValue(0)
  const sweeping = shimmer && !open
  useEffect(() => {
    if (!sweeping) {
      cancelAnimation(sweep)
      sweep.value = 0
      return
    }
    sweep.value = withRepeat(
      withSequence(
        withDelay(1200, withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) })),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    )
  }, [sweep, sweeping])

  const touching = useSharedValue(0)
  const touchX = useSharedValue(0)
  const touchY = useSharedValue(0)
  const pan = useMemo(() => {
    const follow = (e: { x: number; y: number }) => {
      'worklet'
      touching.value = 1
      touchY.value = interpolate(e.x, [0, w], [-maxTilt, maxTilt], Extrapolation.CLAMP)
      touchX.value = interpolate(e.y, [0, h], [maxTilt, -maxTilt], Extrapolation.CLAMP)
    }
    return Gesture.Pan()
      .enabled(tiltable && !open)
      .onBegin(follow)
      .onUpdate(follow)
      .onFinalize(() => {
        touching.value = 0
        touchX.value = withSpring(0)
        touchY.value = withSpring(0)
      })
  }, [tiltable, open, w, h, touching, touchX, touchY])

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
  // Only a tiltable envelope moves in 3D: iOS depth-sorts a tilted layer
  // through flat siblings, like the sheets of a stack beneath it.
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
  // 0.72–0.92 envelope falls away · 0.74–1 card glides into place
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
          interpolate(o.value, [0.36, 0.72], [0, -inner.rise], Extrapolation.CLAMP) +
          interpolate(o.value, [0.74, 1], [0, exit.dy], Extrapolation.CLAMP),
      },
      { scale: interpolate(o.value, [0.74, 1], [1, exit.scale], Extrapolation.CLAMP) },
    ],
  }))
  const body = useAnimatedStyle(() => ({
    opacity: interpolate(o.value, [0.72, 0.92], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(o.value, [0.72, 0.92], [0, h * 0.35], Extrapolation.CLAMP) },
    ],
  }))
  // The card rides between the envelope's back and its pocket until it has
  // risen clear, then above the whole envelope: the envelope can only fade as
  // one sheet (iOS group opacity) with nothing of the card inside it.
  const cardInside = useAnimatedStyle(() => ({ opacity: o.value < 0.72 ? 1 : 0 }))
  const cardAbove = useAnimatedStyle(() => ({ opacity: o.value < 0.72 ? 0 : 1 }))

  const pocket = `M0 0 L${w / 2} ${flapH * 0.98} L${w} 0 L${w} ${h} L0 ${h} Z`
  const flap = `M0 0 L${w} 0 L${w / 2} ${flapH} Z`
  const wax = useMemo(() => waxPath(seal), [seal])
  const flapBox = [styles.flap, { width: w, height: flapH }]
  const innerCard = (place: typeof cardInside) =>
    image && (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.inner,
          { width: inner.width, height: inner.height, left: (w - inner.width) / 2, top: inner.top },
          card,
          place,
        ]}
      >
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
        <HolographicOverlay
          cardWidth={inner.width}
          cardHeight={inner.height}
          rotateX={cardHoloX}
          rotateY={cardHoloY}
          isActive={cardHoloActive}
        />
      </Animated.View>
    )

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: w, height: h }, tilt]}>
        <Animated.View style={[StyleSheet.absoluteFill, body]}>
          {/* the inside of the envelope and the opened flap, both behind the card */}
          <PaperLayer
            id="inside"
            d={`M0 0 H${w} V${h} H0 Z`}
            width={w}
            height={h}
            stops={['#cdb994', '#bfa77c']}
            texture={0.5}
          />
          <Animated.View style={[flapBox, flapOpen]}>
            <PaperLayer
              id="flapIn"
              d={flap}
              width={w}
              height={flapH}
              stops={['#d6c29c', '#e6d7b6']}
              stroke="#b39a70"
              texture={0.45}
            />
          </Animated.View>

          {innerCard(cardInside)}

          {/* the front pocket with its address, the closed flap and the seal */}
          <View style={[StyleSheet.absoluteFill, styles.shadow]} pointerEvents="none">
            <PaperLayer
              id="pocket"
              d={pocket}
              width={w}
              height={h}
              stops={['#f7efdc', '#efe3c7', '#e3d2ae']}
              diagonal
              texture={0.35}
            >
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
            </PaperLayer>
            <View style={[styles.address, { top: h * 0.64, paddingHorizontal: w * 0.04 }]}>
              <Typography
                fontFamily="$script"
                fontSize={w * 0.1}
                lineHeight={w * 0.14}
                color="#4f3b26"
                textAlign="center"
                // Full width, not shrink-wrapped: Android fits a centred item's
                // text to its narrowest wrap and breaks a short name in two.
                alignSelf="stretch"
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
          </View>

          <Animated.View style={[flapBox, styles.shadow, flapClosed]}>
            <PaperLayer
              id="flapOut"
              d={flap}
              width={w}
              height={flapH}
              stops={[paper.light, paper.mid]}
              stroke="#bea57b"
              texture={0.35}
            />
            {note && (
              <View style={[styles.address, { top: flapH * 0.2 }]} pointerEvents="none">
                <Typography
                  variant="reference"
                  fontSize={w * 0.042}
                  lineHeight={w * 0.07}
                  color="#7d6749"
                  letterSpacing={w * 0.006}
                  textTransform="uppercase"
                  numberOfLines={1}
                >
                  {note}
                </Typography>
              </View>
            )}
          </Animated.View>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <HolographicOverlay
              cardWidth={w}
              cardHeight={h}
              rotateX={holoX}
              rotateY={holoY}
              isActive={holoActive}
              intensity={2}
            />
          </View>

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

        {innerCard(cardAbove)}
      </Animated.View>
    </GestureDetector>
  )
}

/**
 * The envelopes waiting, as a stack: the top one sealed, the edges of up to two
 * more beneath it when several wait.
 */
export function EnvelopeStack({
  width,
  count,
  name,
  date,
  shimmer,
}: {
  width: number
  count: number
  name: string
  date: string
  shimmer?: boolean
}) {
  const height = width * envelopeAspect
  return (
    <View style={{ width, height }}>
      {[paper.mid, paper.deep].slice(0, Math.max(count - 1, 0)).map((color, i) => (
        <View
          key={color}
          style={{
            position: 'absolute',
            width,
            height,
            backgroundColor: color,
            transform: [{ translateX: (i + 1) * 5 }, { translateY: -(i + 1) * 5 }],
          }}
        />
      ))}
      <Envelope width={width} name={name} date={date} shimmer={shimmer} />
    </View>
  )
}

// A sheet of the envelope: its shape filled with a paper gradient, the laid
// texture laid over it, and an optional crease line.
function PaperLayer({
  id,
  d,
  width,
  height,
  stops,
  diagonal = false,
  stroke,
  texture,
  children,
}: {
  id: string
  d: string
  width: number
  height: number
  stops: string[]
  diagonal?: boolean
  stroke?: string
  texture: number
  children?: ReactNode
}) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`${id}Fill`} x1="0" y1="0" x2={diagonal ? '1' : '0'} y2="1">
          {stops.map((color, i) => (
            <Stop key={color} offset={i / (stops.length - 1)} stopColor={color} />
          ))}
        </LinearGradient>
        <ClipPath id={`${id}Clip`}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <Path d={d} fill={`url(#${id}Fill)`} stroke={stroke} strokeWidth={stroke ? 0.8 : 0} />
      <SvgImage
        href={paperTexture}
        x={0}
        y={0}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${id}Clip)`}
        opacity={texture}
      />
      {children}
    </Svg>
  )
}

/** The envelope's wax seal on its own, whole: pressed at the foot of a prayer. */
export function WaxSeal({ size }: { size: number }) {
  const wax = useMemo(() => waxPath(size), [size])
  const still = useSharedValue(0)
  return (
    <View style={[styles.seal, { position: 'relative', width: size, height: size }]}>
      <SealHalf side="left" size={size} wax={wax} open={still} />
      <SealHalf side="right" size={size} wax={wax} open={still} />
    </View>
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
  flap: { position: 'absolute', top: 0, left: 0, transformOrigin: 'top' },
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
