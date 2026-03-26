import { Text, View, XStack, YStack } from 'tamagui'

export function DropCap({ text }: { text: string }) {
  if (text.length === 0) return undefined

  const firstLetter = text[0]
  const rest = text.slice(1)

  return (
    <XStack gap="$sm">
      <YStack alignItems="center">
        <Text
          fontFamily="$display"
          fontSize={56}
          lineHeight={56}
          color="$accent"
          width={48}
          textAlign="center"
        >
          {firstLetter}
        </Text>
        {/* Gold underline accent */}
        <View
          width={32}
          height={1.5}
          backgroundColor="$accentSubtle"
          borderRadius="$full"
          marginTop={-4}
        />
      </YStack>
      <Text flex={1} fontFamily="$body" fontSize="$4" lineHeight="$4" color="$color">
        {rest}
      </Text>
    </XStack>
  )
}
