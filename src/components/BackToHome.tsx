import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

export function BackToHome() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <Pressable onPress={() => router.replace('/')}>
      <XStack alignItems="center" gap={2} paddingVertical="$xs">
        <ChevronLeft size={14} color={theme.accent.val} />
        <Text fontFamily="$script" fontSize="$2" color="$accent">
          Home
        </Text>
      </XStack>
    </Pressable>
  )
}
