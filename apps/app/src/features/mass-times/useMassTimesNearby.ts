import type { NearbyChurch } from '@/lib/mass-times'
import { useNearbyChurches } from '@/lib/mass-times'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

const radiusKm = 15
const fetchLimit = 60

export type MassTimesNearby = {
  location: DeviceLocation
  churches: NearbyChurch[] | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

// Location + nearby query as one unit, so the list and map views share a single location instance
// and a single cached request rather than each owning its own.
export function useMassTimesNearby(): MassTimesNearby {
  const location = useDeviceLocation()
  const { data, isLoading, isError, refetch } = useNearbyChurches({
    lat: location.coords.lat,
    lng: location.coords.lng,
    radiusKm,
    limit: fetchLimit,
  })
  return { location, churches: data, isLoading, isError, refetch }
}
