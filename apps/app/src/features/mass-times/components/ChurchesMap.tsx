import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { YStack } from 'tamagui'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { MapErrorBoundary } from './MapErrorBoundary'
import type { CameraIdle, MapHandle } from './NativeChurchesMap'

// Loaded only when the map view is shown, so the list path never executes expo-maps' native binding.
const NativeChurchesMap = lazy(() => import('./NativeChurchesMap'))

const overviewZoom = 12
const userZoom = 14

// How long to wait after the camera settles before refetching the viewed area, how far it must pan (as a
// fraction of the visible latitude span), and how much it must zoom (span grow/shrink ratio) to count —
// so tiny nudges don't churn, but both panning AND zooming refetch.
const regionSettleMs = 500
const regionMoveFraction = 0.25
const regionZoomRatio = 1.3

// Fraction of the visible latitude span to shift the focus camera south by, so the pin lands in the
// upper area clear of the half-height sheet (pin ends up ~22% from the top, not dead center under it).
const focusOffsetFraction = 0.28
// Fallback visible span at `userZoom` on a phone, until the first real camera move reports one.
const fallbackLatitudeDelta = 0.07

// The full-bleed map canvas behind the sheet: it drives the camera through the native ref (auto-center
// on GPS, focus-a-pin), keeps the native pin selection in sync with the sheet, and reports the viewed
// region up so the nearby query can follow the map. Recenter + re-north are the map's own native
// controls (see NativeChurchesMap uiSettings), which the system keeps clear of the sheet.
export function ChurchesMap({
  nearby,
  onSelectChurch,
  onDismiss,
  onRegionChange,
  focused,
}: {
  nearby: MassTimesNearby
  onSelectChurch?: (church: NearbyChurch) => void
  // Tapping the empty map deselects — used to dismiss the open detail (and the pin) together.
  onDismiss?: () => void
  // The viewed area settled somewhere meaningfully new — refetch churches around it.
  onRegionChange?: (region: CameraIdle) => void
  // The selected church (place mode): swing the camera to it (offset above the sheet) and select its pin.
  focused?: { id: string; lat?: number; lng?: number }
}) {
  const { t } = useTranslation()
  const { location } = nearby

  const mapRef = useRef<MapHandle>(null)
  // The native view takes its first camera from this; later moves go through the ref. Captured once so
  // re-renders never reset it.
  const initialCamera = useRef({
    coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
    zoom: overviewZoom,
  }).current

  // Latest settled camera (updated synchronously on every move) — read for the focus offset.
  const lastCamera = useRef<CameraIdle>({
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    latitudeDelta: fallbackLatitudeDelta,
    longitudeDelta: fallbackLatitudeDelta,
    zoom: overviewZoom,
  })
  // The last region we reported up + a settle timer, so refetches debounce and only fire on real moves.
  const lastReported = useRef({
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    latitudeDelta: fallbackLatitudeDelta,
  })
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const onCameraIdle = useCallback(
    (camera: CameraIdle) => {
      lastCamera.current = camera
      if (settleTimer.current) clearTimeout(settleTimer.current)
      settleTimer.current = setTimeout(() => {
        const moved = Math.hypot(
          camera.latitude - lastReported.current.latitude,
          camera.longitude - lastReported.current.longitude,
        )
        const pannedEnough = moved >= camera.latitudeDelta * regionMoveFraction
        const spanRatio = camera.latitudeDelta / lastReported.current.latitudeDelta
        const zoomedEnough = spanRatio >= regionZoomRatio || spanRatio <= 1 / regionZoomRatio
        if (!pannedEnough && !zoomedEnough) return
        lastReported.current = {
          latitude: camera.latitude,
          longitude: camera.longitude,
          latitudeDelta: camera.latitudeDelta,
        }
        onRegionChange?.(camera)
      }, regionSettleMs)
    },
    [onRegionChange],
  )
  useEffect(() => () => clearTimeout(settleTimer.current), [])

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

  // Place mode: swing to the focused church (offset above the sheet) and select its pin. Clearing the
  // focus (back to browse) deselects the pin — keeping map and sheet in lockstep both ways.
  const fId = focused?.id
  const fLat = focused?.lat
  const fLng = focused?.lng
  useEffect(() => {
    if (!fId) {
      mapRef.current?.deselect()
      return
    }
    if (fLat == null || fLng == null) return
    // Scale the last-seen visible span to the target zoom (each zoom level halves the span).
    const span = lastCamera.current.latitudeDelta * 2 ** (lastCamera.current.zoom - userZoom)
    const offset = (Number.isFinite(span) ? span : fallbackLatitudeDelta) * focusOffsetFraction
    mapRef.current?.setCameraPosition({
      coordinates: { latitude: fLat - offset, longitude: fLng },
      zoom: userZoom,
    })
    mapRef.current?.select(fId)
  }, [fId, fLat, fLng])

  if (Platform.OS === 'web') return <MapUnavailable message={t('massTimes.mapWeb')} />

  return (
    <YStack flex={1}>
      <MapErrorBoundary fallback={<MapUnavailable message={t('massTimes.mapUnavailable')} />}>
        <Suspense fallback={<YStack flex={1} backgroundColor="$backgroundSurface" />}>
          <NativeChurchesMap
            ref={mapRef}
            nearby={nearby}
            initialCamera={initialCamera}
            onSelect={(church) => onSelectChurch?.(church)}
            onDeselect={onDismiss}
            onCameraIdle={onCameraIdle}
          />
        </Suspense>
      </MapErrorBoundary>
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
