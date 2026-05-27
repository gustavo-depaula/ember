import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { Typography } from '@/components'
import { useReadingMargin, useReadingMaxWidth, useReadingStyle } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'

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
        <Text key={v.verse} color="$color" {...readingStyle}>
          <Typography variant="verse-number" fontSize={Math.round(readingStyle.fontSize * 0.55)}>
            {v.verse}
          </Typography>
          {'  '}
          {v.text}
        </Text>
      ))}
    </YStack>
  )
}
