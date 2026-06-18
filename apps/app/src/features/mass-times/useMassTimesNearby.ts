import type { ServiceKind } from '@ember/api'
import { useMemo } from 'react'
import type { Bbox, NearbyChurch } from '@/lib/mass-times'
import { hasServiceToday, useChurchesInBbox } from '@/lib/mass-times'
import { useFavoritesStore } from './favorites'
import type { DeviceLocation } from './useDeviceLocation'
import { useDeviceLocation } from './useDeviceLocation'

// Backend browse is capped at 100 churches per request.
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

// Churches for the current map viewport, shared by the list and the map. We query the viewport as a
// bounding box (`/churches?bbox`) rather than a fixed radius, so any zoom works — from a city block to
// the whole globe (capped at `fetchLimit`). `today`/`favoritesOnly` refine on-device; distance is
// computed from the view center so the list reads nearest-first.
export function useMassTimesNearby(filter: MassFilter, region?: MapRegion): MassTimesNearby {
  const location = useDeviceLocation()
  const favorites = useFavoritesStore((s) => s.favorites)

  const view: MapRegion = region ?? {
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    latitudeDelta: defaultSpanDeg,
    longitudeDelta: defaultSpanDeg,
  }
  const bbox = bboxFromRegion(view)
  const { data, isLoading, isFetching, isError, refetch } = useChurchesInBbox(
    bbox,
    filter.kind,
    fetchLimit,
  )

  const churches = useMemo<NearbyChurch[] | undefined>(() => {
    if (!data) return undefined
    return data
      .map((c) => ({
        ...c,
        services: c.services ?? [],
        distanceKm: haversineKm(view.latitude, view.longitude, c.lat, c.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .filter((c) => {
        if (filter.favoritesOnly && !favorites[c.id]) return false
        if (
          filter.today &&
          !hasServiceToday(c.services, { timezone: c.timezone, kind: filter.kind })
        )
          return false
        return true
      })
  }, [
    data,
    filter.today,
    filter.favoritesOnly,
    filter.kind,
    favorites,
    view.latitude,
    view.longitude,
  ])

  return { location, churches, kind: filter.kind, isLoading, isFetching, isError, refetch }
}
