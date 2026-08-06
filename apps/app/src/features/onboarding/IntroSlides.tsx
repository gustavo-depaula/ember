import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, type LayoutChangeEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { selectionTick } from '@/lib/haptics'

import { ArtFace } from './ArtFace'
import { PrimaryButton, SkipButton } from './OnboardingButtons'
import { Dots } from './OnboardingProgress'

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

  return (
    <ArtFace artId={artId} label={slide.title} width={width} height={height}>
      <YStack
        paddingTop={insetTop}
        paddingHorizontal="$lg"
        // Clear the dots + buttons pinned to the screen's foot.
        paddingBottom={200}
        gap="$sm"
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
    </ArtFace>
  )
}
