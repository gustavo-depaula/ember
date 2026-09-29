import type { Service, ServiceKind } from '@ember/api'
import { useMemo } from 'react'
import type { Bbox, Cluster, NearbyChurch } from '@/lib/mass-times'
import { hasServiceToday, useViewport } from '@/lib/mass-times'
import { useFavoritesStore } from './favorites'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

// Churches listed per viewport (the backend's cap); past this many in view it clusters the map.
const fetchLimit = 100
// Initial viewport span (degrees) before the map reports its real region — ~28 km around the user.
const defaultSpanDeg = 0.25
const earthRadiusKm = 6371

// The viewed map region. Structurally satisfied by the map's `CameraIdle` payload.
export type MapRegion = {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}

function bboxFromRegion(r: MapRegion): Bbox {
  const halfLat = r.latitudeDelta / 2
  const halfLng = r.longitudeDelta / 2
  return {
    minLat: Math.max(-90, r.latitude - halfLat),
    maxLat: Math.min(90, r.latitude + halfLat),
    minLng: Math.max(-180, r.longitude - halfLng),
    maxLng: Math.min(180, r.longitude + halfLng),
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.asin(Math.min(1, Math.sqrt(a)))
}

// The nearby filters. `kind` narrows server-side; `today` and `favoritesOnly` refine on-device (the
// list already carries each church's service rules + a saved-id lookup, so no extra round-trip).
export type MassFilter = {
  kind?: ServiceKind
  today: boolean
  favoritesOnly: boolean
}

export const emptyFilter: MassFilter = { kind: undefined, today: false, favoritesOnly: false }

// The on-device half of the filter, shared by the nearby list and search results.
export function passesFilter(
  church: { id: string; timezone: string; services?: Service[] | null },
  filter: MassFilter,
  favorites: Record<string, unknown>,
): boolean {
  if (filter.favoritesOnly && !favorites[church.id]) return false
  if (
    filter.today &&
    !hasServiceToday(church.services ?? [], { timezone: church.timezone, kind: filter.kind })
  )
    return false
  return true
}

export type MassTimesNearby = {
  location: DeviceLocation
  churches: NearbyChurch[] | undefined // nearest the map center first
  clusters: Cluster[] // non-empty only when the viewport holds more churches than the list
  kind?: ServiceKind // the active service-kind filter, surfaced so views can label the next time
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

// Churches for the current map viewport, shared by the list and the map. The viewport is queried as a
// bounding box, so any zoom works: the backend returns every church in view nearest the center first,
// or — zoomed out — the nearest few plus counted clusters for the map. `today`/`favoritesOnly` refine
// the list on-device. Distance is from the user, never the map center, and only once located.
export function useMassTimesNearby(filter: MassFilter, region?: MapRegion): MassTimesNearby {
  const location = useDeviceLocation()
  const favorites = useFavoritesStore((s) => s.favorites)

  const view: MapRegion = region ?? {
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    latitudeDelta: defaultSpanDeg,
    longitudeDelta: defaultSpanDeg,
  }
  const { data, isLoading, isFetching, isError, refetch } = useViewport(
    bboxFromRegion(view),
    filter.kind,
    fetchLimit,
  )

  const located = location.status === 'granted'
  const { lat, lng } = location.coords
  const churches = useMemo<NearbyChurch[] | undefined>(() => {
    if (!data) return undefined
    return (
      data.churches
        .map((c) => ({
          ...c,
          services: c.services ?? [],
          distanceKm: located ? haversineKm(lat, lng, c.lat, c.lng) : undefined,
        }))
        .filter((c) => passesFilter(c, filter, favorites))
        // The backend orders by the map center; once the user is located, the distances shown are
        // theirs, so the list must read nearest-to-them first.
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    )
  }, [data, filter, favorites, located, lat, lng])

  return {
    location,
    churches,
    clusters: data?.clusters ?? [],
    kind: filter.kind,
    isLoading,
    isFetching,
    isError,
    refetch,
  }
}
