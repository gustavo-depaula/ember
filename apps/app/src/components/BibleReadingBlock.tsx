import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import type { Verse } from '@/lib/content'
import { formatVerseRange } from '@/lib/lectio'

import { PrayerText } from './PrayerText'

export function BibleReadingBlock({
  reference,
  verses,
  fallback,
}: {
  reference: {
    type: 'bible'
    book: string
    bookName: string
    chapter: number
    startVerse?: number
    endVerse?: number
  }
  verses: Verse[] | undefined
  fallback?: boolean
}) {
  const { t } = useTranslation()
  if (!verses) return undefined

  const { startVerse, endVerse } = reference
  const filtered =
    startVerse !== undefined
      ? verses.filter(
          (v) => v.verse >= startVerse && (endVerse === undefined || v.verse <= endVerse),
        )
      : verses

  return (
    <YStack gap="$sm">
      {fallback && (
        <XStack backgroundColor="$backgroundSurface" borderRadius="$md" padding="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('office.fallbackNotice')}
          </Text>
        </XStack>
      )}
      <Text fontFamily="$body" fontSize="$2" color="$colorMutedBlue" fontWeight="500">
        {t(`bookName.${reference.book}`, { defaultValue: reference.bookName })} {reference.chapter}
        {formatVerseRange(startVerse, endVerse)}
      </Text>
      {filtered.map((v) => (
        <PrayerText key={v.verse}>{v.text}</PrayerText>
      ))}
    </YStack>
  )
}
