import { AppleMaps, type CameraMoveEvent, GoogleMaps } from 'expo-maps'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { Cluster } from '@/lib/mass-times'
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

// What a church pin hands back on tap — enough to open its detail and focus the camera.
export type PinnedChurch = { id: string; name: string; lat: number; lng: number }

const clusterPrefix = 'cluster:'

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
    onSelect: (church: PinnedChurch) => void
    onCluster: (cluster: Cluster) => void
    onDeselect?: () => void
    onCameraIdle?: (camera: CameraIdle) => void
  }
>(function NativeChurchesMap(
  { nearby, initialCamera, onSelect, onCluster, onDeselect, onCameraIdle },
  ref,
) {
  const theme = useTheme()
  const accent = theme.accent?.val
  const favoriteTint = theme.colorBurgundy?.val ?? accent
  const { churches, clusters } = nearby
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

  // Zoomed out, the clusters cover every church in view (a one-church cluster stands in for its
  // church); otherwise every church in view is its own pin.
  const pins = useMemo<PinnedChurch[]>(() => {
    if (clusters.length === 0)
      return (churches ?? []).map(({ id, name, lat, lng }) => ({ id, name, lat, lng }))
    return clusters.flatMap((c) => (c.church ? [{ ...c.church, lat: c.lat, lng: c.lng }] : []))
  }, [churches, clusters])
  const groups = useMemo(() => clusters.filter((c) => !c.church), [clusters])
  const pinsById = useMemo(() => new Map(pins.map((p) => [p.id, p])), [pins])
  const groupsById = useMemo(() => new Map(groups.map((g) => [clusterPrefix + g.id, g])), [groups])

  const markers = useMemo(
    () => [
      ...pins.map((p) => ({
        id: p.id,
        coordinates: { latitude: p.lat, longitude: p.lng },
        title: p.name,
      })),
      ...groups.map((g) => ({
        id: clusterPrefix + g.id,
        coordinates: { latitude: g.lat, longitude: g.lng },
      })),
    ],
    [pins, groups],
  )
  // A cross for the directory, a heart for saved ones, a count balloon for a cluster. NOTE: there is
  // no `church` SF Symbol (it renders a blank fallback pin), so we use `cross.fill` — the clearest
  // native glyph for a Catholic church. Non-favorites are tinted by a name-hashed jewel tone.
  const appleMarkers = useMemo(
    () => [
      ...pins.map((p) => {
        const isFavorite = Boolean(favorites[p.id])
        return {
          id: p.id,
          coordinates: { latitude: p.lat, longitude: p.lng },
          title: p.name,
          systemImage: isFavorite ? 'heart.fill' : 'cross.fill',
          tintColor: isFavorite ? favoriteTint : pinColor(p.name),
        }
      }),
      ...groups.map((g) => ({
        id: clusterPrefix + g.id,
        coordinates: { latitude: g.lat, longitude: g.lng },
        monogram: g.count > 99 ? '99+' : String(g.count),
        tintColor: accent,
      })),
    ],
    [pins, groups, favorites, favoriteTint, accent],
  )

  const select = (id?: string) => {
    if (!id) return
    const group = groupsById.get(id)
    if (group) return onCluster(group)
    const pin = pinsById.get(id)
    if (pin) onSelect(pin)
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
      // button recenters. SwiftUI keeps `.mapControls` clear of the sheet.
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
