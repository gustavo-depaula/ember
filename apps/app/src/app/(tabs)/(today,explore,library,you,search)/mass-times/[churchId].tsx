import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { ScreenLayout } from '@/components'
import { BackHeader, ChurchDetail } from '@/features/mass-times'

export default function ChurchDetailScreen() {
  const { churchId } = useLocalSearchParams<{ churchId: string }>()
  const { t } = useTranslation()

  return (
    <ScreenLayout>
      <YStack paddingVertical="$md" gap="$lg">
        <BackHeader label={t('massTimes.title')} />
        <ChurchDetail churchId={churchId} />
      </YStack>
    </ScreenLayout>
  )
}
