import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'

/** `detail` is the underlying error, small under the message, so a reader can report it. */
export function ReaderErrorState({ onRetry, detail }: { onRetry: () => void; detail?: string }) {
  const { t } = useTranslation()
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$md" paddingHorizontal="$lg">
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        {t('common.couldntLoad')}
      </Text>
      {detail ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          {detail}
        </Text>
      ) : null}
      <AnimatedPressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        hitSlop={8}
      >
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
