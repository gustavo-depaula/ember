import { useRouter } from 'expo-router'
import { Book } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'

export function OpenBibleCard() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <AnimatedPressable onPress={() => router.push('/bible/reader')}>
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius="$md"
        >
          <Book size={20} color={theme.accent.val} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {t('bible.discovery.openBible')}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}
