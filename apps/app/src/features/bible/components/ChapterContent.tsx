import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, type TextStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'
import { Typography } from '@/components'
import { ReadingLanguage, ReadingParagraph } from '@/components/ReadingParagraph'
import { useReadingMargin, useReadingMaxWidth, useReadingStyle } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'
import type { StyledSegment } from '@/lib/typography/justifyText'

import type { WordEntry } from '../words'
import { greekSegments, type StudiedWord, type WordLooks } from './greekWords'

// The verse marker: same face as the text, set small and muted. It is a run of
// its own rather than a reason to skip justification — justif prices each run
// at its own size, so the marker costs the line exactly what it draws.
const verseNumberScale = 0.55

/**
 * One verse, justified with its marker rather than around it.
 *
 * The marker is `atomic`: a number is one object, so it is never hyphenated and
 * the gap that sets it off from the text does not flex. Everything else on the
 * line is ordinary elastic prose.
 */
function VerseLine({
  verse,
  numberSizePx,
  numberRender,
  study,
}: {
  verse: Verse
  numberSizePx: number
  /** Resolved style for the marker — see `numberRender` in the parent. */
  numberRender: TextStyle
  study?: WordStudyProps & { words: WordEntry[] }
}) {
  const words = study?.words
  const studied = study?.studied
  // Only this verse's own marks: another verse's word being studied leaves
  // this one's segments (and so its line breaks) untouched.
  const marks =
    studied && (studied.verse === verse.verse || words?.some(([lemma]) => lemma === studied.lemma))
      ? studied
      : undefined
  const looks = study?.looks
  const press = useRef(study?.onWordPress)
  press.current = study?.onWordPress
  const hold = useRef(study?.onWordLongPress)
  hold.current = study?.onWordLongPress
  const source = useMemo<StyledSegment[]>(() => {
    const number: StyledSegment = {
      text: `${verse.verse}`,
      style: 'regular',
      fontSizePx: numberSizePx,
      render: numberRender,
      atomic: true,
    }
    if (!words || !looks) return [number, { text: `  ${verse.text}`, style: 'regular' }]
    return [
      number,
      { text: '  ', style: 'regular' },
      ...greekSegments({
        verse: verse.verse,
        text: verse.text,
        words,
        studied: marks,
        looks,
        onPress: (v, i) => press.current?.(v, i),
        onLongPress: (v) => hold.current?.(v),
      }),
    ]
  }, [verse.verse, verse.text, numberSizePx, numberRender, words, marks, looks])

  return <ReadingParagraph source={source} />
}

/** What makes a Greek page's words studiable. */
export type WordStudyProps = {
  studied: StudiedWord | undefined
  looks: WordLooks
  onWordPress: (verse: number, index: number) => void
  onWordLongPress: (verse: number) => void
}

/** The verse whose commentary is open, and the passage that commentary covers. */
export type MarkedVerses = { verse: number; from: number; to: number }

export function ChapterContent({
  bookName,
  chapter,
  verses,
  language,
  fallback,
  completedBy,
  marked,
  words,
  study,
  beside,
  onVersePress,
  onVerseLayout,
}: {
  bookName: string
  chapter: number
  verses: Verse[]
  /** The edition's language, to hyphenate the verses by and set them in a face that has it. */
  language: string
  fallback?: boolean
  /** The edition the chapter is read from, where it completes the one chosen. */
  completedBy?: string
  marked?: MarkedVerses
  /** Each verse's words, for a Greek edition: with `study`, every word is a tap target. */
  words?: Record<number, WordEntry[]>
  study?: Omit<WordStudyProps, 'looks'>
  /** Another edition read beside the page, verse by verse: under each verse, or in a column. */
  beside?: {
    texts: Record<number, string>
    language: string
    columns: boolean
    /** The page's share of the width, in columns. */
    split: number
    onSplit: (split: number) => void
  }
  /** `y` is the verse's top within this component, for scrolling it into view. */
  onVersePress?: (verse: number, y: number) => void
  /** Each verse's top as it is laid out, for a reader that turns to a verse untapped. */
  onVerseLayout?: (verse: number, y: number) => void
}) {
  const { t } = useTranslation()
  const readingStyle = useReadingStyle()
  const readingMargin = useReadingMargin()
  const maxWidth = useReadingMaxWidth()
  const theme = useTheme()
  const numberSizePx = Math.round(readingStyle.fontSize * verseNumberScale)
  // A run's `render` is applied as a raw RN style, where Tamagui tokens do NOT
  // resolve — so the token is read off the theme here. Memoised because
  // `justifyText` groups runs by the identity of this object, and a fresh one
  // per verse would mint a run per verse.
  const numberRender = useMemo(
    () => ({ color: theme.colorSecondary?.val as string }),
    [theme.colorSecondary],
  )
  const markedNumberRender = useMemo(
    () => ({ color: theme.colorBurgundy?.val as string }),
    [theme.colorBurgundy],
  )
  const looks = useMemo<WordLooks>(
    () => ({
      studied: {
        color: theme.colorBurgundy?.val as string,
        backgroundColor: theme.backgroundSurface?.val as string,
      },
      // The page's other forms of the studied word. iOS draws a dotted gold
      // underline; Android draws only a solid one in the text's own colour,
      // which reads as part of the text, so there the words are tinted.
      kin:
        Platform.OS === 'ios'
          ? {
              textDecorationLine: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: theme.gold?.val as string,
            }
          : { color: theme.accent?.val as string },
    }),
    [theme.colorBurgundy, theme.backgroundSurface, theme.gold, theme.accent],
  )
  const besideRender = useMemo(
    () => ({ color: theme.colorSecondary?.val as string }),
    [theme.colorSecondary],
  )
  const tops = useRef(new Map<number, number>())
  const [columnsWidth, setColumnsWidth] = useState(0)

  if (verses.length === 0) return undefined

  const besideText = (verse: number) => {
    const text = beside?.texts[verse]
    if (!beside || !text) return undefined
    return (
      <ReadingLanguage language={beside.language}>
        <ReadingParagraph source={[{ text, style: 'regular', render: besideRender }]} />
      </ReadingLanguage>
    )
  }

  return (
    <YStack
      gap="$xs"
      paddingVertical="$lg"
      paddingHorizontal={readingMargin}
      width="100%"
      maxWidth={maxWidth}
      alignSelf="center"
    >
      <YStack alignItems="center" gap="$md" paddingBottom="$md">
        <Typography variant="label" tone="muted" fontSize="$5" textAlign="center">
          {bookName}
        </Typography>
        <Typography variant="label" tone="muted" fontSize="$4">
          {t('position.chapter', { n: chapter })}
        </Typography>
      </YStack>

      {fallback ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          {t('bible.showingFallback')}
        </Text>
      ) : undefined}
      {completedBy ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          {t('bible.showingEdition', { name: completedBy })}
        </Text>
      ) : undefined}

      <View
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout
          setColumnsWidth(width)
        }}
      >
        <ReadingLanguage language={language}>
          {verses.map((v) => {
            const inPassage = marked !== undefined && marked.from <= v.verse && v.verse <= marked.to
            const verseLine = (
              <VerseLine
                verse={v}
                numberSizePx={numberSizePx}
                numberRender={marked?.verse === v.verse ? markedNumberRender : numberRender}
                study={
                  study && words?.[v.verse] ? { ...study, looks, words: words[v.verse] } : undefined
                }
              />
            )
            const other = besideText(v.verse)
            const line = (() => {
              if (!other || !beside) return verseLine
              if (beside.columns) {
                return (
                  <XStack gap={columnGap}>
                    <View flex={beside.split}>{verseLine}</View>
                    <View flex={1 - beside.split}>{other}</View>
                  </XStack>
                )
              }
              return (
                <YStack gap={2} paddingBottom="$xs">
                  {verseLine}
                  {other}
                </YStack>
              )
            })()
            if (!onVersePress) return <View key={v.verse}>{line}</View>
            return (
              <Pressable
                key={v.verse}
                onLayout={(e) => {
                  const { y } = e.nativeEvent.layout
                  tops.current.set(v.verse, y)
                  onVerseLayout?.(v.verse, y)
                }}
                onPress={() => onVersePress(v.verse, tops.current.get(v.verse) ?? 0)}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.verseCommentary', { n: v.verse })}
                accessibilityState={{ selected: marked?.verse === v.verse }}
                aria-selected={marked?.verse === v.verse}
              >
                {/* The wash runs past the text on every side, across the gap
              between verses, so a marked passage reads as one block. */}
                <View
                  backgroundColor={inPassage ? '$backgroundSurface' : 'transparent'}
                  marginHorizontal={-6}
                  paddingHorizontal={6}
                  marginVertical={-2}
                  paddingVertical={2}
                >
                  {line}
                </View>
              </Pressable>
            )
          })}
        </ReadingLanguage>
        {beside?.columns && columnsWidth > 0 ? (
          <ColumnRule width={columnsWidth} split={beside.split} onSplit={beside.onSplit} />
        ) : undefined}
      </View>
    </YStack>
  )
}

const columnGap = 16
// Neither column narrower than a third: below that a justified line has
// room for two or three words.
const minSplit = 0.32
const maxSplit = 0.68

/**
 * The rule between the two columns of a parallel page, the full height of the
 * chapter. Dragged, only the rule moves; the columns are laid out again where
 * it is let go, since every verse's line breaks change with the width.
 */
function ColumnRule({
  width,
  split,
  onSplit,
}: {
  width: number
  split: number
  onSplit: (split: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const offset = useSharedValue(0)
  const left = split * (width - columnGap) + columnGap / 2
  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Sooner than the reader's drawer swipe, so a drag on the rule is the rule's.
        .activeOffsetX([-2, 2])
        .onUpdate((e) => {
          offset.value = e.translationX
        })
        .onEnd((e) => {
          const next = Math.min(maxSplit, Math.max(minSplit, split + e.translationX / width))
          offset.value = 0
          runOnJS(onSplit)(next)
        }),
    [offset, split, width, onSplit],
  )
  const moving = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }))
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        accessibilityRole="adjustable"
        accessibilityLabel={t('a11y.columnSplit')}
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: left - 12,
            width: 24,
            alignItems: 'center',
          },
          moving,
        ]}
      >
        <View
          width={StyleSheet.hairlineWidth}
          flex={1}
          backgroundColor={theme.borderColor?.val as string}
        />
      </Animated.View>
    </GestureDetector>
  )
}
