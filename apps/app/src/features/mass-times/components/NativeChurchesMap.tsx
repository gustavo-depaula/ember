import { AppleMaps, GoogleMaps } from 'expo-maps'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { NearbyChurch } from '@/lib/mass-times'
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
  }
>(function NativeChurchesMap({ nearby, initialCamera, onSelect }, ref) {
  const theme = useTheme()
  const accent = theme.accent?.val
  const { churches } = nearby

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
  const appleMarkers = useMemo(
    () => markers.map((m) => ({ ...m, systemImage: 'cross.fill', tintColor: accent })),
    [markers, accent],
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
        uiSettings={{ myLocationButtonEnabled: false }}
        onMarkerClick={(m) => select(m.id)}
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
      onMarkerClick={(m) => select(m.id)}
    />
  )
})

export default NativeChurchesMap
