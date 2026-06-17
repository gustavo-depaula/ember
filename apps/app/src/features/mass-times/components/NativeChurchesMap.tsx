import { AppleMaps, GoogleMaps } from 'expo-maps'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { NearbyChurch } from '@/lib/mass-times'
import { useFavoritesStore } from '../favorites'
import type { MassTimesNearby } from '../useMassTimesNearby'

export type CameraPosition = {
  coordinates: { latitude: number; longitude: number }
  zoom: number
}

// What the wrapper drives the camera with. expo-maps' `cameraPosition` prop is initial-only, so moves
// go through the native view's imperative `setCameraPosition` (exposed here via the forwarded ref).
export type MapHandle = { setCameraPosition: (camera: CameraPosition) => void }

// The actual native map. Kept in its own module and loaded lazily (see ChurchesMap) so importing the
// Mass Times screen never pulls expo-maps' native view into the list path — only opening the map does.
// Marker taps bubble up via `onSelect`; the recenter button moves the camera through the ref handle.
const NativeChurchesMap = forwardRef<
  MapHandle,
  {
    nearby: MassTimesNearby
    initialCamera: CameraPosition
    onSelect: (church: NearbyChurch) => void
    onDeselect: () => void
  }
>(function NativeChurchesMap({ nearby, initialCamera, onSelect, onDeselect }, ref) {
  const theme = useTheme()
  const accent = theme.accent?.val
  const favoriteTint = theme.colorBurgundy?.val ?? accent
  const { churches } = nearby
  // Raw record is referentially stable; we derive the per-marker icon from it in the memo below.
  const favorites = useFavoritesStore((s) => s.favorites)

  const appleRef = useRef<React.ElementRef<typeof AppleMaps.View>>(null)
  const googleRef = useRef<React.ElementRef<typeof GoogleMaps.View>>(null)
  useImperativeHandle(
    ref,
    () => ({
      setCameraPosition: (camera) => {
        appleRef.current?.setCameraPosition(camera)
        googleRef.current?.setCameraPosition(camera)
      },
    }),
    [],
  )

  const byId = useMemo(() => new Map((churches ?? []).map((c) => [c.id, c])), [churches])
  const markers = useMemo(
    () =>
      (churches ?? []).map((c) => ({
        id: c.id,
        coordinates: { latitude: c.lat, longitude: c.lng },
        title: c.name,
      })),
    [churches],
  )
  // A church glyph for the directory, a heart for saved ones — mirroring the cards (the SF Symbol
  // `church` matches our lucide Church icon; `heart.fill` the FavoriteButton).
  const appleMarkers = useMemo(
    () =>
      markers.map((m) => {
        const isFavorite = Boolean(favorites[m.id])
        return {
          ...m,
          systemImage: isFavorite ? 'heart.fill' : 'church',
          tintColor: isFavorite ? favoriteTint : accent,
        }
      }),
    [markers, favorites, accent, favoriteTint],
  )

  const select = (id?: string) => {
    const church = id ? byId.get(id) : undefined
    if (church) onSelect(church)
  }

  if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View
        ref={googleRef}
        style={{ flex: 1 }}
        cameraPosition={initialCamera}
        markers={markers}
        properties={{ isMyLocationEnabled: true }}
        uiSettings={{
          myLocationButtonEnabled: false,
          compassEnabled: false,
          mapToolbarEnabled: false,
          zoomControlsEnabled: false,
        }}
        onMarkerClick={(m) => select(m.id)}
        onMapClick={onDeselect}
      />
    )
  }

  return (
    <AppleMaps.View
      ref={appleRef}
      style={{ flex: 1 }}
      cameraPosition={initialCamera}
      markers={appleMarkers}
      properties={{ isMyLocationEnabled: true }}
      // We supply our own glass search + recenter, so suppress all native MapKit chrome (the stray
      // compass / pitch / scale controls that otherwise float on the right edge).
      uiSettings={{
        compassEnabled: false,
        myLocationButtonEnabled: false,
        scaleBarEnabled: false,
        togglePitchEnabled: false,
      }}
      onMarkerClick={(m) => select(m.id)}
      onMapClick={onDeselect}
    />
  )
})

export default NativeChurchesMap
