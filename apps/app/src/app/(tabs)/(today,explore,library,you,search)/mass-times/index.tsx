import { useRouter } from 'expo-router'
import { Search } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { PageHeader, ScreenLayout } from '@/components'
import {
  ChurchesMap,
  MassTimesList,
  useMassTimesNearby,
  type ViewMode,
  ViewToggle,
} from '@/features/mass-times'

// Mass Times root: nearby churches with their next Mass, as a distance-sorted list or a map. Both
// share one location + query (useMassTimesNearby); the header toggle swaps them in place, and the
// search icon opens full-text lookup by name.
export default function MassTimesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const [mode, setMode] = useState<ViewMode>('list')
  const nearby = useMassTimesNearby()

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <PageHeader
          title={t('massTimes.title')}
          action={
            <XStack alignItems="center" gap="$md">
              <Pressable
                onPress={() => router.push('/mass-times/search')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.searchPlaceholder')}
              >
                <Search size={20} color={theme.colorSecondary?.val} />
              </Pressable>
              <ViewToggle value={mode} onChange={setMode} />
            </XStack>
          }
        />
        {mode === 'list' ? <MassTimesList nearby={nearby} /> : <ChurchesMap nearby={nearby} />}
      </YStack>
    </ScreenLayout>
  )
}
