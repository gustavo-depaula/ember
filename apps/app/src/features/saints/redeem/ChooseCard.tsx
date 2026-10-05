import { Image } from 'expo-image'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { selectionTick } from '@/lib/haptics'
import { cardInk } from '../components/cardFrame'
import type { SaintEntry } from '../data/catalog'
import { envelopeCard } from './Envelope'

const flyEase = Easing.bezier(0.45, 0, 0.2, 1)
const flyDuration = 900
/** When the envelope, sliding up from below, has arrived under the chosen card. */
export const envelopeRise = 1400
// More than this and the cards no longer fit a row: they make a grid that scrolls.
const rowMax = 3
const gap = 14

type Place = { x: number; y: number; width: number }

/**
 * Before an envelope offering several saints is addressed: the cards it could
 * hold, still veiled, side by side (a grid, for the first cards' twenty). The
 * one tapped lifts out, the envelope slides up under it addressed to its
 * saint (`onChoose`), and it sinks into the envelope (`onChosen`).
 */
export function ChooseCard({
  options,
  title,
  note,
  envelopeWidth,
  onChoose,
  onChosen,
}: {
  options: SaintEntry[]
  title: string
  /** How and when the envelope was won. */
  note: string
  envelopeWidth: number
  onChoose: (id: string) => void
  onChosen: () => void
}) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [chosen, setChosen] = useState<{ saint: SaintEntry; from: Place }>()
  const rest = useSharedValue(1)
  const restStyle = useAnimatedStyle(() => ({ opacity: rest.value }))

  const choose = (saint: SaintEntry, from: Place) => {
    void selectionTick()
    rest.value = withTiming(0, { duration: 300 })
    setChosen({ saint, from })
    onChoose(saint.id)
  }

  const head = (
    <YStack gap="$sm" paddingHorizontal={28}>
      <Typography
        variant="label"
        textTransform="uppercase"
        letterSpacing={1.5}
        textAlign="center"
        color="$colorSecondary"
      >
        {note}
      </Typography>
      <Typography fontFamily="$heading" fontSize={26} lineHeight={34} textAlign="center">
        {title}
      </Typography>
    </YStack>
  )

  const row = options.length <= rowMax
  const cw = row
    ? Math.min(170, (width - 48 - gap * (options.length - 1)) / options.length)
    : // Floored: a fractional third can sum a hair past the row, and Yoga then wraps the third card.
      Math.floor((width - 48 - gap * 2) / 3)
  const cards = options.map((s) => (
    <VeiledCard
      key={s.id}
      saint={s}
      width={cw}
      hidden={chosen?.saint.id === s.id}
      onChoose={(from) => {
        if (!chosen) choose(s, from)
      }}
    />
  ))

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={chosen ? 'none' : 'auto'}>
      <Animated.View style={[StyleSheet.absoluteFill, restStyle]}>
        {row ? (
          <YStack flex={1} justifyContent="center" gap={32}>
            {head}
            <View style={styles.row}>{cards}</View>
          </YStack>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: insets.top + 32,
              paddingBottom: insets.bottom + 32,
              gap: 24,
            }}
          >
            {head}
            <View style={styles.grid}>{cards}</View>
          </ScrollView>
        )}
      </Animated.View>

      {chosen && (
        <FlyingCard
          saint={chosen.saint}
          from={chosen.from}
          to={{ width, height, envelopeWidth }}
          onIn={onChosen}
        />
      )}
    </View>
  )
}

// One offered card as its sepia print, the saint named at its foot.
function VeiledCard({
  saint,
  width,
  hidden,
  onChoose,
}: {
  saint: SaintEntry
  width: number
  /** Chosen: its flying copy has taken its place. */
  hidden: boolean
  onChoose: (from: Place) => void
}) {
  const { t } = useTranslation()
  const ref = useRef<View>(null)
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.chooseSaint', { name: saint.name })}
      onPress={() => ref.current?.measureInWindow((x, y) => onChoose({ x, y, width }))}
      style={({ pressed }) => [pressed && styles.pressed, hidden && styles.hidden]}
    >
      <Print saint={saint} width={width} />
    </Pressable>
  )
}

function Print({ saint, width }: { saint: SaintEntry; width: number }) {
  return (
    <View style={[styles.card, { width, height: width * 1.5 }]}>
      <Image
        source={saint.printImage}
        placeholder={saint.printThumb}
        placeholderContentFit="cover"
        style={styles.fill}
        contentFit="cover"
      />
      <View style={styles.band}>
        <Text
          fontFamily="$heading"
          fontSize={Math.min(16, width * 0.1)}
          color={cardInk.name}
          textAlign="center"
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {saint.name}
        </Text>
      </View>
    </View>
  )
}

// The chosen card, lifted from where it lay to wait half above the top edge
// of the envelope (centred on the screen), which slides up under it — this
// whole chooser is drawn beneath the envelope — and then sinking behind its
// front. It keeps the size of the envelope's own card, smaller only where
// that would rise into the notch.
function FlyingCard({
  saint,
  from,
  to,
  onIn,
}: {
  saint: SaintEntry
  from: Place
  to: { width: number; height: number; envelopeWidth: number }
  onIn: () => void
}) {
  const fly = useSharedValue(0)
  const sink = useSharedValue(0)
  const ch = from.width * 1.5
  const envTop = to.height / 2 - (to.envelopeWidth * 1.28) / 2
  const toH = Math.min(envelopeCard(to.envelopeWidth).height, (envTop - 70) * 2)
  const scale = toH / ch
  const toX = to.width / 2 - (from.x + from.width / 2)
  const toY = envTop - (from.y + ch / 2)
  const sinkBy = toH / 2 + 8

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once, as the card is chosen
  useEffect(() => {
    fly.value = withTiming(1, { duration: flyDuration, easing: flyEase })
    sink.value = withDelay(
      envelopeRise + 100,
      withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }, (done) => {
        if (done) runOnJS(onIn)()
      }),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: fly.value * toX },
      { translateY: fly.value * toY + sink.value * sinkBy },
      { scale: 1 + fly.value * (scale - 1) },
    ],
  }))

  return (
    <Animated.View style={[styles.flying, { left: from.x, top: from.y }, style]}>
      <Print saint={saint} width={from.width} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', justifyContent: 'center', gap },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#b89a5e',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '8%',
  },
  flying: { position: 'absolute' },
  pressed: { transform: [{ scale: 0.97 }] },
  hidden: { opacity: 0 },
})
