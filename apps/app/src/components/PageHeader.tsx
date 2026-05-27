import { Text, YStack } from 'tamagui'

export function PageHeader({ title }: { title: string }) {
  return (
    <YStack alignItems="center">
      <Text fontFamily="$display" fontSize="$4" color="$color" textAlign="center">
        {title}
      </Text>
    </YStack>
  )
}
