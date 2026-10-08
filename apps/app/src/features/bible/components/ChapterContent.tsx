import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, type TextStyle } from 'react-native'
import { Text, useTheme, View, YStack } from 'tamagui'
import { Typography } from '@/components'
import { ReadingParagraph } from '@/components/ReadingParagraph'
import { useReadingMargin, useReadingMaxWidth, useReadingStyle } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'
import type { StyledSegment } from '@/lib/typography/justifyText'

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
}: {
  verse: Verse
  numberSizePx: number
  /** Resolved style for the marker — see `numberRender` in the parent. */
  numberRender: TextStyle
}) {
  const source = useMemo<StyledSegment[]>(
    () => [
      {
        text: `${verse.verse}`,
        style: 'regular',
        fontSizePx: numberSizePx,
        render: numberRender,
        atomic: true,
      },
      { text: `  ${verse.text}`, style: 'regular' },
    ],
    [verse.verse, verse.text, numberSizePx, numberRender],
  )

  return <ReadingParagraph source={source} />
}

/** The verse whose commentary is open, and the passage that commentary covers. */
export type MarkedVerses = { verse: number; from: number; to: number }

export function ChapterContent({
  bookName,
  chapter,
  verses,
  fallback,
  marked,
  onVersePress,
  onVerseLayout,
}: {
  bookName: string
  chapter: number
  verses: Verse[]
  fallback?: boolean
  marked?: MarkedVerses
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
  const tops = useRef(new Map<number, number>())

  if (verses.length === 0) return undefined

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

      {verses.map((v) => {
        const inPassage = marked !== undefined && marked.from <= v.verse && v.verse <= marked.to
        const line = (
          <VerseLine
            verse={v}
            numberSizePx={numberSizePx}
            numberRender={marked?.verse === v.verse ? markedNumberRender : numberRender}
          />
        )
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
    </YStack>
  )
}
