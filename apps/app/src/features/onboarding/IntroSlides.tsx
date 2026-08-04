import { Image } from 'expo-image'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, type LayoutChangeEvent, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { YStack } from 'tamagui'

import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { artFor } from '@/features/explore/artMap'
import { blockInk, blockLabelInk, toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { selectionTick } from '@/lib/haptics'

import { PrimaryButton, SkipButton } from './OnboardingButtons'
import { Dots } from './OnboardingProgress'
import { VigilShell } from './OnboardingScaffold'

type Slide = { title: string; body: string }

// One masterpiece per slide, borrowed from the corpus art tree by catalog id so
// the tour speaks the same visual language as the tradition and book heroes:
// a soul at prayer, the Angelus in a day's work, the Supper, Jerome at study.
const slideArtIds = [
  'collection/mental-prayer',
  'plan-of-life-template/opus-dei',
  'collection/eucharistic',
  'collection/spiritual-classics',
]

/**
 * The features-overview carousel — full-bleed paintings under cream ink, swiped
 * one to the next. Used both as the first onboarding step and, in `revisit`
 * mode, from Settings (Done returns, no skip, no flow advance).
 */
export function IntroSlides({
  onDone,
  onSkip,
  revisit = false,
}: {
  onDone: () => void
  onSkip?: () => void
  revisit?: boolean
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const slides = t('onboarding.intro.slides', { returnObjects: true }) as Slide[]
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [active, setActive] = useState(0)
  const listRef = useRef<FlatList<Slide>>(null)
  // Tracks the last index we reacted to, and whether the move was button-driven
  // (so a page turn ticks only on a real swipe — the Continue button already taps).
  const lastIndex = useRef(0)
  const buttonDriven = useRef(false)
  const isLast = active >= slides.length - 1

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize({ width, height })
  }, [])

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (size.width <= 0) return
      const i = Math.max(
        0,
        Math.min(Math.round(e.nativeEvent.contentOffset.x / size.width), slides.length - 1),
      )
      if (i === lastIndex.current) return
      lastIndex.current = i
      setActive(i)
      if (buttonDriven.current) buttonDriven.current = false
      else selectionTick()
    },
    [size.width, slides.length],
  )

  const primary = () => {
    if (isLast) return onDone()
    buttonDriven.current = true
    listRef.current?.scrollToOffset({ offset: (active + 1) * size.width, animated: true })
  }

  const primaryLabel = isLast
    ? revisit
      ? t('common.done')
      : t('onboarding.intro.getStarted')
    : t('common.continue')

  return (
    <VigilShell>
      <YStack flex={1} backgroundColor="$background" onLayout={onLayout}>
        {size.width > 0 ? (
          <FlatList
            ref={listRef}
            data={slides}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <SlideFace
                slide={item}
                index={index}
                width={size.width}
                height={size.height}
                insetTop={insets.top}
              />
            )}
          />
        ) : null}

        {/* The controls float over the painting's darkened foot. */}
        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          paddingBottom={insets.bottom + 16}
          paddingHorizontal="$lg"
          gap="$md"
        >
          <Dots count={slides.length} activeIndex={active} fill={false} />
          <YStack gap="$sm">
            <PrimaryButton label={primaryLabel} onPress={primary} />
            {!revisit && onSkip ? <SkipButton onPress={onSkip} /> : null}
          </YStack>
        </YStack>
      </YStack>
    </VigilShell>
  )
}

/** One full-bleed painting with the slide's title and body set over its foot. */
function SlideFace({
  slide,
  index,
  width,
  height,
  insetTop,
}: {
  slide: Slide
  index: number
  width: number
  height: number
  insetTop: number
}) {
  const artId = slideArtIds[index % slideArtIds.length]
  const art = artFor(artId)
  const tone = toneByIndex(toneIndexForId(artId))

  return (
    // Explicit height, not flex — a horizontal FlatList row doesn't inherit the
    // list's height, which silently top-aligns the slide.
    <YStack width={width} height={height} backgroundColor={tone.from} justifyContent="flex-end">
      {art ? (
        <Image
          source={art}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={280}
          cachePolicy="memory-disk"
          accessibilityLabel={slide.title}
        />
      ) : null}
      {/* Deep at the foot so cream ink and the controls stay legible over a
          bright painting; the top stays clear so the art reads. Same SVG scrim
          idiom as the search shortcut covers. */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="onboarding-slide-scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.3" stopColor="#0E0D0C" stopOpacity="0" />
            <Stop offset="0.7" stopColor="#0E0D0C" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#0E0D0C" stopOpacity="0.96" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#onboarding-slide-scrim)" />
      </Svg>

      <YStack
        paddingTop={insetTop}
        paddingHorizontal="$lg"
        // Clear the dots + buttons pinned to the screen's foot.
        paddingBottom={200}
        gap="$sm"
        // The scrim is absolutely positioned, so in-flow text would paint under
        // it on web (positioned boxes paint above non-positioned siblings).
        zIndex={1}
      >
        <Typography
          variant="label"
          textTransform="uppercase"
          letterSpacing={2}
          fontSize="$1"
          color={blockLabelInk}
          style={textShadow}
        >
          Ember
        </Typography>
        <Typography
          variant="screen-title"
          textAlign="left"
          fontSize={40}
          lineHeight={48}
          color={blockInk}
          style={textShadow}
        >
          {slide.title}
        </Typography>
        <Typography fontSize="$3" color={blockInk} opacity={0.86} maxWidth={420}>
          {slide.body}
        </Typography>
      </YStack>
    </YStack>
  )
}
