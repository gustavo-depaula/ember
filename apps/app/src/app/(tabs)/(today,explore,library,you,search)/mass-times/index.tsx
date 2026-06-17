import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { PageHeader, ScreenLayout } from '@/components'
import {
  ChurchesMap,
  MassTimesList,
  useMassTimesNearby,
  type ViewMode,
  ViewToggle,
} from '@/features/mass-times'

// Mass Times root: nearby churches with their next Mass, as a distance-sorted list or a map. Both
// share one location + query (useMassTimesNearby); the header toggle swaps them in place.
export default function MassTimesScreen() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<ViewMode>('list')
  const nearby = useMassTimesNearby()

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <PageHeader
          title={t('massTimes.title')}
          action={<ViewToggle value={mode} onChange={setMode} />}
        />
        {mode === 'list' ? <MassTimesList nearby={nearby} /> : <ChurchesMap nearby={nearby} />}
      </YStack>
    </ScreenLayout>
  )
}
