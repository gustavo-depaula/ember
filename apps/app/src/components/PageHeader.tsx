import { useRouter } from 'expo-router'
import { Home } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

export function PageHeader({ title }: { title: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <YStack alignItems="center" gap="$md">
      <Pressable
        onPress={() => router.push('/')}
        hitSlop={16}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.home')}
      >
        <Home size={24} color={theme.accent.val} />
      </Pressable>
      <Text fontFamily="$display" fontSize="$4" color="$color" textAlign="center">
        {title}
      </Text>
    </YStack>
  )
}
