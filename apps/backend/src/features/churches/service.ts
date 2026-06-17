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
  linksForChurch,
  servicesForChurch,
  servicesForChurches,
  textsForChurch,
} from './queries'

export type NearbyChurch = Church & { distanceKm: number; services: Service[] }

// "Near me": geohash covering-set prunes to a small candidate set → haversine trims to the true
// circle → attach service rules. The DB does pure geo; the device expands rules + sorts by soonest.
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

  const services = await servicesForChurches(
    db,
    within.map((c) => c.id),
    { kind: q.kind, rite: q.rite },
  )
  const byChurch = groupBy(services, (s) => s.churchId)

  const result = within.map((c) => ({ ...c, services: byChurch.get(c.id) ?? [] }))
  // When kind/rite is filtered, only keep churches that actually have a matching service.
  return q.kind || q.rite ? result.filter((c) => c.services.length > 0) : result
}

export type ChurchDetail = Church & {
  services: Service[]
  texts: Awaited<ReturnType<typeof textsForChurch>>
  links: Awaited<ReturnType<typeof linksForChurch>>
}

export async function churchDetail(db: Db, id: string): Promise<ChurchDetail | undefined> {
  const c = await churchById(db, id)
  if (!c) return undefined
  const [services, texts, links] = await Promise.all([
    servicesForChurch(db, id),
    textsForChurch(db, id),
    linksForChurch(db, id),
  ])
  return { ...c, services, texts, links }
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
  return restrictByServiceFilters(db, base, { kind: query.kind, rite: query.rite })
}

// Restrict a church set to those with ≥1 service matching kind/rite. `near` applies the same
// predicate inline (it already fetches the services to attach them).
async function restrictByServiceFilters(
  db: Db,
  churches: Church[],
  filters: { kind?: string; rite?: string },
): Promise<Church[]> {
  if (!filters.kind && !filters.rite) return churches
  const matching = await servicesForChurches(
    db,
    churches.map((c) => c.id),
    filters,
  )
  const matchedIds = new Set(matching.map((s) => s.churchId))
  return churches.filter((c) => matchedIds.has(c.id))
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const bucket = map.get(k)
    if (bucket) bucket.push(item)
    else map.set(k, [item])
  }
  return map
}
