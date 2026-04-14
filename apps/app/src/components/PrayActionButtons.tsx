import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'

export function PrayButton({ practiceId }: { practiceId: string }) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/pray/[practiceId]', params: { practiceId } })}
      accessibilityRole="button"
      accessibilityLabel={t('practice.pray')}
    >
      <YStack
        backgroundColor="$accent"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$accentSubtle"
        paddingVertical="$sm"
        alignItems="center"
      >
        <Text fontFamily="$heading" fontSize="$3" color="$background">
          {t('practice.pray')}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
