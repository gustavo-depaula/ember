import { useRouter } from 'expo-router'
import { Home } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

export function PageHeader({ title }: { title: string }) {
  const router = useRouter()
  const theme = useTheme()

  return (
    <YStack alignItems="center" gap="$xs">
      <Pressable
        onPress={() => router.push('/')}
        hitSlop={12}
        accessibilityRole="link"
        accessibilityLabel="Home"
      >
        <Home size={20} color={theme.colorSecondary.val} />
      </Pressable>
      <Text fontFamily="$display" fontSize="$4" color="$color" textAlign="center">
        {title}
      </Text>
    </YStack>
  )
}
