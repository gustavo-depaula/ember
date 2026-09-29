import ngeohash from 'ngeohash'

// Geo helpers — D1/SQLite has no R-tree, so we emulate a spatial index with a geohash B-tree.
// Every geo query is BOUNDED and geo-first: covering-set of geohash prefixes → indexed prefix
// ranges → haversine refine. Pure functions, no D1 dependency (unit-testable).

export type Bbox = { minLat: number; minLng: number; maxLat: number; maxLng: number }

const earthRadiusKm = 6371

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.asin(Math.min(1, Math.sqrt(a)))
}

const toRad = (deg: number) => (deg * Math.PI) / 180

// Lat/lng box around a center point for a given radius. Used to turn "near me" into a bbox the
// geohash covering-set can prune against (haversine then trims the box corners to a true circle).
export function boundingBox(lat: number, lng: number, radiusKm: number): Bbox {
  const dLat = radiusKm / 111 // ~111 km per degree latitude
  const dLng = radiusKm / (111 * Math.cos(toRad(lat)) || 1e-9)
  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLng: lng - dLng,
    maxLng: lng + dLng,
  }
}

// Coarser cells for larger boxes → a small covering set (a handful of cells, not thousands).
// Geohash cell sizes by length: 3 ≈ 156 km, 4 ≈ 39 km, 5 ≈ 4.9 km, 6 ≈ 1.2 km.
export function geohashPrecisionForRadiusKm(radiusKm: number): number {
  if (radiusKm <= 0.6) return 6
  if (radiusKm <= 2.5) return 5
  if (radiusKm <= 20) return 4
  return 3
}

// A viewport box's precision: take its larger span as the working diameter and reuse the radius
// mapping (half the diameter). Keeps the covering set small for wide boxes, fine-grained for tight
// ones — same indexed prefix-range path as "near", just bounded by a box instead of a circle.
export function geohashPrecisionForBbox(bbox: Bbox): number {
  const midLat = (bbox.minLat + bbox.maxLat) / 2
  const latSpanKm = (bbox.maxLat - bbox.minLat) * 111
  const lngSpanKm = Math.abs(bbox.maxLng - bbox.minLng) * 111 * Math.cos(toRad(midLat))
  return geohashPrecisionForRadiusKm(Math.max(latSpanKm, lngSpanKm) / 2)
}

// Every geohash cell of the given length that intersects the box (more than "center + 8 neighbors"
// whenever the box spans multiple cells). ngeohash.bboxes returns exactly this set.
export function coveringPrefixes(bbox: Bbox, precision: number): string[] {
  return ngeohash.bboxes(bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, precision)
}

// Each range binds two SQL parameters and D1 caps a statement at 100, so a zoomed-out box must be
// covered by coarser cells. Walk the precision down until the covering set is small.
const maxCoveringCells = 32

export function viewportPrefixes(bbox: Bbox): string[] {
  let precision = geohashPrecisionForBbox(bbox)
  let prefixes = coveringPrefixes(bbox, precision)
  while (prefixes.length > maxCoveringCells && precision > 1) {
    precision--
    prefixes = coveringPrefixes(bbox, precision)
  }
  return prefixes
}

const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'

// The next same-length geohash cell in index order ('6gyf' → '6gyg', '6gz' → '6h0'), or undefined
// past the last one.
function nextCell(prefix: string): string | undefined {
  const i = prefix.length - 1
  if (i < 0) return undefined
  const digit = base32.indexOf(prefix[i])
  if (digit < base32.length - 1) return prefix.slice(0, i) + base32[digit + 1]
  const carried = nextCell(prefix.slice(0, i))
  return carried === undefined ? undefined : `${carried}0`
}

// Prefixes → half-open ranges [lo, hi) over the geohash index, adjacent cells merged into one range.
// The base32 alphabet is in ASCII order, so BINARY collation sorts geohashes cell by cell, and
// `geohash >= lo AND geohash < hi` stays sargable. '{' (0x7B) sorts after 'z', bounding the last cell.
export function prefixRanges(prefixes: string[]): Array<[string, string]> {
  const ranges: Array<[string, string]> = []
  for (const prefix of [...prefixes].sort()) {
    const last = ranges.at(-1)
    const hi = nextCell(prefix) ?? `${prefix}{`
    if (last?.[1] === prefix) last[1] = hi
    else ranges.push([prefix, hi])
  }
  return ranges
}

// Cluster cell length for a viewport: the finest geohash cell still ≥ ~1/6 of the box's larger
// span, so a zoomed-out map shows a few dozen counted clusters rather than hundreds of pins.
const cellWidthKm = [5000, 1250, 156, 39, 4.9, 1.2, 0.15, 0.04]

export function clusterPrecision(bbox: Bbox): number {
  const midLat = (bbox.minLat + bbox.maxLat) / 2
  const latSpanKm = (bbox.maxLat - bbox.minLat) * 111
  const lngSpanKm = Math.abs(bbox.maxLng - bbox.minLng) * 111 * Math.cos(toRad(midLat))
  const target = Math.max(latSpanKm, lngSpanKm) / 6
  let precision = 1
  while (precision < cellWidthKm.length && cellWidthKm[precision] >= target) precision++
  return precision
}

export function encodeGeohash(lat: number, lng: number, precision = 9): string {
  return ngeohash.encode(lat, lng, precision)
}
