import { useRouter } from 'expo-router'
import { Home } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

export function PageHeader({ title }: { title: string }) {
  const router = useRouter()
  const theme = useTheme()

  return (
    <YStack alignItems="center" gap="$md">
      <Pressable
        onPress={() => router.push('/')}
        hitSlop={16}
        accessibilityRole="link"
        accessibilityLabel="Home"
      >
        <Home size={24} color={theme.accent.val} />
      </Pressable>
      <Text fontFamily="$display" fontSize="$4" color="$color" textAlign="center">
        {title}
      </Text>
    </YStack>
  )
}
