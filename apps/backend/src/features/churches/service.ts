import type { Church, NearQuery, Service } from '@ember/api'
import type { Db } from '../../db'
import type { Bbox } from '../../lib/geo'
import {
  boundingBox,
  clusterPrecision,
  coveringPrefixes,
  geohashPrecisionForRadiusKm,
  haversineKm,
  prefixRanges,
  viewportPrefixes,
} from '../../lib/geo'
import {
  cellCounts,
  churchById,
  churchesByIds,
  churchesInGeohashRanges,
  churchesInViewport,
  churchIdsMatchingText,
  countInViewport,
  type ViewportFilter,
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

// A one-church cluster names its church, so the map can show it as that church's pin.
export type Cluster = {
  id: string
  lat: number
  lng: number
  count: number
  church?: { id: string; name: string }
}
export type Viewport = { churches: Church[]; clusters: Cluster[] }

const byDistanceFrom = (lat: number, lng: number) => (a: Church, b: Church) =>
  haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng)

// Viewport browse at any zoom. When the box holds no more than `limit` churches, all of them come
// back, nearest the view center first. Past that, the map gets counted clusters covering the whole
// box and the list gets the `limit` churches nearest the center — read from the clusters closest to
// it, so a zoomed-out city never returns an arbitrary corner of the index.
export async function viewport(
  db: Db,
  q: {
    bbox: Bbox
    kind?: string
    rite?: string
    status?: string
    institute?: string
    limit: number
  },
): Promise<Viewport> {
  const { bbox, limit } = q
  const lat = (bbox.minLat + bbox.maxLat) / 2
  const lng = (bbox.minLng + bbox.maxLng) / 2
  const filter: ViewportFilter = { ...q, ranges: prefixRanges(viewportPrefixes(bbox)) }

  if ((await countInViewport(db, filter)) <= limit) {
    const churches = await churchesInViewport(db, filter)
    return { churches: churches.sort(byDistanceFrom(lat, lng)), clusters: [] }
  }

  const cells = await cellCounts(db, filter, clusterPrecision(bbox))
  const clusters = cells.map((c) => ({
    id: c.cell,
    lat: c.lat,
    lng: c.lng,
    count: c.count,
    church: c.count === 1 ? { id: c.churchId, name: c.churchName } : undefined,
  }))

  const nearest: string[] = []
  let covered = 0
  for (const c of [...cells].sort(
    (a, b) => haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng),
  )) {
    if (covered >= limit || nearest.length >= 32) break
    nearest.push(c.cell)
    covered += c.count
  }
  const churches = await churchesInViewport(db, { ...filter, ranges: prefixRanges(nearest) })
  return { churches: churches.sort(byDistanceFrom(lat, lng)).slice(0, limit), clusters }
}

// FTS5 name search: ordered ids (nearest `near` first, else text rank) → hydrated rows, then the
// same service-level filter as the viewport.
export async function searchChurches(
  db: Db,
  query: {
    q: string
    near?: { lat: number; lng: number }
    kind?: string
    rite?: string
    limit: number
    offset: number
  },
): Promise<Church[]> {
  const ids = await churchIdsMatchingText(db, query.q, {
    limit: query.limit,
    offset: query.offset,
    near: query.near,
  })
  const rows = await churchesByIds(db, ids)
  const order = new Map(ids.map((id, i) => [id, i]))
  const ranked = rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  if (!query.kind && !query.rite) return ranked
  return ranked.filter((c) => (c.services ?? []).some((s) => matchesFilter(s, query)))
}
