import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, type LayoutChangeEvent } from 'react-native'
import { View, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'

type Slide = { title: string; body: string }

// Decorative manuscript glyphs, one per slide (rationed gold ceremonial rung).
const glyphs = ['✦', '❦', '✠', '✣', '❧']

/**
 * The features-overview carousel — a few reverent, swipeable slides. Used both as
 * the first onboarding step and, in `revisit` mode, from Settings (Done returns,
 * no skip, no flow advance).
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
  const slides = t('onboarding.intro.slides', { returnObjects: true }) as Slide[]
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState(0)
  const listRef = useRef<FlatList<Slide>>(null)
  const isLast = active >= slides.length - 1

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }, [])

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (width <= 0) return
      const i = Math.round(e.nativeEvent.contentOffset.x / width)
      setActive(Math.max(0, Math.min(i, slides.length - 1)))
    },
    [width, slides.length],
  )

  const primary = () => {
    if (isLast) return onDone()
    listRef.current?.scrollToOffset({ offset: (active + 1) * width, animated: true })
  }

  const primaryLabel = isLast
    ? revisit
      ? t('common.done')
      : t('onboarding.intro.getStarted')
    : t('common.continue')

  return (
    <ScreenLayout scroll={false} modal>
      <YStack flex={1} paddingVertical="$lg" gap="$lg">
        <YStack flex={1} onLayout={onLayout}>
          {width > 0 ? (
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
                <YStack
                  width={width}
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  gap="$lg"
                  paddingHorizontal="$md"
                >
                  <Typography variant="ceremonial" fontSize={56} lineHeight={64}>
                    {glyphs[index % glyphs.length]}
                  </Typography>
                  <Typography variant="sacred-title" fontSize={30} textAlign="center">
                    {item.title}
                  </Typography>
                  <Typography variant="whisper" textAlign="center" fontSize="$3" maxWidth={360}>
                    {item.body}
                  </Typography>
                </YStack>
              )}
            />
          ) : null}
        </YStack>

        <XStack gap="$xs" justifyContent="center" alignItems="center">
          {slides.map((_, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static dots
              key={i}
              width={i === active ? 18 : 6}
              height={6}
              borderRadius={3}
              backgroundColor={i === active ? '$accent' : '$accentSubtle'}
            />
          ))}
        </XStack>

        <YStack gap="$sm">
          <AnimatedPressable
            onPress={primary}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
          >
            <YStack backgroundColor="$accent" borderRadius="$md" padding="$md" alignItems="center">
              <Typography variant="label" fontSize="$3" color="$background">
                {primaryLabel}
              </Typography>
            </YStack>
          </AnimatedPressable>

          {!revisit && onSkip ? (
            <AnimatedPressable
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={t('common.skip')}
            >
              <YStack padding="$sm" alignItems="center">
                <Typography variant="whisper">{t('common.skip')}</Typography>
              </YStack>
            </AnimatedPressable>
          ) : null}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
