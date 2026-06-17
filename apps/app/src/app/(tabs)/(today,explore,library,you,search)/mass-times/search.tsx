import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { ScreenLayout } from '@/components'
import { BackHeader, ChurchSearch } from '@/features/mass-times'

export default function MassTimesSearchScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$md">
        <BackHeader label={t('massTimes.title')} />
        <ChurchSearch />
      </YStack>
    </ScreenLayout>
  )
}
