import { Text, YStack } from 'tamagui'

export function ProperSlot({ description }: { description: string }) {
  return (
    <YStack
      backgroundColor="$backgroundSurface"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      borderStyle="dashed"
      padding="$md"
      alignItems="center"
    >
      <Text fontFamily="$body" fontSize="$2" fontStyle="italic" color="$colorSecondary">
        {description}
      </Text>
    </YStack>
  )
}
