import { memo, type ReactNode, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { Text, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import type { SaintEntry } from '../data/catalog'
import { useSaintsCatalog } from '../data/catalog'
import { useCopies } from '../data/collection'
import { useSaintCollect } from '../useSaintCollect'
import { useSaintLife } from '../useSaintLife'
import { SaintCard, saintCardWidth } from './SaintCard'
import { CardsChapter, FeastChapter, LifeChapter, PrayChapter, ReadChapter } from './SaintChapters'

// The hero is a dark stage whatever the theme: the card is lit against it.
const night = '#17120E'
const cream = '#F5EEE1'
const creamMuted = '#DACAB2'
const gold = '#C9A84C'
const chipIdle = '#B9A98F'

// The docked card in the collapsed bar, and the bar's two rows.
const dockWidth = 34
const dockLeft = 16
const barRow = 60
const chipsRow = 36
const pagePadding = 24
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI']

type Chapter = {
  key: string
  title: string
  chip: string
  meta?: string
  /** Set on a tinted band, apart from the reading around it. */
  band?: boolean
  body: ReactNode
}

/**
 * One card's page. The card is the hero of a page you scroll: as it goes, the
 * card shrinks into the corner of a slim bar that keeps the saint's name and
 * the chapters in reach. Below: the words on the card, a contents list, and
 * the chapters the card has (life, prayers, reading, feast, related cards).
 */
export const SaintPage = memo(function SaintPage({
  saint,
  width,
  height,
  onOpenCard,
}: {
  saint: SaintEntry
  width: number
  height: number
  onOpenCard: (id: string) => void
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { byId } = useSaintsCatalog()
  const held = useCopies(saint.id).length > 0
  const life = useSaintLife(saint.lifeChapter)
  const feast = useSaintCollect(saint.proper)

  const chapters = (() => {
    const out: Chapter[] = []
    // A season, a part of the Mass or a vestment has no life to tell.
    const lifeKey = saint.kind ? 'about' : 'life'
    if (life || feast?.about || saint.reflection) {
      out.push({
        key: 'life',
        title: t(`saints.page.${lifeKey}`),
        chip: t(`saints.page.chip.${lifeKey}`),
        meta: life ? t('saints.page.minutes', { count: life.minutes }) : undefined,
        body: <LifeChapter saint={saint} life={life} about={feast?.about} />,
      })
    }
    if (saint.pray.length > 0) {
      out.push({
        key: 'pray',
        title: t('saints.page.prayers'),
        chip: t('saints.page.chip.prayers'),
        meta: String(saint.pray.reduce((n, s) => n + s.refs.length, 0)),
        body: <PrayChapter shelves={saint.pray} />,
      })
    }
    if (saint.read.length > 0 || saint.collections.length > 0) {
      const count = saint.read.reduce((n, s) => n + s.refs.length, 0) + saint.collections.length
      out.push({
        key: 'read',
        title: t('saints.page.reading'),
        chip: t('saints.page.chip.reading'),
        meta: String(count),
        body: <ReadChapter shelves={saint.read} collections={saint.collections} />,
      })
    }
    if (feast) {
      out.push({
        key: 'feast',
        title: t('saints.page.feast'),
        chip: t('saints.page.chip.feast'),
        meta: saint.feastLabel,
        band: true,
        body: <FeastChapter saint={saint} feast={feast} />,
      })
    }
    const cards = saint.relatedCards.map((id) => byId[id]).filter((c): c is SaintEntry => !!c)
    if (cards.length > 0) {
      out.push({
        key: 'cards',
        title: t('saints.page.cards'),
        chip: t('saints.page.chip.cards'),
        meta: String(cards.length),
        body: <CardsChapter cards={cards} onOpenCard={onOpenCard} />,
      })
    }
    return out
  })()
  const hasChips = chapters.length > 1

  // The card as large as the screen allows with the name still under it.
  const cardTop = insets.top + 58
  const cardWidth = Math.min(saintCardWidth(width), Math.floor((height - cardTop - 170) / 1.5))
  const cardHeight = cardWidth * 1.5
  const [nameHeight, setNameHeight] = useState(96)
  const full = cardTop + cardHeight + 20 + nameHeight + 24
  const slim = insets.top + barRow + (hasChips ? chipsRow : 0)
  const range = full - slim
  const dockScale = dockWidth / cardWidth
  // Where the card's centre travels to dock, from where it rests.
  const dx = dockLeft + dockWidth / 2 - width / 2
  const dy = insets.top + 4 + (dockWidth * 1.5) / 2 - (cardTop + cardHeight / 2)

  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const y = useSharedValue(0)
  // The last chapter is often too short to reach the top; at the page's foot it is the one read.
  const atEnd = useSharedValue(false)
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y
    atEnd.value = e.contentOffset.y + e.layoutMeasurement.height >= e.contentSize.height - 8
  })

  // Each chapter's top within the scroll, for the chips: which one is being
  // read, and where a tap on one lands.
  const tops = useRef<number[]>([])
  const topsShared = useSharedValue<number[]>([])
  const [active, setActive] = useState(0)
  const [docked, setDocked] = useState(false)
  const setTop = useCallback(
    (index: number, top: number) => {
      tops.current[index] = top
      topsShared.value = [...tops.current]
    },
    [topsShared],
  )

  useAnimatedReaction(
    () => {
      let index = 0
      for (let i = 0; i < topsShared.value.length; i++) {
        if (topsShared.value[i] - slim - 48 <= y.value) index = i
      }
      return atEnd.value ? Math.max(0, topsShared.value.length - 1) : index
    },
    (index, previous) => {
      if (index !== previous) runOnJS(setActive)(index)
    },
  )
  useAnimatedReaction(
    () => y.value >= range - 1,
    (isDocked, previous) => {
      if (isDocked !== previous) runOnJS(setDocked)(isDocked)
    },
  )

  const goTo = (index: number) => {
    const top = tops.current[index]
    if (top !== undefined) scrollRef.current?.scrollTo({ y: top - slim + 4, animated: true })
  }

  const heroStyle = useAnimatedStyle(() => ({ height: Math.max(slim, full - y.value) }))
  const cardStyle = useAnimatedStyle(() => {
    const e = eased(y.value / range)
    return {
      transform: [
        { translateX: dx * e },
        { translateY: dy * e },
        { scale: 1 + (dockScale - 1) * e },
      ],
    }
  })
  // The live card answers a finger only at rest: once the page moves it is
  // on its way to the bar, and a drag is a scroll.
  const cardProps = useAnimatedProps(() => ({
    pointerEvents: y.value > 6 ? ('none' as const) : ('auto' as const),
  }))
  // The name cannot travel with the card without crossing it, so the large one
  // rides under the card and fades, and a small one fades in beside the dock.
  const nameStyle = useAnimatedStyle(() => {
    const t = clamp(y.value / range)
    const e = eased(y.value / range)
    const scale = 1 + (dockScale - 1) * e
    return {
      opacity: clamp(1 - t * 2.4),
      transform: [
        { translateY: cardTop + cardHeight / 2 + dy * e + (cardHeight * scale) / 2 + 20 },
      ],
    }
  })
  const dockedNameStyle = useAnimatedStyle(() => ({
    opacity: clamp((y.value / range - 0.7) / 0.3),
  }))
  const chipsStyle = useAnimatedStyle(() => ({ opacity: clamp((y.value / range - 0.8) / 0.2) }))

  return (
    <View width={width} height={height} backgroundColor="$background">
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: full, paddingBottom: insets.bottom + 120 }}
      >
        {held && saint.prayerExcerpt && (
          <YStack alignItems="center" gap="$sm" paddingHorizontal={36} paddingTop="$xl">
            <Text fontFamily="$heading" fontSize={17} color="$accent">
              ✠
            </Text>
            <Typography
              variant="interface"
              fontStyle="italic"
              fontSize="$4"
              lineHeight={30}
              textAlign="center"
            >
              {saint.prayerExcerpt}
            </Typography>
          </YStack>
        )}

        {hasChips && (
          <YStack
            marginHorizontal={pagePadding}
            marginTop="$xl"
            paddingVertical="$xs"
            borderTopWidth={1}
            borderBottomWidth={1}
            borderColor="$color"
          >
            {chapters.map((chapter, i) => (
              <AnimatedPressable
                key={chapter.key}
                onPress={() => goTo(i)}
                accessibilityRole="button"
                accessibilityLabel={chapter.title}
              >
                <XStack alignItems="baseline" paddingVertical={6}>
                  <Text fontFamily="$heading" fontSize={12} color="$colorBurgundy" width={30}>
                    {numerals[i]}
                  </Text>
                  <Typography variant="interface" fontSize="$3" flex={1}>
                    {chapter.title}
                  </Typography>
                  {chapter.meta && <Typography variant="annotation">{chapter.meta}</Typography>}
                </XStack>
              </AnimatedPressable>
            ))}
          </YStack>
        )}

        {chapters.map((chapter, i) => (
          <YStack
            key={chapter.key}
            onLayout={(e) => setTop(i, e.nativeEvent.layout.y)}
            paddingHorizontal={pagePadding}
            paddingTop="$xl"
            paddingBottom={chapter.band ? '$xl' : 0}
            marginTop={chapter.band ? '$xl' : '$sm'}
            backgroundColor={chapter.band ? '$backgroundSurface' : 'transparent'}
            gap="$md"
          >
            <YStack alignItems="center" gap={2}>
              {hasChips && (
                <Text fontFamily="$heading" fontSize={14} letterSpacing={3} color="$accent">
                  {numerals[i]}
                </Text>
              )}
              <Typography variant="sacred-title" fontSize={22} lineHeight={28}>
                {chapter.title}
              </Typography>
            </YStack>
            {chapter.body}
          </YStack>
        ))}
      </Animated.ScrollView>

      {/* Over the scroll, and open to it: a touch on the dark stage scrolls the
          page beneath; only the card and the chips take one for themselves. */}
      <Animated.View style={[styles.hero, heroStyle]} pointerEvents="box-none">
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={full}>
            <Defs>
              <RadialGradient id="stage" cx="50%" cy="30%" rx="110%" ry="65%">
                <Stop offset="0" stopColor="#3A2C1E" />
                <Stop offset="1" stopColor={night} />
              </RadialGradient>
            </Defs>
            <Rect width={width} height={full} fill="url(#stage)" />
          </Svg>
        </View>

        <Animated.View
          style={[styles.name, { width }, nameStyle]}
          pointerEvents="none"
          onLayout={(e) => setNameHeight(e.nativeEvent.layout.height)}
        >
          <Text fontFamily="$title" fontSize={28} lineHeight={34} color={cream} textAlign="center">
            {saint.name}
          </Text>
          {saint.feastLabel && (
            <Text
              fontFamily="$heading"
              fontSize={11}
              letterSpacing={2}
              textTransform="uppercase"
              color={creamMuted}
              marginTop={4}
            >
              {saint.feastLabel}
            </Text>
          )}
          {saint.patronOf && (
            <Typography
              variant="interface"
              fontStyle="italic"
              fontSize={17}
              color={creamMuted}
              textAlign="center"
              marginTop={2}
            >
              {saint.patronOf}
            </Typography>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { left: (width - cardWidth) / 2, top: cardTop, width: cardWidth, height: cardHeight },
            cardStyle,
          ]}
          animatedProps={cardProps}
        >
          <SaintCard saint={saint} width={cardWidth} />
        </Animated.View>

        <Animated.View
          style={[
            styles.dockedName,
            { top: insets.top + 4, height: dockWidth * 1.5 },
            dockedNameStyle,
          ]}
          pointerEvents="none"
        >
          <Text fontFamily="$title" fontSize={16} color={cream} numberOfLines={1}>
            {saint.name}
          </Text>
        </Animated.View>

        {/* The docked card is a picture; a tap on it brings the live one back. */}
        {docked && (
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={[styles.dockTap, { top: insets.top, height: barRow }]}
            accessibilityRole="button"
            accessibilityLabel={t('saints.page.backToCard')}
          />
        )}

        {hasChips && (
          <Animated.View
            style={[styles.chips, chipsStyle]}
            pointerEvents={docked ? 'auto' : 'none'}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContent}
            >
              {chapters.map((chapter, i) => (
                <Pressable
                  key={chapter.key}
                  onPress={() => goTo(i)}
                  style={[styles.chip, i === active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={chapter.title}
                >
                  <Text
                    fontFamily="$heading"
                    fontSize={11}
                    letterSpacing={1.5}
                    textTransform="uppercase"
                    color={i === active ? gold : chipIdle}
                  >
                    {chapter.chip}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  )
})

function clamp(v: number) {
  'worklet'
  return Math.min(1, Math.max(0, v))
}

// Smoothstep: the card leaves the centre slowly and docks quickly.
function eased(v: number) {
  'worklet'
  const t = clamp(v)
  return t * t * (3 - 2 * t)
}

const styles = StyleSheet.create({
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: night,
  },
  card: { position: 'absolute' },
  name: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dockedName: {
    position: 'absolute',
    left: dockLeft + dockWidth + 12,
    right: 72,
    justifyContent: 'center',
  },
  dockTap: { position: 'absolute', left: 0, right: 72 },
  chips: { position: 'absolute', left: 0, right: 0, bottom: 0, height: chipsRow },
  chipsContent: { paddingHorizontal: dockLeft, gap: 20 },
  chip: {
    height: chipsRow,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chipActive: { borderBottomColor: gold },
})
