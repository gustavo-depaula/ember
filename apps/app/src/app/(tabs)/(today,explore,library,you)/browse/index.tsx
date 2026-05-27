import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { DiscoverySections } from '@/features/collections/DiscoverySections'

export default function PrayDiscoveryScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('catalog.title')} />
        <DiscoverySections />
      </YStack>
    </ScreenLayout>
  )
}
