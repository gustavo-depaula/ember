import { Image } from 'expo-image'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, type LayoutChangeEvent, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { artFor } from '@/features/explore/artMap'
import { blockInk, blockLabelInk, toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { selectionTick } from '@/lib/haptics'

import { PrimaryButton, SkipButton } from './OnboardingButtons'
import { Dots } from './OnboardingProgress'
import { VigilShell } from './OnboardingScaffold'

export type DeckQuestion<T extends string> = {
  /** artMap key for this question's painting. */
  artId: string
  marker: string
  question: string
  answers: { value: T; label: string }[]
  value: T | undefined
  onAnswer: (value: T) => void
}

/**
 * A few questions asked one painting at a time. Each face is a full-bleed work
 * with the question set over its darkened foot and the answers as large serif
 * lines — no pills, no form chrome. Answering turns the page, so the deck reads
 * as a short conversation rather than a survey.
 */
export function ArtQuestionDeck({
  questions,
  onDone,
  onSkip,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: each question carries its own answer union
  questions: DeckQuestion<any>[]
  onDone: () => void
  onSkip: () => void
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [active, setActive] = useState(0)
  const listRef = useRef<FlatList<DeckQuestion<string>>>(null)
  const lastIndex = useRef(0)
  const autoTurned = useRef(false)
  const isLast = active >= questions.length - 1

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize({ width, height })
  }, [])

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (size.width <= 0) return
      const i = Math.max(
        0,
        Math.min(Math.round(e.nativeEvent.contentOffset.x / size.width), questions.length - 1),
      )
      if (i === lastIndex.current) return
      lastIndex.current = i
      setActive(i)
      // Answering already ticked; only a real swipe earns its own.
      if (autoTurned.current) autoTurned.current = false
      else selectionTick()
    },
    [size.width, questions.length],
  )

  const turnTo = (i: number) => {
    autoTurned.current = true
    listRef.current?.scrollToOffset({ offset: i * size.width, animated: true })
  }

  return (
    <VigilShell>
      <YStack flex={1} backgroundColor="$background" onLayout={onLayout}>
        {size.width > 0 ? (
          <FlatList
            ref={listRef}
            data={questions}
            keyExtractor={(q) => q.artId}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <QuestionFace
                question={item}
                width={size.width}
                height={size.height}
                insetTop={insets.top}
                onAnswer={(value) => {
                  item.onAnswer(value)
                  // A beat so the gold mark lands before the page turns.
                  if (index < questions.length - 1) setTimeout(() => turnTo(index + 1), 260)
                }}
              />
            )}
          />
        ) : null}

        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          paddingBottom={insets.bottom + 16}
          paddingHorizontal="$lg"
          gap="$md"
        >
          <Dots count={questions.length} activeIndex={active} fill={false} />
          <YStack gap="$sm">
            <PrimaryButton
              label={isLast ? t('common.continue') : t('onboarding.profiler.next')}
              onPress={() => (isLast ? onDone() : turnTo(active + 1))}
            />
            <SkipButton onPress={onSkip} />
          </YStack>
        </YStack>
      </YStack>
    </VigilShell>
  )
}

function QuestionFace({
  question,
  width,
  height,
  insetTop,
  onAnswer,
}: {
  question: DeckQuestion<string>
  width: number
  height: number
  insetTop: number
  onAnswer: (value: string) => void
}) {
  const art = artFor(question.artId)
  const tone = toneByIndex(toneIndexForId(question.artId))

  return (
    // Explicit height, not flex — a horizontal FlatList row doesn't inherit the
    // list's height, which silently top-aligns the face.
    <YStack width={width} height={height} backgroundColor={tone.from} justifyContent="flex-end">
      {art ? (
        <Image
          source={art}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={280}
          cachePolicy="memory-disk"
          accessibilityLabel={question.question}
        />
      ) : null}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={`deck-scrim-${question.artId}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.18" stopColor="#0E0D0C" stopOpacity="0" />
            <Stop offset="0.55" stopColor="#0E0D0C" stopOpacity="0.82" />
            <Stop offset="1" stopColor="#0E0D0C" stopOpacity="0.97" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill={`url(#deck-scrim-${question.artId})`} />
      </Svg>

      <YStack
        paddingTop={insetTop}
        paddingHorizontal="$lg"
        // Clear the dots + buttons pinned to the screen's foot.
        paddingBottom={200}
        gap="$md"
        zIndex={1}
      >
        <YStack gap="$xs">
          <Typography
            variant="label"
            textTransform="uppercase"
            letterSpacing={2}
            fontSize="$1"
            color={blockLabelInk}
            style={textShadow}
          >
            {question.marker}
          </Typography>
          <Typography
            variant="screen-title"
            textAlign="left"
            fontSize={34}
            lineHeight={42}
            color={blockInk}
            style={textShadow}
          >
            {question.question}
          </Typography>
        </YStack>

        <YStack>
          {question.answers.map((a) => {
            const chosen = question.value === a.value
            return (
              <AnimatedPressable
                key={a.value}
                onPress={() => {
                  selectionTick()
                  onAnswer(a.value)
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: chosen }}
                accessibilityLabel={a.label}
              >
                <YStack
                  paddingVertical="$sm"
                  borderBottomWidth={StyleSheet.hairlineWidth}
                  borderBottomColor="rgba(245,239,226,0.18)"
                >
                  <Typography
                    variant="section-title"
                    fontSize={22}
                    lineHeight={30}
                    color={chosen ? blockLabelInk : blockInk}
                    opacity={chosen ? 1 : 0.72}
                    style={textShadow}
                  >
                    {chosen ? `✦  ${a.label}` : a.label}
                  </Typography>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </YStack>
      </YStack>
    </YStack>
  )
}
