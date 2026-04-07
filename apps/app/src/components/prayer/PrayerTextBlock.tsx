// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'

export function PrayerTextBlock({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <YStack gap="$xs">
      {lines.map((line, i) => (
        <PrayerText key={`${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
      ))}
    </YStack>
  )
}
