import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
} from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

export type CarouselPage = { key: string; node: ReactNode }

const autoAdvanceMs = 6000
const pauseAfterInteractionMs = 8000

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
  const slides: Array<{ key: string; node: ReactNode }> =
    n > 1
      ? [
          { key: `head-${pages[n - 1].key}`, node: pages[n - 1].node },
          ...pages.map((p) => ({ key: p.key, node: p.node })),
          { key: `tail-${pages[0].key}`, node: pages[0].node },
        ]
      : pages.map((p) => ({ key: p.key, node: p.node }))

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
      onLayout={onLayout}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width || undefined}
        decelerationRate="fast"
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
