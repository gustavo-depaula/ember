import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
} from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { Text, Theme, View, XStack, YStack } from 'tamagui'

export type CardTone = 'gold' | 'burgundy' | 'blue' | 'green'
export type CarouselPage = { key: string; node: ReactNode; tone?: CardTone; watermark?: string }

const autoAdvanceMs = 6000
const pauseAfterInteractionMs = 8000
const watermarkFontSize = 64

// Deep illuminated-manuscript jewel grounds (rich corner → deeper corner). The
// cards stay vivid in both app themes; their content is wrapped in the dark
// theme below so cream-and-gold lettering reads against the jewel ground.
const cardGrounds: Record<CardTone, [string, string]> = {
  blue: ['#22427A', '#152C52'], // lapis / ultramarine
  burgundy: ['#7A1C2B', '#4C1019'], // crimson
  green: ['#1E5038', '#123626'], // verdigris / forest
  gold: ['#9A7415', '#6B4E0E'], // burnished gold
}

/**
 * Vivid jewel-ground card with a diagonal gradient, drawn with react-native-svg
 * (already bundled for icons) so it needs no extra native module. We measure the
 * card and size the SVG in pixels so the gradient fills edge to edge — a "100%"
 * SVG height was leaving a seam. Content is themed dark for light/gold lettering.
 */
function CardSurface({
  tone,
  fullBleedPage,
  watermark,
  children,
}: {
  tone?: CardTone
  fullBleedPage?: boolean
  watermark?: string
  children: ReactNode
}) {
  const [layout, setLayout] = useState({ w: 0, h: 0 })
  const [from, to] = cardGrounds[tone ?? 'burgundy']
  const gradientId = `card-${tone ?? 'burgundy'}`
  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout
        setLayout((l) => (l.w !== width || l.h !== height ? { w: width, h: height } : l))
      }}
      marginHorizontal={fullBleedPage ? '$lg' : 0}
      borderRadius={12}
      backgroundColor={from}
      overflow="hidden"
    >
      {layout.w > 0 && (
        <Svg width={layout.w} height={layout.h} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect width={layout.w} height={layout.h} fill={`url(#${gradientId})`} />
        </Svg>
      )}
      {/* Fraktur watermark of the card's title — a faint texture that wraps and
          clips against the card edges (no ellipsis), not meant to be read. */}
      {watermark && layout.h > 0 && (
        <View
          position="absolute"
          top={0}
          bottom={0}
          left={12}
          right={0}
          alignContent="center"
          justifyContent="center"
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text
            fontFamily="$display"
            color="#F5EEE1"
            opacity={0.06}
            style={{
              fontSize: watermarkFontSize,
              lineHeight: watermarkFontSize + 5,
              // textTransform: 'uppercase',
            }}
          >
            {watermark}
          </Text>
        </View>
      )}
      <Theme name="illuminated">{children}</Theme>
    </View>
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
      { ...pages[n - 1], key: `head-${pages[n - 1].key}` },
      ...pages,
      { ...pages[0], key: `tail-${pages[0].key}` },
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
      <YStack paddingVertical="$md">
        <CardSurface tone={pages[0].tone} watermark={pages[0].watermark}>
          {pages[0].node}
        </CardSurface>
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
    <YStack paddingVertical="$md" gap="$sm">
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
            <CardSurface tone={slide.tone} watermark={slide.watermark} fullBleedPage>
              {slide.node}
            </CardSurface>
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
