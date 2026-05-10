import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PrayerText } from '@/components/PrayerText'

// Letters/Cold outcome UI. Each line is tappable; tapping line K commits
// `tappedLine: K` (1-indexed). The "couldn't get past the cue" button below
// commits `tappedLine: 0`.
export function TappableLineList({
  lines,
  tapLastLineLabel,
  couldntStartLabel,
  onTap,
}: {
  lines: string[]
  tapLastLineLabel: string
  couldntStartLabel: string
  onTap: (tappedLine: number) => void
}) {
  return (
    <YStack gap="$md">
      <Text fontFamily="$body" fontSize="$2" color="$colorSubtle" textAlign="center">
        {tapLastLineLabel}
      </Text>
      <YStack gap="$xs">
        {lines.map((line, index) => (
          <AnimatedPressable
            // biome-ignore lint/suspicious/noArrayIndexKey: portion lines never reorder
            key={index}
            onPress={() => onTap(index + 1)}
            accessibilityRole="button"
            accessibilityLabel={line}
          >
            <YStack
              paddingVertical="$xs"
              paddingHorizontal="$sm"
              borderRadius="$sm"
              borderWidth={1}
              borderColor="$colorSubtle"
            >
              <PrayerText>{line}</PrayerText>
            </YStack>
          </AnimatedPressable>
        ))}
      </YStack>
      <AnimatedPressable
        onPress={() => onTap(0)}
        accessibilityRole="button"
        accessibilityLabel={couldntStartLabel}
      >
        <YStack paddingVertical="$sm" alignItems="center">
          <Text fontFamily="$body" fontSize="$2" color="$colorSubtle">
            {couldntStartLabel}
          </Text>
        </YStack>
      </AnimatedPressable>
    </YStack>
  )
}
