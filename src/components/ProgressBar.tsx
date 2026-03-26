import { Text, useTheme, View, XStack, YStack } from 'tamagui'

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const theme = useTheme()
  const clamped = Math.min(1, Math.max(0, value))
  const percentage = `${clamped * 100}%`

  return (
    <YStack gap="$xs">
      {label && (
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {label}
        </Text>
      )}
      <XStack height={8} backgroundColor="$borderColor" borderRadius="$sm" overflow="hidden">
        <View width={percentage} height={8} borderRadius="$sm" backgroundColor={theme.accent.val} />
      </XStack>
    </YStack>
  )
}
