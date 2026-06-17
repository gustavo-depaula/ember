import { View, XStack } from 'tamagui'

/** A quiet row of dots marking position in the onboarding flow. */
export function OnboardingProgress({ index, total }: { index: number; total: number }) {
  return (
    <XStack gap="$xs" justifyContent="center" alignItems="center" accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => {
        const active = i + 1 === index
        return (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static dots
            key={i}
            width={active ? 18 : 6}
            height={6}
            borderRadius={3}
            backgroundColor={i + 1 <= index ? '$accent' : '$accentSubtle'}
          />
        )
      })}
    </XStack>
  )
}
