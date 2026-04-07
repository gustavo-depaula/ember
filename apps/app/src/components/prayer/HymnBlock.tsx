// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { Text, XStack, YStack } from 'tamagui'
import { VineBar } from '../Ornament'
import { PrayerText } from '../PrayerText'

export function HymnBlock({
  title,
  english,
  latin,
}: {
  title: string
  english: string
  latin: string
}) {
  const englishLines = english.split('\n')
  const latinLines = latin.split('\n')
  const totalLines = englishLines.length + latinLines.length
  const estimatedHeight = totalLines * 24 + 40

  return (
    <XStack gap="$sm">
      <VineBar height={estimatedHeight} />
      <YStack gap="$md" flex={1}>
        <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
          {title}
        </Text>
        <YStack gap="$xs">
          {englishLines.map((line, i) => (
            <PrayerText key={`en-${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
          ))}
        </YStack>
        <YStack gap="$xs" opacity={0.6}>
          {latinLines.map((line, i) => (
            <Text
              key={`la-${i}-${line.slice(0, 20)}`}
              fontFamily="$body"
              fontSize="$2"
              fontStyle="italic"
              color="$colorSecondary"
            >
              {line}
            </Text>
          ))}
        </YStack>
      </YStack>
    </XStack>
  )
}
