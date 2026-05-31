import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { PageHeader } from '@/components'
import { ScreenLayout } from '@/components/ScreenLayout'
import { SaintCardGrid } from '@/features/saints/components'

export default function SaintsScreen() {
  const { t } = useTranslation()

  return (
    <ScreenLayout scroll={false}>
      <YStack gap="$lg" flex={1} paddingVertical="$lg">
        <PageHeader title={t('saints.title')} variant="sacred" />

        <SaintCardGrid />
      </YStack>
    </ScreenLayout>
  )
}
