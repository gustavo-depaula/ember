import { AppleMaps, type CameraMoveEvent, GoogleMaps } from 'expo-maps'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { NearbyChurch } from '@/lib/mass-times'
import { useFavoritesStore } from '../favorites'
import type { MassTimesNearby } from '../useMassTimesNearby'

// Stained-glass jewel tones so the directory pins aren't a monotone wall of gold — each church gets a
// stable color hashed from its name (favorites stay the burgundy heart, see below).
const pinPalette = [
  '#C9A84C', // gold
  '#B23A48', // crimson
  '#2F5C9E', // royal blue
  '#2E8B57', // emerald
  '#6A4C93', // violet
  '#D08C34', // amber
  '#2A9D8F', // teal
  '#C45B7C', // rose
  '#3D4EA8', // indigo
  '#4F7942', // forest
]

function pinColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return pinPalette[Math.abs(hash) % pinPalette.length]
}

export type CameraPosition = {
  coordinates: { latitude: number; longitude: number }
  zoom: number
}

// Where the camera settled after a move: center + zoom + visible span (used to refetch the viewed area
// as a bounding box and to offset the focus camera so a pin clears the sheet).
export type CameraIdle = {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
  zoom: number
}

// What the wrapper drives the map with. expo-maps' `cameraPosition` prop is initial-only, so moves go
// through the native view's imperative methods (exposed here via the forwarded ref). `select`/`deselect`
// keep the native pin selection in lockstep with the sheet (iOS 18+ / current Google Maps).
export type MapHandle = {
  setCameraPosition: (camera: CameraPosition) => void
  select: (id: string) => void
  deselect: () => void
}

// The actual native map. Kept in its own module and loaded lazily (see ChurchesMap) so importing the
// Mass Times screen never pulls expo-maps' native view into the list path — only opening the map does.
const NativeChurchesMap = forwardRef<
  MapHandle,
  {
    nearby: MassTimesNearby
    initialCamera: CameraPosition
    onSelect: (church: NearbyChurch) => void
    onDeselect?: () => void
    onCameraIdle?: (camera: CameraIdle) => void
  }
>(function NativeChurchesMap({ nearby, initialCamera, onSelect, onDeselect, onCameraIdle }, ref) {
  const theme = useTheme()
  const accent = theme.accent?.val
  const favoriteTint = theme.colorBurgundy?.val ?? accent
  const { churches } = nearby
  // Raw record is referentially stable; we derive the per-marker icon from it in the memos below.
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
      // moveCamera:false — the wrapper owns the camera (so it can offset the pin above the sheet).
      select: (id) => {
        appleRef.current?.selectMarker(id, { moveCamera: false })
        void googleRef.current?.selectMarker(id, { moveCamera: false })
      },
      deselect: () => {
        appleRef.current?.selectMarker(undefined)
        void googleRef.current?.selectMarker(undefined)
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
  // A cross for the directory, a heart for saved ones. NOTE: there is no `church` SF Symbol (it renders
  // a blank fallback pin), so we use `cross.fill` — the clearest native glyph for a Catholic church.
  // Non-favorites are tinted by a name-hashed jewel tone for variety; favorites keep the burgundy heart.
  const appleMarkers = useMemo(
    () =>
      markers.map((m) => {
        const isFavorite = Boolean(favorites[m.id])
        return {
          ...m,
          systemImage: isFavorite ? 'heart.fill' : 'cross.fill',
          tintColor: isFavorite ? favoriteTint : pinColor(m.title),
        }
      }),
    [markers, favorites, favoriteTint],
  )

  const select = (id?: string) => {
    const church = id ? byId.get(id) : undefined
    if (church) onSelect(church)
  }

  const handleCameraMove = (e: CameraMoveEvent) => {
    const lat = e.coordinates?.latitude
    const lng = e.coordinates?.longitude
    if (lat == null || lng == null) return
    onCameraIdle?.({
      latitude: lat,
      longitude: lng,
      latitudeDelta: e.latitudeDelta,
      longitudeDelta: e.longitudeDelta,
      zoom: e.zoom,
    })
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
          // Native map controls (the Apple/Google Maps way): the compass re-norths when rotated and the
          // my-location button recenters — the system keeps them clear of the sheet, no custom chrome.
          compassEnabled: true,
          myLocationButtonEnabled: true,
          mapToolbarEnabled: false,
          zoomControlsEnabled: false,
        }}
        onMarkerClick={(m) => select(m.id)}
        onMapClick={onDeselect}
        onCameraMove={handleCameraMove}
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
      // Native map controls (the Apple Maps way): the compass re-norths when rotated and the my-location
      // button recenters. SwiftUI keeps `.mapControls` clear of the sheet, so we drop our custom chrome.
      uiSettings={{
        compassEnabled: true,
        myLocationButtonEnabled: true,
        scaleBarEnabled: false,
        togglePitchEnabled: false,
      }}
      onMarkerClick={(m) => select(m.id)}
      onMapClick={onDeselect}
      onCameraMove={handleCameraMove}
    />
  )
})

export default NativeChurchesMap
