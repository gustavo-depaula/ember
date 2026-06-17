import { AppleMaps, GoogleMaps } from 'expo-maps'
import { useMemo } from 'react'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { NearbyChurch } from '@/lib/mass-times'
import type { MassTimesNearby } from '../useMassTimesNearby'

// The actual native map. Kept in its own module and loaded lazily (see ChurchesMap) so importing the
// Mass Times screen never pulls expo-maps' native view into the list path — only opening the map does.
// Marker taps bubble up via `onSelect` so the (non-native) bottom card lives in the wrapper.
export default function NativeChurchesMap({
  nearby,
  onSelect,
}: {
  nearby: MassTimesNearby
  onSelect: (church: NearbyChurch) => void
}) {
  const theme = useTheme()
  const accent = theme.accent?.val
  const { location, churches } = nearby

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

  const cameraPosition = {
    coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
    zoom: 12,
  }
  const select = (id?: string) => {
    const church = id ? byId.get(id) : undefined
    if (church) onSelect(church)
  }

  if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View
        style={{ flex: 1 }}
        cameraPosition={cameraPosition}
        markers={markers}
        properties={{ isMyLocationEnabled: true }}
        uiSettings={{ myLocationButtonEnabled: true }}
        onMarkerClick={(m) => select(m.id)}
      />
    )
  }

  return (
    <AppleMaps.View
      style={{ flex: 1 }}
      cameraPosition={cameraPosition}
      markers={appleMarkers}
      properties={{ isMyLocationEnabled: true }}
      uiSettings={{ myLocationButtonEnabled: true }}
      onMarkerClick={(m) => select(m.id)}
    />
  )
}
