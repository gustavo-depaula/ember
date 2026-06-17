import type { ServiceKind } from '@ember/api'
import type { NearbyChurch } from '@/lib/mass-times'
import { useNearbyChurches } from '@/lib/mass-times'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

const radiusKm = 15
const fetchLimit = 60

export type MassTimesNearby = {
  location: DeviceLocation
  churches: NearbyChurch[] | undefined
  kind?: ServiceKind // the active service-kind filter, surfaced so views can label the next time
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

// Location + nearby query as one unit, so the list and map views share a single location instance
// and a single cached request rather than each owning its own. `kind` narrows to churches offering
// that service (Mass / confession / adoration).
export function useMassTimesNearby(kind?: ServiceKind): MassTimesNearby {
  const location = useDeviceLocation()
  const { data, isLoading, isFetching, isError, refetch } = useNearbyChurches({
    lat: location.coords.lat,
    lng: location.coords.lng,
    radiusKm,
    limit: fetchLimit,
    kind,
  })
  return { location, churches: data, kind, isLoading, isFetching, isError, refetch }
}
