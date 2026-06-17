import { LocateFixed } from 'lucide-react-native'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import type { NearbyChurch } from '@/lib/mass-times'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchListItem } from './ChurchListItem'
import { MapErrorBoundary } from './MapErrorBoundary'
import type { MapHandle } from './NativeChurchesMap'

// Loaded only when the map view is shown, so the list path never executes expo-maps' native binding.
const NativeChurchesMap = lazy(() => import('./NativeChurchesMap'))

const overviewZoom = 12
const userZoom = 14

// The full-bleed map: it drives the camera through the native ref (so the recenter button and the
// auto-center-on-GPS both work) and surfaces the bottom card on marker tap. Floating screen controls
// (title, filter, view toggle) live in the screen above it — the map stretches edge to edge behind.
export function ChurchesMap({ nearby }: { nearby: MassTimesNearby }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<NearbyChurch | undefined>(undefined)
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

  if (Platform.OS === 'web') return <MapUnavailable message={t('massTimes.mapWeb')} />

  const recenter = () => {
    void lightTap()
    // Already located → move now; otherwise ask, and the becameGranted effect swings over on success.
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
            onSelect={setSelected}
            onDeselect={() => setSelected(undefined)}
          />
        </Suspense>
      </MapErrorBoundary>

      {/* My-location button, lifted above the bottom card when one is showing, otherwise the tab bar. */}
      <YStack
        position="absolute"
        right="$lg"
        bottom={selected ? insets.bottom + 132 : insets.bottom + 76}
      >
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

      {/* Apple/Google-Maps-style bottom card on marker tap (iOS 18+ fires onMarkerClick; older iOS
          still shows the native title callout). Tapping the card opens the church; tapping the map
          elsewhere dismisses it (onMapClick → onDeselect) — slides both in and out, no close button. */}
      {selected ? (
        <Animated.View
          entering={SlideInDown.duration(220)}
          exiting={SlideOutDown.duration(180)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: insets.bottom + 8,
            paddingHorizontal: 12,
          }}
        >
          <GlassSurface isDark={isDark} style={{ borderRadius: 18, overflow: 'hidden' }}>
            <ChurchListItem
              church={selected}
              locale={i18n.language}
              kind={nearby.kind}
              transparent
            />
          </GlassSurface>
        </Animated.View>
      ) : null}
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
