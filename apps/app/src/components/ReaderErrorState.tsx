import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'

export function ReaderErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$md" paddingHorizontal="$lg">
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        {t('common.couldntLoad')}
      </Text>
      <AnimatedPressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color="$accent"
          paddingVertical="$xs"
          paddingHorizontal="$md"
        >
          {t('common.retry')}
        </Text>
      </AnimatedPressable>
    </YStack>
  )
}
