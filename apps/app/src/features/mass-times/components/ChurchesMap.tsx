import { X } from 'lucide-react-native'
import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated'
import { useTheme, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchListItem } from './ChurchListItem'
import { LocationBar } from './LocationBar'
import { MapErrorBoundary } from './MapErrorBoundary'

// Loaded only when the map view is shown, so the list path never executes expo-maps' native binding.
const NativeChurchesMap = lazy(() => import('./NativeChurchesMap'))

export function ChurchesMap({ nearby }: { nearby: MassTimesNearby }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [selected, setSelected] = useState<NearbyChurch | undefined>(undefined)

  if (Platform.OS === 'web') return <MapUnavailable message={t('massTimes.mapWeb')} />

  return (
    <YStack flex={1} gap="$md">
      <LocationBar location={nearby.location} />
      <YStack flex={1} borderRadius="$md" overflow="hidden">
        <MapErrorBoundary fallback={<MapUnavailable message={t('massTimes.mapUnavailable')} />}>
          <Suspense fallback={<YStack flex={1} backgroundColor="$backgroundSurface" />}>
            <NativeChurchesMap nearby={nearby} onSelect={setSelected} />
          </Suspense>
        </MapErrorBoundary>

        {/* Apple/Google-Maps-style bottom card on marker tap (iOS 18+ fires onMarkerClick; older
            iOS still shows the native title callout, and the list view always covers it). */}
        {selected ? (
          <Animated.View
            entering={SlideInDown.duration(220)}
            exiting={FadeOut.duration(150)}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12 }}
          >
            <YStack>
              <AnimatedPressable
                onPress={() => setSelected(undefined)}
                hitSlop={10}
                accessibilityRole="button"
                style={{ alignSelf: 'flex-end', padding: 4 }}
              >
                <X size={20} color={theme.colorSecondary?.val} />
              </AnimatedPressable>
              <ChurchListItem church={selected} locale={i18n.language} kind={nearby.kind} />
            </YStack>
          </Animated.View>
        ) : null}
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
