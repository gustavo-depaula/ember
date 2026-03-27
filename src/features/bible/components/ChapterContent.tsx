import { Text, YStack } from 'tamagui'

import { OrnamentalRule } from '@/components'
import { useReadingMargin, useReadingStyle } from '@/hooks/useReadingStyle'
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
  const readingStyle = useReadingStyle()
  const readingMargin = useReadingMargin()

  if (verses.length === 0) return undefined

  return (
    <YStack gap="$xs" paddingVertical="$lg" paddingHorizontal={readingMargin}>
      <YStack alignItems="center" gap="$sm" paddingBottom="$md">
        <Text fontFamily="$heading" fontSize={32} color="$colorSecondary">
          {bookName} {chapter}
        </Text>
        <OrnamentalRule />
      </YStack>

      {fallback ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          Showing Douay-Rheims (offline)
        </Text>
      ) : undefined}

      {verses.map((v) => (
        <Text key={v.verse} color="$color" {...readingStyle}>
          <Text
            fontSize={Math.round(readingStyle.fontSize * 0.5)}
            color="$accent"
            fontFamily="$heading"
          >
            {v.verse}
          </Text>
          {'  '}
          {v.text}
        </Text>
      ))}

      <OrnamentalRule />
    </YStack>
  )
}
