import type { ServiceKind } from '@ember/api'
import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import type { Bbox, Cluster, NearbyChurch } from '@/lib/mass-times'
import { useMapView } from '@/lib/mass-times'
import { useFavoritesStore } from './favorites'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

// The viewport before the map reports its real region: about what a phone shows at the map's
// opening zoom, ~28 km tall around the user.
const defaultLatSpanDeg = 0.25
const defaultLngSpanDeg = 0.125
// The native map's markers are larger than the website's: a pin about 40 pt across, a count wider.
const markerReach = { pin: 38, count: 64 }
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

// The nearby filters, both applied on-device: `kind` to the tiles' schedules, `favoritesOnly` against
// the saved-id lookup.
export type MassFilter = {
  kind?: ServiceKind
  favoritesOnly: boolean
}

export const emptyFilter: MassFilter = { kind: undefined, favoritesOnly: false }

// The on-device half of the filter, shared by the nearby list and search results.
export function passesFilter(
  church: { id: string },
  filter: MassFilter,
  favorites: Record<string, unknown>,
): boolean {
  return !filter.favoritesOnly || Boolean(favorites[church.id])
}

export type MassTimesNearby = {
  location: DeviceLocation
  churches: NearbyChurch[] | undefined // nearest the map center first
  center: { lat: number; lng: number } // the map center — where name search ranks from
  clusters: Cluster[] // non-empty only when churches in view are counted together
  mode: 'detail' | 'counts' // `counts`: too wide a view to list church by church
  kind?: ServiceKind // the active service-kind filter, surfaced so views can label the next time
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

// Churches for the current map viewport, shared by the list and the map, drawn from church tiles
// (see `lib/mass-times/tiles`): close in, every church in view with its schedule, counted together
// only where pins would overlap; zoomed out, counts and no list. The service kind filters on-device,
// as do `favoritesOnly`. Distance is from the user, never the map center, and only once located.
export function useMassTimesNearby(filter: MassFilter, region?: MapRegion): MassTimesNearby {
  const location = useDeviceLocation()
  const favorites = useFavoritesStore((s) => s.favorites)

  const view: MapRegion = region ?? {
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    latitudeDelta: defaultLatSpanDeg,
    longitudeDelta: defaultLngSpanDeg,
  }
  const { width } = useWindowDimensions()
  const {
    view: drawn,
    isFetching,
    isError,
    refetch,
  } = useMapView(bboxFromRegion(view), width / view.longitudeDelta, filter.kind, markerReach)
  // Nothing to show yet, as against nothing there: a detail view still waiting on its tiles.
  const isLoading = drawn.mode === 'detail' && !drawn.complete && drawn.churches.length === 0

  const located = location.status === 'granted'
  const { lat, lng } = location.coords
  const churches = useMemo<NearbyChurch[] | undefined>(() => {
    if (isLoading) return undefined
    return (
      drawn.churches
        .map((c) => ({
          ...c,
          services: c.services ?? [],
          distanceKm: located ? haversineKm(lat, lng, c.lat, c.lng) : undefined,
        }))
        .filter((c) => passesFilter(c, filter, favorites))
        // The tiles are read nearest the map center first; once the user is located, the distances shown are
        // theirs, so the list must read nearest-to-them first.
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    )
  }, [drawn.churches, isLoading, filter, favorites, located, lat, lng])

  return {
    location,
    churches,
    center: { lat: view.latitude, lng: view.longitude },
    clusters: drawn.clusters,
    mode: drawn.mode,
    kind: filter.kind,
    isLoading,
    isFetching,
    isError,
    refetch,
  }
}
