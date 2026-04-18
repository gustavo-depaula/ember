import { useTranslation } from 'react-i18next'
import { Text, XStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'

export function InlineRetry({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <XStack
      backgroundColor="$backgroundSurface"
      borderRadius="$md"
      padding="$md"
      gap="$md"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" flex={1}>
        {t('common.couldntLoad')}
      </Text>
      <AnimatedPressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        hitSlop={8}
      >
        <Text fontFamily="$heading" fontSize="$2" color="$accent" paddingHorizontal="$xs">
          {t('common.retry')}
        </Text>
      </AnimatedPressable>
    </XStack>
  )
}
