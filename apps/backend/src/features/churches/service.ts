import type { Church, ChurchesQuery, NearQuery, Service } from '@ember/api'
import type { Db } from '../../db'
import type { Bbox } from '../../lib/geo'
import {
  boundingBox,
  coveringPrefixes,
  geohashPrecisionForBbox,
  geohashPrecisionForRadiusKm,
  haversineKm,
  prefixRanges,
} from '../../lib/geo'
import {
  churchById,
  churchesByIds,
  churchesInGeohashRanges,
  churchIdsMatchingText,
} from './queries'

export type NearbyChurch = Church & { distanceKm: number; services: Service[] }

const matchesFilter = (s: Service, f: { kind?: string; rite?: string }) =>
  (!f.kind || s.kind === f.kind) && (!f.rite || s.rite === f.rite)

// "Near me": geohash covering-set prunes to a small candidate set → haversine trims to the true
// circle → the church carries its (embedded) service rules. The DB does pure geo; the device expands
// rules + sorts by soonest. A kind/rite filter trims each church's services and drops churches left
// with none — the same predicate `searchChurches` applies.
export async function nearbyChurches(db: Db, q: NearQuery): Promise<NearbyChurch[]> {
  const bbox = boundingBox(q.lat, q.lng, q.radiusKm)
  const precision = geohashPrecisionForRadiusKm(q.radiusKm)
  const ranges = prefixRanges(coveringPrefixes(bbox, precision))

  const candidates = await churchesInGeohashRanges(db, ranges, {
    status: q.status,
    institute: q.institute,
  })

  const within = candidates
    .map((c) => ({ ...c, distanceKm: haversineKm(q.lat, q.lng, c.lat, c.lng) }))
    .filter((c) => c.distanceKm <= q.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, q.limit)
    .map((c) => ({ ...c, services: (c.services ?? []).filter((s) => matchesFilter(s, q)) }))

  return q.kind || q.rite ? within.filter((c) => c.services.length > 0) : within
}

export type ChurchDetail = Church & {
  services: Service[]
  texts: NonNullable<Church['texts']>
  links: NonNullable<Church['links']>
}

export async function churchDetail(db: Db, id: string): Promise<ChurchDetail | undefined> {
  const c = await churchById(db, id)
  if (!c) return undefined
  return { ...c, services: c.services ?? [], texts: c.texts ?? [], links: c.links ?? [] }
}

const inBbox = (c: { lat: number; lng: number }, b: Bbox) =>
  c.lat >= b.minLat && c.lat <= b.maxLat && c.lng >= b.minLng && c.lng <= b.maxLng

// Viewport browse: the same geohash covering-set → indexed prefix scan as `near`, bounded by a box
// instead of a radius. Covering cells overshoot the box, so refine to true containment, then cap.
export async function churchesInViewport(
  db: Db,
  q: { bbox: Bbox; status?: string; institute?: string; limit: number },
): Promise<Church[]> {
  const ranges = prefixRanges(coveringPrefixes(q.bbox, geohashPrecisionForBbox(q.bbox)))
  const candidates = await churchesInGeohashRanges(db, ranges, {
    status: q.status,
    institute: q.institute,
  })
  return candidates.filter((c) => inBbox(c, q.bbox)).slice(0, q.limit)
}

// Search. `q` → FTS5 (rank-ordered ids → hydrate); else a viewport `bbox` → geohash-indexed scan.
// Both paths are index-backed; an unbounded list (neither given) has no indexed answer and is
// rejected by the validator (this returns []). Service-level filters (kind/rite) apply uniformly
// afterwards — same mechanism as `near`.
export async function searchChurches(db: Db, query: ChurchesQuery): Promise<Church[]> {
  let base: Church[]
  if (query.q) {
    const ids = await churchIdsMatchingText(db, query.q, {
      limit: query.limit,
      offset: query.offset,
    })
    const rows = await churchesByIds(db, ids)
    const order = new Map(ids.map((id, i) => [id, i]))
    base = rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  } else if (query.bbox) {
    base = await churchesInViewport(db, {
      bbox: query.bbox,
      status: query.status,
      institute: query.institute,
      limit: query.limit,
    })
  } else {
    return []
  }
  if (!query.kind && !query.rite) return base
  return base.filter((c) => (c.services ?? []).some((s) => matchesFilter(s, query)))
}
