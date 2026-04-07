import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

export function SaintOfDay() {
  const { t } = useTranslation()

  return (
    <XStack gap="$md" alignItems="center" paddingVertical="$sm" paddingHorizontal="$md">
      <Text fontSize={28}>🕊️</Text>
      <YStack flex={1} gap={2}>
        <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
          {t('home.saintOfDay')}
        </Text>
        <Text fontFamily="$body" fontSize="$3" color="$color">
          {t('home.saintStub.name')}
        </Text>
        <Text fontFamily="$script" fontSize="$2" color="$colorSecondary">
          {t('home.saintStub.patronOf')}
        </Text>
      </YStack>
    </XStack>
  )
}
