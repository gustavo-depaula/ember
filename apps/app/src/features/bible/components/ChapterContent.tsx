import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TextStyle } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'
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

  return (
    <ReadingParagraph
      source={source}
      fallback={
        <>
          <Typography variant="verse-number" fontSize={numberSizePx}>
            {verse.verse}
          </Typography>
          {'  '}
          {verse.text}
        </>
      }
    />
  )
}

export function ChapterContent({
  bookName,
  chapter,
  verses,
  fallback,
}: {
  bookName: string
  chapter: number
  verses: Verse[]
  fallback?: boolean
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

      {verses.map((v) => (
        <VerseLine
          key={v.verse}
          verse={v}
          numberSizePx={numberSizePx}
          numberRender={numberRender}
        />
      ))}
    </YStack>
  )
}
