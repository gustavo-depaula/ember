import { useEffect, useRef } from 'react'

import { cellsCovering, detailPrecision } from '@/lib/mass-times/tiles'
import { track } from '@/lib/usage'
import { haversineKm, type MassFilter, type MassTimesNearby } from './useMassTimesNearby'

// Where people look for Mass: each map view they stop on, named by the tile
// cell of its center (about 5 km across, the same cells the map is read in), so
// the usage desk can name the city from the churches in it. A view is counted
// once it has held still a while, and once per cell and question, however
// often the map is nudged inside it. The São Paulo default shown before anyone
// is located, or to someone who said no, is not a place they looked at.

const settleMs = 2500
// Within this of the person, the view is around them rather than looked up.
const hereKm = 3

export function useAreaUsage(nearby: MassTimesNearby, filter: MassFilter, panned: boolean) {
  const last = useRef('')
  const { center, location, mode, churches } = nearby
  const located = location.status === 'granted'
  const cell = cellsCovering(
    { minLat: center.lat, maxLat: center.lat, minLng: center.lng, maxLng: center.lng },
    detailPrecision,
  )[0]
  const listed = churches?.length
  const here =
    located &&
    haversineKm(center.lat, center.lng, location.coords.lat, location.coords.lng) < hereKm
  const key = `${cell}|${filter.intent}|${filter.when}`
  useEffect(() => {
    if (mode !== 'detail' || listed === undefined || !cell) return
    if (!located && !panned) return
    if (key === last.current) return
    const timer = setTimeout(() => {
      last.current = key
      track('mass_area', {
        cell,
        intent: filter.intent,
        when: filter.when,
        churches: String(listed),
        here: here ? '1' : '0',
      })
    }, settleMs)
    return () => clearTimeout(timer)
  }, [key, mode, listed, cell, located, panned, here, filter.intent, filter.when])
}
