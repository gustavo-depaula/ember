import { LocateFixed } from 'lucide-react-native'
import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useTheme, useThemeName, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import type { NearbyChurch } from '@/lib/mass-times'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { MapErrorBoundary } from './MapErrorBoundary'
import type { MapHandle } from './NativeChurchesMap'

// Loaded only when the map view is shown, so the list path never executes expo-maps' native binding.
const NativeChurchesMap = lazy(() => import('./NativeChurchesMap'))

const overviewZoom = 12
const userZoom = 14

// The full-bleed map canvas behind the sheet: it drives the camera through the native ref (recenter +
// auto-center-on-GPS) and bubbles marker taps up via `onSelectChurch`. The browse/detail surface is
// the sheet on top; the recenter button floats above the sheet's peek (`bottomInset`).
export function ChurchesMap({
  nearby,
  onSelectChurch,
  focused,
  bottomInset = 140,
}: {
  nearby: MassTimesNearby
  onSelectChurch?: (church: NearbyChurch) => void
  // When a church is selected (place mode), swing the camera to it — like Apple Maps centering a pin.
  focused?: { lat?: number; lng?: number }
  bottomInset?: number
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const { location } = nearby

  const mapRef = useRef<MapHandle>(null)
  // The native view takes its first camera from this; later moves go through the ref. Captured once so
  // re-renders never reset it.
  const initialCamera = useRef({
    coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
    zoom: overviewZoom,
  }).current

  const centerOnUser = useCallback(
    () =>
      mapRef.current?.setCameraPosition({
        coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
        zoom: userZoom,
      }),
    [location.coords],
  )

  // Auto-center the moment GPS resolves — the native maps pattern of swinging to "you" once located.
  const prevStatus = useRef(location.status)
  useEffect(() => {
    const becameGranted = prevStatus.current !== 'granted' && location.status === 'granted'
    prevStatus.current = location.status
    if (becameGranted) centerOnUser()
  }, [location.status, centerOnUser])

  // Swing to the focused church when place mode opens.
  const fLat = focused?.lat
  const fLng = focused?.lng
  useEffect(() => {
    if (fLat == null || fLng == null) return
    mapRef.current?.setCameraPosition({
      coordinates: { latitude: fLat, longitude: fLng },
      zoom: userZoom,
    })
  }, [fLat, fLng])

  if (Platform.OS === 'web') return <MapUnavailable message={t('massTimes.mapWeb')} />

  const recenter = () => {
    void lightTap()
    if (location.status === 'granted') centerOnUser()
    else void location.request()
  }

  return (
    <YStack flex={1}>
      <MapErrorBoundary fallback={<MapUnavailable message={t('massTimes.mapUnavailable')} />}>
        <Suspense fallback={<YStack flex={1} backgroundColor="$backgroundSurface" />}>
          <NativeChurchesMap
            ref={mapRef}
            nearby={nearby}
            initialCamera={initialCamera}
            onSelect={(church) => onSelectChurch?.(church)}
          />
        </Suspense>
      </MapErrorBoundary>

      {/* My-location button, floated above the sheet's peek edge. */}
      <YStack position="absolute" right="$lg" bottom={bottomInset}>
        <AnimatedPressable
          onPress={recenter}
          accessibilityRole="button"
          accessibilityLabel={t('massTimes.recenter')}
        >
          <GlassSurface
            isDark={isDark}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocateFixed
              size={20}
              color={location.status === 'granted' ? theme.accent?.val : theme.colorSecondary?.val}
            />
          </GlassSurface>
        </AnimatedPressable>
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
