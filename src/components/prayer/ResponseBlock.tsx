// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder
import { Text, XStack, YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'

export function ResponseBlock({ verses }: { verses: { v: string; r: string }[] }) {
  return (
    <YStack gap="$sm">
      {verses.map((verse, i) => (
        <YStack key={`vr-${i}`} gap="$xs">
          <XStack gap="$xs" alignItems="flex-start">
            <Text fontFamily="$body" fontSize="$2" color="$colorBurgundy" width={24}>
              ℣.
            </Text>
            <PrayerText flex={1}>{verse.v}</PrayerText>
          </XStack>
          <XStack gap="$xs" alignItems="flex-start">
            <Text fontFamily="$body" fontSize="$2" color="$accent" fontWeight="600" width={24}>
              ℟.
            </Text>
            <PrayerText flex={1} fontWeight="600">
              {verse.r}
            </PrayerText>
          </XStack>
        </YStack>
      ))}
    </YStack>
  )
}
