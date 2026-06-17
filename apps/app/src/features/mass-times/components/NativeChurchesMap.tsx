import { AppleMaps, GoogleMaps } from 'expo-maps'
import { useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { useTheme } from 'tamagui'
import type { MassTimesNearby } from '../useMassTimesNearby'

// The actual native map. Kept in its own module and loaded lazily (see ChurchesMap) so importing the
// Mass Times screen never pulls expo-maps' native view into the list path — only opening the map does.
export default function NativeChurchesMap({ nearby }: { nearby: MassTimesNearby }) {
  const router = useRouter()
  const theme = useTheme()
  const { location, churches } = nearby

  const cameraPosition = {
    coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
    zoom: 12,
  }
  const open = (id?: string) => {
    if (id) router.push({ pathname: '/mass-times/[churchId]', params: { churchId: id } })
  }
  const markers = (churches ?? []).map((c) => ({
    id: c.id,
    coordinates: { latitude: c.lat, longitude: c.lng },
    title: c.name,
  }))

  if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View
        style={{ flex: 1 }}
        cameraPosition={cameraPosition}
        markers={markers}
        onMarkerClick={(m) => open(m.id)}
      />
    )
  }

  return (
    <AppleMaps.View
      style={{ flex: 1 }}
      cameraPosition={cameraPosition}
      markers={markers.map((m) => ({
        ...m,
        systemImage: 'cross.fill',
        tintColor: theme.accent?.val,
      }))}
      onMarkerClick={(m) => open(m.id)}
    />
  )
}
