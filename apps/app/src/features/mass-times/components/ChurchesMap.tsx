import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { YStack } from 'tamagui'
import { Typography } from '@/components'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { LocationBar } from './LocationBar'
import { MapErrorBoundary } from './MapErrorBoundary'

// Loaded only when the map view is shown, so the list path never executes expo-maps' native binding.
const NativeChurchesMap = lazy(() => import('./NativeChurchesMap'))

export function ChurchesMap({ nearby }: { nearby: MassTimesNearby }) {
  const { t } = useTranslation()

  if (Platform.OS === 'web') return <MapUnavailable message={t('massTimes.mapWeb')} />

  return (
    <YStack flex={1} gap="$md">
      <LocationBar location={nearby.location} />
      <YStack flex={1} borderRadius="$md" overflow="hidden">
        <MapErrorBoundary fallback={<MapUnavailable message={t('massTimes.mapUnavailable')} />}>
          <Suspense fallback={<YStack flex={1} backgroundColor="$backgroundSurface" />}>
            <NativeChurchesMap nearby={nearby} />
          </Suspense>
        </MapErrorBoundary>
      </YStack>
    </YStack>
  )
}

function MapUnavailable({ message }: { message: string }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg">
      <Typography variant="annotation" textAlign="center">
        {message}
      </Typography>
    </YStack>
  )
}
