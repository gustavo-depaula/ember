import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { InlineRetry, Typography } from '@/components'

// Shared load-failure fallback for the Mass Times queries (nearby list, detail, …).
export function QueryError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$md" paddingTop="$lg" alignItems="center">
      <Typography variant="annotation">{t('massTimes.error')}</Typography>
      <InlineRetry onRetry={onRetry} />
    </YStack>
  )
}
