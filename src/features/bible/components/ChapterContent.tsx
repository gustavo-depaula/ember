import { Text, YStack } from 'tamagui'

import { DropCap, OrnamentalRule } from '@/components'
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
  if (verses.length === 0) return undefined

  const firstVerse = verses[0]
  const restVerses = verses.slice(1)

  return (
    <YStack gap="$md" paddingVertical="$lg">
      <YStack alignItems="center" gap="$sm" paddingBottom="$md">
        <Text fontFamily="$heading" fontSize={24} color="$colorSecondary">
          {bookName} {chapter}
        </Text>
        <OrnamentalRule />
      </YStack>

      {fallback ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorMuted" textAlign="center">
          Showing Douay-Rheims (offline)
        </Text>
      ) : undefined}

      <DropCap text={firstVerse.text} />

      {restVerses.map((v) => (
        <Text key={v.verse} fontFamily="$body" fontSize="$4" lineHeight="$4" color="$color">
          <Text fontSize="$1" color="$colorSecondary" fontFamily="$body">
            {v.verse}{' '}
          </Text>
          {v.text}
        </Text>
      ))}

      <OrnamentalRule />
    </YStack>
  )
}
