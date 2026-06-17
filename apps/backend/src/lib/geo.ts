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

// Every geohash cell of the given length that intersects the box (more than "center + 8 neighbors"
// whenever the box spans multiple cells). ngeohash.bboxes returns exactly this set.
export function coveringPrefixes(bbox: Bbox, precision: number): string[] {
  return ngeohash.bboxes(bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, precision)
}

// Each prefix → a half-open range [prefix, prefix + '{'). '{' (0x7B) sorts after every geohash
// base32 char (max 'z' = 0x7A) under BINARY collation, so `geohash >= lo AND geohash < hi` matches
// exactly the full-precision geohashes carrying that prefix — and stays sargable on the index.
export function prefixRanges(prefixes: string[]): Array<[string, string]> {
  return prefixes.map((p) => [p, `${p}{`])
}

export function encodeGeohash(lat: number, lng: number, precision = 9): string {
  return ngeohash.encode(lat, lng, precision)
}
