// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { Text, YStack } from 'tamagui'

import { PrayerText } from '../PrayerText'

export function LiturgicalPrayerBlock({
  speaker,
  text,
  latin,
}: {
  speaker: 'priest' | 'people' | 'all'
  text: string
  latin: string
}) {
  const lines = text.split('\n')
  const latinLines = latin.split('\n')
  const isPeople = speaker === 'people'

  return (
    <YStack gap="$xs" paddingLeft={isPeople ? '$md' : 0}>
      {isPeople && (
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          R.
        </Text>
      )}
      {lines.map((line, i) => (
        <PrayerText key={`en-${i}`} fontWeight={isPeople ? '600' : undefined}>
          {line}
        </PrayerText>
      ))}
      {latin !== '' && (
        <YStack gap="$xs" opacity={0.6} paddingTop="$xs">
          {latinLines.map((line, i) => (
            <Text
              key={`la-${i}`}
              fontFamily="$body"
              fontSize="$2"
              fontStyle="italic"
              color="$colorSecondary"
            >
              {line}
            </Text>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
