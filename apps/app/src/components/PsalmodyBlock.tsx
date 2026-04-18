// biome-ignore-all lint/suspicious/noArrayIndexKey: static psalm list never reorders
import { Text, YStack } from 'tamagui'
import type { Verse } from '@/lib/content'
import type { PsalmRef } from '@/lib/liturgical'
import { formatPsalmRef } from '@/lib/liturgical'
import { InlineRetry } from './InlineRetry'
import { PrayerText } from './PrayerText'

export type PsalmSlot = { ref: PsalmRef; verses?: Verse[]; retry?: () => void }

export function PsalmodyBlock({ slots }: { slots: PsalmSlot[] }) {
  if (slots.length === 0) return undefined

  return (
    <YStack gap="$lg">
      {slots.map((slot, i) => (
        <YStack key={`${slot.ref.psalm}-${i}`} gap="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue" fontWeight="500">
            {formatPsalmRef(slot.ref)}
          </Text>
          {slot.verses && slot.verses.length > 0 && (
            <>
              <PrayerText>{slot.verses[0].text}</PrayerText>
              {slot.verses.slice(1).map((v) => (
                <PrayerText key={v.verse}>{v.text}</PrayerText>
              ))}
            </>
          )}
          {!slot.verses && slot.retry && <InlineRetry onRetry={slot.retry} />}
        </YStack>
      ))}
    </YStack>
  )
}
