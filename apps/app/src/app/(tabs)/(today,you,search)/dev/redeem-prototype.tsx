// biome-ignore-all lint/correctness/useHookAtTopLevel: dev-only screen; the __DEV__ guard is compiled out of production
// PROTOTYPE — throwaway, never merge to main.
// Question: how should redeeming a won holy card feel? The card arrives in a
// sealed envelope; nothing of it shows until Amen breaks the seal. A short
// introduction to the saint and a prayer with him open it; his full Life waits
// under the card afterwards, as a reward rather than a toll.
// Two layouts, switched by ?variant= and the floating pill at the top.
//   ember://dev/redeem-prototype?variant=two    envelope · introduction and prayer on one page
//   ember://dev/redeem-prototype?variant=three  envelope · introduction · prayer

import { Image } from 'expo-image'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useTheme, YStack } from 'tamagui'
import { Typography } from '@/components'
import { SaintCard, useSaintsCatalog } from '@/features/saints'
import { HolographicOverlay } from '@/features/saints/components/HolographicOverlay'
import { lightTap, mediumTap, successBuzz } from '@/lib/haptics'

const variants = ['two', 'three'] as const
type Variant = (typeof variants)[number]
const variantNames: Record<Variant, string> = {
  two: 'Envelope · intro + prayer',
  three: 'Envelope · intro · prayer',
}

const howWon = 'Received at Mass on his memorial · 4 Oct 2026'
const deadline = 'Open it by tomorrow night'

// A short introduction written for the card, drawn from the Pictorial Lives entry below.
const intro =
  'The son of a wealthy merchant of Assisi, he gave up everything to follow Christ in poverty. Many joined him, and during a retreat of fasting and prayer he received the five wounds of Jesus in his hands, feet and side.'

const life = [
  "ST. FRANCIS, the son of a merchant of Assisi, was born in that city in 1182. Chosen by God to be a living manifestation to the world of Christ's poor and suffering life on earth, he was early inspired with a high esteem and burning love of poverty and humiliation. The thought of the Man of Sorrows, Who had not where to lay His head, filled him with holy envy of the poor, and constrained him to renounce the wealth and worldly station which he abhorred. The scorn and hard usage which he met with from his father and townsmen when he appeared among them in the garb of poverty were delightful to him. \"Now,\" he exclaimed, \"I can say truly, 'Our Father Who art in heaven.'\"",
  'But divine love burned in him too mightily not to kindle like desires in other hearts. Many joined themselves to him, and were constituted by Pope Innocent III. into a religious Order, which spread rapidly throughout Christendom.',
  'St. Francis, after visiting the East in the vain quest of martyrdom, spent his life like his Divine Master—now in preaching to the multitudes, now amid desert solitudes in fasting and contemplation. During one of these retreats he received on his hands, feet, and side the print of the five bleeding wounds of Jesus. With the cry, "Welcome, sister Death," he passed to the glory of his God October 4, 1226.',
]
const reflection =
  '"My God and my all," St. Francis’ constant prayer, explains both his poverty and his wealth.'
const collect = [
  'O God, by whose gift Saint Francis was conformed to Christ in poverty and humility,',
  "grant that, by walking in Francis' footsteps,",
  'we may follow your Son,',
  'and, through joyful charity,',
  'come to be united with you.',
  'Through our Lord Jesus Christ, your Son,',
  'who lives and reigns with you in the unity of the Holy Spirit,',
  'one God, for ever and ever.',
]

const openDuration = 3200

export default function RedeemPrototype() {
  if (!__DEV__) return <Redirect href="/" />
  const params = useLocalSearchParams<{ variant?: string }>()
  const router = useRouter()
  const [run, setRun] = useState(0)
  const variant: Variant = variants.includes(params.variant as Variant)
    ? (params.variant as Variant)
    : 'two'

  const cycle = (step: number) => {
    const next = variants[(variants.indexOf(variant) + step + variants.length) % variants.length]
    router.setParams({ variant: next })
  }

  return (
    <View style={styles.fill}>
      <Flow key={`${variant}-${run}`} variant={variant} />
      <Switcher
        label={variantNames[variant]}
        onPrev={() => cycle(-1)}
        onNext={() => cycle(1)}
        onRestart={() => setRun((n) => n + 1)}
      />
    </View>
  )
}

function Flow({ variant }: { variant: Variant }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const { byId } = useSaintsCatalog()
  const saint = byId.francis_assisi
  const [phase, setPhase] = useState<'reading' | 'opening' | 'card'>('reading')
  const pages = variant === 'two' ? 2 : 3
  const progress = useSharedValue(0)
  const open = useSharedValue(0)
  const lifeShown = useSharedValue(0)

  const onScroll = useAnimatedScrollHandler((e) => {
    progress.value = Math.min(Math.max(e.contentOffset.x / width, 0), pages - 1)
  })

  const amen = () => {
    void successBuzz()
    setPhase('opening')
    open.value = 0
    open.value = withTiming(1, { duration: openDuration, easing: Easing.inOut(Easing.cubic) })
    setTimeout(() => void mediumTap(), openDuration * 0.12)
    setTimeout(() => void lightTap(), openDuration * 0.5)
    setTimeout(() => setPhase('card'), openDuration + 150)
  }

  const lifeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - lifeShown.value) * height }],
  }))

  if (!saint?.cardImage) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Typography variant="annotation">Loading St. Francis's card…</Typography>
      </YStack>
    )
  }

  const bg = theme.background?.val
  const bigEnv = Math.min(width * 0.68, 280)
  const pageTop = { paddingTop: insets.top + 56 }

  const introBlock = (
    <YStack gap="$sm" paddingBottom="$xl">
      <Typography variant="sacred-title" fontSize={30} lineHeight={36}>
        St. Francis of Assisi
      </Typography>
      <Typography variant="reference" textTransform="uppercase">
        October 4
      </Typography>
      <Typography variant="interface" fontSize="$4" lineHeight={28} paddingTop="$sm">
        {intro}
      </Typography>
    </YStack>
  )

  const prayerBlock = (
    <YStack>
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} paddingBottom="$sm">
        Let us pray
      </Typography>
      {collect.map((line) => (
        <Typography key={line} variant="interface" fontSize="$4" lineHeight={28}>
          {line}
        </Typography>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Amen"
        onPress={amen}
        disabled={phase !== 'reading'}
        style={[styles.amen, { borderColor: theme.accent?.val }]}
      >
        <Typography variant="sacred-title" fontSize={22} color="$accent">
          Amen
        </Typography>
      </Pressable>
    </YStack>
  )

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.fill}
      >
        <Page width={width}>
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$xl" paddingBottom={120}>
            <Envelope width={bigEnv} image={saint.cardImage} open={undefined} />
            <YStack gap="$sm" alignItems="center">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                A holy card for you
              </Typography>
              <Typography variant="whisper" textAlign="center">
                {howWon}
              </Typography>
              <Typography variant="annotation" textAlign="center">
                {deadline}
              </Typography>
              <Typography variant="annotation" textAlign="center" paddingTop="$lg">
                Pray with him to open it →
              </Typography>
            </YStack>
          </YStack>
        </Page>

        {variant === 'two' ? (
          <Page width={width}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageScroll, pageTop]}>
              {introBlock}
              {prayerBlock}
            </ScrollView>
          </Page>
        ) : (
          <>
            <Page width={width}>
              <YStack flex={1} justifyContent="center" paddingBottom={160}>
                {introBlock}
              </YStack>
            </Page>
            <Page width={width}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageScroll, pageTop]}>
                {prayerBlock}
              </ScrollView>
            </Page>
          </>
        )}
      </Animated.ScrollView>

      <Dots progress={progress} count={pages} />

      {phase !== 'reading' && (
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[StyleSheet.absoluteFill, { alignItems: 'center', backgroundColor: bg, paddingTop: height * 0.42 }]}
        >
          <Envelope
            width={bigEnv}
            image={saint.cardImage}
            open={open}
            exit={(() => {
              // Glide the risen card onto the spot where the full SaintCard appears,
              // so the swap to it is invisible.
              const w = bigEnv
              const cardW = w * 0.8
              const cardH = cardW * 1.5
              const risenCenter = height * 0.42 + w * 1.28 - cardH - w * 0.04 - cardH * 0.92 + cardH / 2
              const finalW = Math.min(width - 48, 340)
              return { dy: insets.top + 24 + finalW * 0.75 - risenCenter, scale: finalW / cardW }
            })()}
          />
        </Animated.View>
      )}

      {phase === 'card' && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[StyleSheet.absoluteFill, styles.final, { backgroundColor: bg, paddingTop: insets.top + 24 }]}
        >
          <SaintCard saint={saint} />
          <Typography variant="whisper" textAlign="center" paddingTop="$lg">
            {howWon}
          </Typography>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Read his life"
            hitSlop={12}
            onPress={() => {
              void lightTap()
              lifeShown.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
            }}
          >
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} paddingTop="$lg" color="$accent">
              Read his life ↑
            </Typography>
          </Pressable>
        </Animated.View>
      )}

      {phase === 'card' && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bg }, lifeStyle]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.lifeScroll, pageTop]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to the card"
              hitSlop={12}
              onPress={() => {
                lifeShown.value = withTiming(0, { duration: 380, easing: Easing.in(Easing.cubic) })
              }}
            >
              <Typography variant="annotation" paddingBottom="$lg">
                ↓ Back to the card
              </Typography>
            </Pressable>
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} paddingBottom="$xs">
              The life of
            </Typography>
            <Typography variant="sacred-title" fontSize={30} lineHeight={36} paddingBottom="$md">
              St. Francis of Assisi
            </Typography>
            {life.map((p) => (
              <Typography key={p.slice(0, 20)} variant="interface" fontSize="$4" lineHeight={28} paddingBottom="$md">
                {p}
              </Typography>
            ))}
            <Typography variant="whisper" fontStyle="italic" paddingTop="$sm">
              {reflection}
            </Typography>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}

function Page({ width, children }: { width: number; children: React.ReactNode }) {
  return <View style={{ width, paddingHorizontal: 28 }}>{children}</View>
}

type CardImage = NonNullable<ReturnType<typeof useSaintsCatalog>['byId'][string]['cardImage']>

const paperTexture = require('../../../../../assets/prototype-paper.png')
const maxTilt = 15

// The wax: a blob with a lumpy rim and two small runs where it pooled.
function waxPath(size: number) {
  const c = size / 2
  const r = size * 0.44
  const points = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2
    const k = 1 + 0.05 * Math.sin(5 * a + 0.7) + 0.035 * Math.sin(9 * a + 1.9) + 0.02 * Math.sin(14 * a)
    return `${i === 0 ? 'M' : 'L'}${(c + Math.cos(a) * r * k).toFixed(2)} ${(c + Math.sin(a) * r * k).toFixed(2)}`
  })
  return `${points.join(' ')} Z`
}

// A laid-paper envelope, sealed with red wax and a gold ✠. Idle, it shimmers now
// and then and tilts under your finger (the holy card's own holographic sheen, a
// hint of what's inside). With `open` it plays the opening: the seal splits, the
// flap swings up, the card rises out shimmering and glides to where the full
// card appears.
function Envelope({
  width: w,
  image,
  open,
  exit = { dy: 0, scale: 1.12 },
}: {
  width: number
  image: CardImage
  open: SharedValue<number> | undefined
  exit?: { dy: number; scale: number }
}) {
  const h = w * 1.28
  const flapH = h * 0.5
  const cardW = w * 0.8
  const cardH = cardW * 1.5
  const seal = w * 0.24
  const still = useSharedValue(0)
  const o = open ?? still

  // The tease: every few seconds a sheen crosses the envelope as if it tilted.
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
    .enabled(!open)
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
  const tilt = useAnimatedStyle(() => {
    const k = (touching.value ? 0.6 : 0.18) * calm.value
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${(touching.value ? touchX.value : holoX.value) * k}deg` },
        { rotateY: `${(touching.value ? touchY.value : holoY.value) * k}deg` },
      ],
    }
  })

  // The card's own sheen as it rises, fading out as it settles into place.
  const cardHoloY = useDerivedValue(() => interpolate(o.value, [0.3, 1], [-maxTilt, maxTilt]))
  const cardHoloX = useDerivedValue(() => interpolate(o.value, [0.3, 1], [maxTilt * 0.6, -maxTilt * 0.6]))
  const cardHoloActive = useDerivedValue(() =>
    interpolate(o.value, [0.34, 0.5, 0.86, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  )

  // 0–0.15 seal splits · 0.12–0.4 flap swings open · 0.36–0.72 card rises ·
  // 0.7–0.92 envelope falls away · 0.74–1 card glides into place
  const sealLeft = useAnimatedStyle(() => ({
    opacity: interpolate(o.value, [0.06, 0.18], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(o.value, [0, 0.16], [0, -seal * 0.35], Extrapolation.CLAMP) },
      { translateY: interpolate(o.value, [0, 0.16], [0, seal * 0.25], Extrapolation.CLAMP) },
      { rotate: `${interpolate(o.value, [0, 0.16], [0, -22], Extrapolation.CLAMP)}deg` },
    ],
  }))
  const sealRight = useAnimatedStyle(() => ({
    opacity: interpolate(o.value, [0.06, 0.18], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(o.value, [0, 0.16], [0, seal * 0.35], Extrapolation.CLAMP) },
      { translateY: interpolate(o.value, [0, 0.16], [0, seal * 0.3], Extrapolation.CLAMP) },
      { rotate: `${interpolate(o.value, [0, 0.16], [0, 22], Extrapolation.CLAMP)}deg` },
    ],
  }))
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
    transform: [{ translateY: interpolate(o.value, [0.7, 0.92], [0, h * 0.35], Extrapolation.CLAMP) }],
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
        {/* inside of the envelope, then the opened flap, both behind the card */}
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
        <Animated.View style={[styles.flap, { width: w, height: flapH, transformOrigin: 'top' }, flapOpen]}>
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

        {/* the front pocket, the closed flap and the seal */}
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
            <Path d={`M0.5 0.5 H${w - 0.5} V${h - 0.5} H0.5 Z`} stroke="#c4ad85" strokeWidth={1} fill="none" />
          </Svg>
          <View style={[styles.address, { top: h * 0.66 }]}>
            <Typography fontFamily="$script" fontSize={w * 0.11} lineHeight={w * 0.15} color="#4f3b26">
              St. Francis of Assisi
            </Typography>
            <Typography variant="reference" fontSize={w * 0.05} color="#7d6749" letterSpacing={1}>
              4 OCTOBER 2026
            </Typography>
          </View>
        </Animated.View>

        <Animated.View style={[styles.flap, styles.shadow, { width: w, height: flapH, transformOrigin: 'top' }, flapClosed]}>
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

        {/* the sheen that crosses the closed envelope */}
        <Animated.View style={[StyleSheet.absoluteFill, body]} pointerEvents="none">
          <HolographicOverlay cardWidth={w} cardHeight={h} rotateX={holoX} rotateY={holoY} isActive={holoActive} />
          {/* twice: the card's sheen is tuned for a painted card and reads faint on cream paper */}
          <HolographicOverlay cardWidth={w} cardHeight={h} rotateX={holoX} rotateY={holoY} isActive={holoActive} />
        </Animated.View>

        <View
          style={[styles.seal, styles.sealShadow, { width: seal, height: seal, left: w / 2 - seal / 2, top: flapH - seal * 0.6 }]}
          pointerEvents="none"
        >
          {[sealLeft, sealRight].map((style, i) => (
            <Animated.View
              key={i === 0 ? 'l' : 'r'}
              style={[{ position: 'absolute', top: 0, width: seal / 2, height: seal, left: i * (seal / 2), overflow: 'hidden' }, style]}
            >
              <View style={{ position: 'absolute', left: -i * (seal / 2), width: seal, height: seal }}>
                <Svg width={seal} height={seal}>
                  <Defs>
                    <RadialGradient id={`wax${i}`} cx="38%" cy="32%" r="75%">
                      <Stop offset="0" stopColor="#c0474a" />
                      <Stop offset="0.45" stopColor="#962a2e" />
                      <Stop offset="0.85" stopColor="#6d171b" />
                      <Stop offset="1" stopColor="#551014" />
                    </RadialGradient>
                  </Defs>
                  <Path d={wax} fill={`url(#wax${i})`} />
                  {/* the pressed ring: shadow on one side, catch-light on the other */}
                  <Circle cx={seal / 2 + 0.8} cy={seal / 2 + 0.8} r={seal * 0.3} stroke="#3f0a0d" strokeOpacity={0.55} strokeWidth={1.6} fill="none" />
                  <Circle cx={seal / 2 - 0.6} cy={seal / 2 - 0.6} r={seal * 0.3} stroke="#e7888a" strokeOpacity={0.35} strokeWidth={1} fill="none" />
                  <Path
                    d={`M${seal * 0.24} ${seal * 0.36} Q${seal * 0.32} ${seal * 0.2} ${seal * 0.5} ${seal * 0.16}`}
                    stroke="#ffffff"
                    strokeOpacity={0.35}
                    strokeWidth={seal * 0.035}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
                <View style={[StyleSheet.absoluteFill, styles.center]}>
                  <Typography fontFamily="$display" fontSize={seal * 0.36} lineHeight={seal * 0.5} color="#e0bd68">
                    ✠
                  </Typography>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

function Dots({ progress, count }: { progress: SharedValue<number>; count: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <Dot key={i} i={i} progress={progress} />
      ))}
    </View>
  )
}

function Dot({ i, progress }: { i: number; progress: SharedValue<number> }) {
  const theme = useTheme()
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(progress.value - i), [0, 1], [1, 0.25], Extrapolation.CLAMP),
  }))
  return <Animated.View style={[styles.dot, { backgroundColor: theme.color?.val }, style]} />
}

function Switcher({
  label,
  onPrev,
  onNext,
  onRestart,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
  onRestart: () => void
}) {
  const insets = useSafeAreaInsets()
  const tap = (fn: () => void) => () => {
    void lightTap()
    fn()
  }
  return (
    <View style={[styles.switcher, { top: insets.top + 4 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous variant" onPress={tap(onPrev)} hitSlop={12}>
        <Typography color="white" fontSize={20}>‹</Typography>
      </Pressable>
      <Typography color="white" fontSize={13}>{label}</Typography>
      <Pressable accessibilityRole="button" accessibilityLabel="Next variant" onPress={tap(onNext)} hitSlop={12}>
        <Typography color="white" fontSize={20}>›</Typography>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Restart" onPress={tap(onRestart)} hitSlop={12}>
        <Typography color="white" fontSize={18}>↺</Typography>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingBottom: 8 },
  inner: { position: 'absolute', borderRadius: 6, overflow: 'hidden' },
  flap: { position: 'absolute', top: 0, left: 0 },
  shadow: { shadowColor: '#3b2a14', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  address: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  seal: { position: 'absolute' },
  sealShadow: { shadowColor: '#2a0608', shadowOpacity: 0.35, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  pageScroll: { paddingTop: 24, paddingBottom: 160 },
  lifeScroll: { paddingHorizontal: 28, paddingBottom: 80 },
  amen: {
    alignSelf: 'center',
    marginTop: 32,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, position: 'absolute', bottom: 110, left: 0, right: 0 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  final: { alignItems: 'center' },
  switcher: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(20,20,20,0.75)',
  },
})
