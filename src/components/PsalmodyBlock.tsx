// biome-ignore-all lint/suspicious/noArrayIndexKey: static psalm list never reorders
import { Text, YStack } from 'tamagui'
import type { Verse } from '@/lib/content'
import type { PsalmRef } from '@/lib/liturgical'
import { formatPsalmRef } from '@/lib/liturgical'
import { PrayerText } from './PrayerText'

export type PsalmData = { ref: PsalmRef; verses: Verse[] }

export function PsalmodyBlock({ psalmData }: { psalmData: PsalmData[] }) {
  if (psalmData.length === 0) return undefined

  return (
    <YStack gap="$lg">
      {psalmData.map((psalm, i) => (
        <YStack key={`${psalm.ref.psalm}-${i}`} gap="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue" fontWeight="500">
            {formatPsalmRef(psalm.ref)}
          </Text>
          {psalm.verses.length > 0 && (
            <>
              <PrayerText>{psalm.verses[0].text}</PrayerText>
              {psalm.verses.slice(1).map((v) => (
                <PrayerText key={v.verse}>{v.text}</PrayerText>
              ))}
            </>
          )}
        </YStack>
      ))}
    </YStack>
  )
}
