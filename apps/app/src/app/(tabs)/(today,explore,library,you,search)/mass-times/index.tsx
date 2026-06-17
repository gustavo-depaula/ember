import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { PageHeader, ScreenLayout } from '@/components'
import { MassTimesNearby } from '@/features/mass-times'

// Mass Times root: nearby churches with their next Mass, sorted by distance. The list owns its own
// scrolling (ScreenLayout scroll={false}).
export default function MassTimesScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('massTimes.title')} />
        <MassTimesNearby />
      </YStack>
    </ScreenLayout>
  )
}
