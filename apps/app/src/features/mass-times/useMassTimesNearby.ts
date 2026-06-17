import type { ServiceKind } from '@ember/api'
import { useMemo } from 'react'
import type { NearbyChurch } from '@/lib/mass-times'
import { hasServiceToday, useNearbyChurches } from '@/lib/mass-times'
import { useFavoritesStore } from './favorites'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

const radiusKm = 15
const fetchLimit = 60

// The nearby filters. `kind` narrows server-side; `today` and `favoritesOnly` refine on-device (the
// list already carries each church's service rules + a saved-id lookup, so no extra round-trip).
export type MassFilter = {
  kind?: ServiceKind
  today: boolean
  favoritesOnly: boolean
}

export const emptyFilter: MassFilter = { kind: undefined, today: false, favoritesOnly: false }

export function countActiveFilters(filter: MassFilter): number {
  return (filter.kind ? 1 : 0) + (filter.today ? 1 : 0) + (filter.favoritesOnly ? 1 : 0)
}

export type MassTimesNearby = {
  location: DeviceLocation
  churches: NearbyChurch[] | undefined
  kind?: ServiceKind // the active service-kind filter, surfaced so views can label the next time
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

// Location + nearby query as one unit, so the list and map views share a single location instance and
// a single cached request. The server narrows by `kind`; `today`/`favoritesOnly` filter the result.
export function useMassTimesNearby(filter: MassFilter): MassTimesNearby {
  const location = useDeviceLocation()
  const favorites = useFavoritesStore((s) => s.favorites)
  const { data, isLoading, isFetching, isError, refetch } = useNearbyChurches({
    lat: location.coords.lat,
    lng: location.coords.lng,
    radiusKm,
    limit: fetchLimit,
    kind: filter.kind,
  })

  const churches = useMemo(() => {
    if (!data) return data
    return data.filter((c) => {
      if (filter.favoritesOnly && !favorites[c.id]) return false
      if (filter.today && !hasServiceToday(c.services, { timezone: c.timezone, kind: filter.kind }))
        return false
      return true
    })
  }, [data, filter.today, filter.favoritesOnly, filter.kind, favorites])

  return { location, churches, kind: filter.kind, isLoading, isFetching, isError, refetch }
}
