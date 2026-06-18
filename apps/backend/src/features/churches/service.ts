import type { Church, ChurchesQuery, NearQuery, Service } from '@ember/api'
import type { Db } from '../../db'
import {
  boundingBox,
  coveringPrefixes,
  geohashPrecisionForRadiusKm,
  haversineKm,
  prefixRanges,
} from '../../lib/geo'
import {
  browseChurches,
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

// Browse / search. `q` → FTS5 (rank-ordered ids → hydrate); otherwise country/city/bbox + filters.
// Service-level filters (kind/rite) are applied uniformly afterwards — same mechanism as `near`.
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
  } else {
    base = await browseChurches(db, {
      country: query.country,
      city: query.city,
      bbox: query.bbox,
      institute: query.institute,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    })
  }
  if (!query.kind && !query.rite) return base
  return base.filter((c) => (c.services ?? []).some((s) => matchesFilter(s, query)))
}
