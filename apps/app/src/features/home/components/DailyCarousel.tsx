import { LinearGradient } from 'expo-linear-gradient'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
} from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

export type CardTone = 'gold' | 'burgundy' | 'blue' | 'green'
export type CarouselPage = { key: string; node: ReactNode; tone?: CardTone }

const autoAdvanceMs = 6000
const pauseAfterInteractionMs = 8000

// Each card type gets its own hue (the user wants them distinct). The tint is
// laid over the surface at low alpha so the ink stays readable on top.
function tintFor(theme: ReturnType<typeof useTheme>, tone: CardTone | undefined): string {
  switch (tone) {
    case 'burgundy':
      return theme.colorBurgundy?.val
    case 'blue':
      return theme.colorMutedBlue?.val
    case 'green':
      return theme.colorGreen?.val
    default:
      return theme.goldBright?.val
  }
}

/** Rounded, softly-tinted gradient surface behind a carousel card. */
function CardSurface({
  tone,
  fullBleedPage,
  children,
}: {
  tone?: CardTone
  fullBleedPage?: boolean
  children: ReactNode
}) {
  const theme = useTheme()
  const tint = tintFor(theme, tone)
  return (
    <LinearGradient
      // ~22% tint at the top-left easing into the surface keeps text legible.
      colors={[`${tint}38`, theme.backgroundSurface?.val]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: fullBleedPage ? 24 : 0,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: `${tint}33`,
        overflow: 'hidden',
      }}
    >
      {children}
    </LinearGradient>
  )
}

export function DailyCarousel({ pages }: { pages: CarouselPage[] }) {
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const pausedUntilRef = useRef(0)
  const activeRef = useRef(0)
  activeRef.current = active

  const n = pages.length

  // Wrap with duplicates of last/first so a swipe past either edge appears to
  // wrap. After the gesture settles, we silently jump to the real index. The
  // duplicated slots get distinct keys so React does not collapse them with
  // the real pages.
  const slides = useMemo<CarouselPage[]>(() => {
    if (n <= 1) return pages
    return [
      { key: `head-${pages[n - 1].key}`, node: pages[n - 1].node },
      ...pages,
      { key: `tail-${pages[0].key}`, node: pages[0].node },
    ]
  }, [pages, n])

  useEffect(() => {
    if (n <= 1 || width === 0 || !scrollRef.current) return
    scrollRef.current.scrollTo({ x: width, animated: false })
  }, [width, n])

  useEffect(() => {
    if (n <= 1 || width === 0) return
    const id = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return
      const next = activeRef.current + 1
      scrollRef.current?.scrollTo({ x: (next + 1) * width, animated: true })
    }, autoAdvanceMs)
    return () => clearInterval(id)
  }, [n, width])

  if (n === 0) return null

  if (n === 1) {
    return (
      <YStack
        paddingVertical="$md"
        borderTopWidth={0.5}
        borderBottomWidth={0.5}
        borderColor="$accentSubtle"
      >
        {pages[0].node}
      </YStack>
    )
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w !== width) setWidth(w)
  }

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    if (idx === 0) {
      scrollRef.current?.scrollTo({ x: n * width, animated: false })
      setActive(n - 1)
    } else if (idx === n + 1) {
      scrollRef.current?.scrollTo({ x: width, animated: false })
      setActive(0)
    } else {
      setActive(idx - 1)
    }
  }

  const pauseAutoplay = () => {
    pausedUntilRef.current = Date.now() + pauseAfterInteractionMs
  }

  return (
    <YStack
      paddingVertical="$md"
      borderTopWidth={0.5}
      borderBottomWidth={0.5}
      borderColor="$accentSubtle"
      gap="$sm"
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        // Break out of the screen's horizontal padding ($lg = 24) so a page slides
        // all the way off the edge while cycling; the cards keep their inner padding.
        // RN ScrollView ignores Tamagui style tokens, so this goes through `style`.
        style={{ marginHorizontal: -24 }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width || undefined}
        decelerationRate="fast"
        onLayout={onLayout}
        onScrollBeginDrag={pauseAutoplay}
        onMomentumScrollEnd={onMomentumEnd}
        accessibilityRole="adjustable"
      >
        {slides.map((slide) => (
          <View key={slide.key} width={width || undefined} justifyContent="center">
            {slide.node}
          </View>
        ))}
      </ScrollView>
      <XStack
        alignSelf="center"
        gap="$sm"
        alignItems="center"
        aria-hidden
        importantForAccessibility="no-hide-descendants"
      >
        {pages.map((p, i) => (
          <Text
            key={p.key}
            fontFamily="$heading"
            fontSize="$2"
            color={i === active ? '$accent' : '$accentSubtle'}
          >
            ✠
          </Text>
        ))}
      </XStack>
    </YStack>
  )
}
