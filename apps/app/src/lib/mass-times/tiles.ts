// The map, read as tiles. A tile is a geohash cell, the same address for everyone looking at that
// part of the world, so it can be kept: by the browser, by the app across launches, by the edge.
// Close in, a view is covered by cells of `detailPrecision` carrying their churches with schedules
// — the pins and the list both come from them, and a pan only asks for the cells it uncovers.
// Further out it is covered by coarser cells carrying the counts of the cells beneath them.
// Pure: what to fetch for a view, and what to draw from what has arrived. No fetching, no React.

import type { Church, ServiceKind } from '@ember/api'
import type { Bbox, Cluster } from './client'

export const detailPrecision = 5
// Past this many detail tiles a view is too wide to pin church by church: a city shown whole is
// a thicket of pins. A phone at city zoom asks for a dozen or two, a desktop for two dozen.
const maxDetailTiles = 32
// A count tile answers for up to 32 cells, so a handful cover any view.
const maxCountTiles = 16

const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'

// A geohash interleaves longitude and latitude bits, longitude first: a cell of length n is
// column `x` of 2^ceil(5n/2) across the world and row `y` of 2^floor(5n/2) up it.
const lngBits = (precision: number) => Math.ceil((5 * precision) / 2)
const latBits = (precision: number) => Math.floor((5 * precision) / 2)

function cellAt(x: number, y: number, precision: number): string {
  let hash = ''
  let lng = lngBits(precision)
  let lat = latBits(precision)
  let even = true
  for (let i = 0; i < precision; i++) {
    let digit = 0
    for (let bit = 0; bit < 5; bit++) {
      const set = even ? (x >> --lng) & 1 : (y >> --lat) & 1
      digit = (digit << 1) | set
      even = !even
    }
    hash += base32[digit]
  }
  return hash
}

/** Every geohash cell of the given length that touches the box. */
export function cellsCovering(bbox: Bbox, precision: number): string[] {
  const columns = 2 ** lngBits(precision)
  const rows = 2 ** latBits(precision)
  const column = (lng: number) =>
    Math.min(columns - 1, Math.max(0, Math.floor(((lng + 180) / 360) * columns)))
  const row = (lat: number) =>
    Math.min(rows - 1, Math.max(0, Math.floor(((lat + 90) / 180) * rows)))
  const cells: string[] = []
  for (let y = row(bbox.minLat); y <= row(bbox.maxLat); y++) {
    for (let x = column(bbox.minLng); x <= column(bbox.maxLng); x++) {
      cells.push(cellAt(x, y, precision))
    }
  }
  return cells
}

function countCovering(bbox: Bbox, precision: number): number {
  const across = (min: number, max: number, span: number, bits: number) =>
    Math.floor(((max + span / 2) / span) * 2 ** bits) -
    Math.floor(((min + span / 2) / span) * 2 ** bits) +
    1
  return (
    across(bbox.minLng, bbox.maxLng, 360, lngBits(precision)) *
    across(bbox.minLat, bbox.maxLat, 180, latBits(precision))
  )
}

export type ViewPlan = {
  /** `detail`: the tiles carry churches. `counts`: they carry the counts of finer cells. */
  mode: 'detail' | 'counts'
  tiles: string[]
}

/** The tiles a view is drawn from: the finest that cover it in a reasonable number. */
export function planView(bbox: Bbox): ViewPlan {
  if (countCovering(bbox, detailPrecision) <= maxDetailTiles) {
    return { mode: 'detail', tiles: cellsCovering(bbox, detailPrecision) }
  }
  for (let precision = detailPrecision - 1; precision >= 1; precision--) {
    if (countCovering(bbox, precision) <= maxCountTiles) {
      return { mode: 'counts', tiles: cellsCovering(bbox, precision) }
    }
  }
  return { mode: 'counts', tiles: ['root'] }
}

/** The detail tiles a quarter-view around a view's own: where the next pan will land. */
export function ringAround(bbox: Bbox, plan: ViewPlan): string[] {
  if (plan.mode !== 'detail') return []
  const lat = (bbox.maxLat - bbox.minLat) / 4
  const lng = (bbox.maxLng - bbox.minLng) / 4
  const wider = {
    minLat: Math.max(-90, bbox.minLat - lat),
    maxLat: Math.min(90, bbox.maxLat + lat),
    minLng: Math.max(-180, bbox.minLng - lng),
    maxLng: Math.min(180, bbox.maxLng + lng),
  }
  if (countCovering(wider, detailPrecision) > maxDetailTiles * 2) return []
  const own = new Set(plan.tiles)
  return cellsCovering(wider, detailPrecision).filter((cell) => !own.has(cell))
}

/** Where a tile lives on the API. A detail tile is one address whatever the filter. */
export function tilePath(cell: string, mode: ViewPlan['mode'], kind?: ServiceKind): string {
  const query = mode === 'counts' && kind ? `?kind=${kind}` : ''
  return `/churches/tiles/${cell}${query}`
}

export type Tile = { churches?: Church[]; cells?: Cluster[] }

export type DrawnView = {
  mode: ViewPlan['mode']
  /** The churches in view, nearest its centre first. Empty in `counts`: too wide a view to list. */
  churches: Church[]
  /**
   * What the map marks. Empty when every church in view stands clear of the others, and the map
   * pins `churches`; otherwise it accounts for all of them, a cluster of one being its church.
   */
  clusters: Cluster[]
  /** Whether every tile of the plan has arrived. */
  complete: boolean
}

// How near two markers' centres may come before they are drawn as one: a pin is 26 px across and
// may overlap its neighbour a little; a count is wider and should not touch another.
const pinReach = 22
const countReach = 46

type Marker = { id: string; lat: number; lng: number; count: number; church?: Cluster['church'] }

// Markers nearer than `reach` pixels merge, densest first, into one at their centre of mass.
// `pxPerDeg` is the map's scale in pixels per degree of longitude.
function merge(markers: Marker[], reach: number, pxPerDeg: number, midLat: number): Cluster[] {
  // Mercator stretches a degree of latitude by 1/cos(lat) against one of longitude.
  const perLat = pxPerDeg / Math.max(0.01, Math.cos((midLat * Math.PI) / 180))
  const placed = markers
    .map((m) => ({ m, x: m.lng * pxPerDeg, y: m.lat * perLat }))
    .sort((a, b) => b.m.count - a.m.count || (a.m.id < b.m.id ? -1 : 1))
  const key = (x: number, y: number) => `${Math.floor(x / reach)}:${Math.floor(y / reach)}`
  const grid = new Map<string, typeof placed>()
  for (const p of placed) {
    const cell = grid.get(key(p.x, p.y))
    if (cell) cell.push(p)
    else grid.set(key(p.x, p.y), [p])
  }
  const taken = new Set<string>()
  const clusters: Cluster[] = []
  for (const seed of placed) {
    if (taken.has(seed.m.id)) continue
    const members: Marker[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const p of grid.get(key(seed.x + dx * reach, seed.y + dy * reach)) ?? []) {
          if (taken.has(p.m.id) || Math.hypot(p.x - seed.x, p.y - seed.y) > reach) continue
          taken.add(p.m.id)
          members.push(p.m)
        }
      }
    }
    const count = members.reduce((sum, m) => sum + m.count, 0)
    clusters.push({
      id: members.length === 1 ? seed.m.id : `${seed.m.id}+${count}`,
      lat: members.reduce((sum, m) => sum + m.lat * m.count, 0) / count,
      lng: members.reduce((sum, m) => sum + m.lng * m.count, 0) / count,
      count,
      church: count === 1 ? seed.m.church : undefined,
    })
  }
  return clusters
}

const within = (b: Bbox, p: { lat: number; lng: number }) =>
  p.lat >= b.minLat && p.lat <= b.maxLat && p.lng >= b.minLng && p.lng <= b.maxLng

/**
 * What to draw for a view from the tiles that have arrived (`tiles[i]` answers `plan.tiles[i]`,
 * undefined until it does). Markers reach a little past the view's edge, so a short pan uncovers
 * ones already drawn.
 */
export function drawView(view: {
  plan: ViewPlan
  tiles: (Tile | undefined)[]
  bbox: Bbox
  /** Map scale: pixels per degree of longitude. */
  pxPerDeg: number
  kind?: ServiceKind
}): DrawnView {
  const { plan, tiles, bbox, pxPerDeg, kind } = view
  const midLat = (bbox.minLat + bbox.maxLat) / 2
  const midLng = (bbox.minLng + bbox.maxLng) / 2
  const complete = tiles.every((tile) => tile !== undefined)
  const margin = {
    minLat: bbox.minLat - (bbox.maxLat - bbox.minLat) / 4,
    maxLat: bbox.maxLat + (bbox.maxLat - bbox.minLat) / 4,
    minLng: bbox.minLng - (bbox.maxLng - bbox.minLng) / 4,
    maxLng: bbox.maxLng + (bbox.maxLng - bbox.minLng) / 4,
  }

  if (plan.mode === 'counts') {
    const cells = tiles.flatMap((tile) => tile?.cells ?? []).filter((c) => within(margin, c))
    return {
      mode: 'counts',
      churches: [],
      clusters: merge(cells, countReach, pxPerDeg, midLat),
      complete,
    }
  }

  const offering = tiles
    .flatMap((tile) => tile?.churches ?? [])
    .filter((c) => !kind || (c.services ?? []).some((s) => s.kind === kind))
  const squash = Math.cos((midLat * Math.PI) / 180)
  const fromCentre = (c: Church) => Math.hypot((c.lng - midLng) * squash, c.lat - midLat)
  const churches = offering
    .filter((c) => within(bbox, c))
    .sort((a, b) => fromCentre(a) - fromCentre(b))
  const clusters = merge(
    offering
      .filter((c) => within(margin, c))
      .map((c) => ({
        id: c.id,
        lat: c.lat,
        lng: c.lng,
        count: 1,
        church: { id: c.id, name: c.name },
      })),
    pinReach,
    pxPerDeg,
    midLat,
  )
  const apart = clusters.every((c) => c.count === 1)
  return { mode: 'detail', churches, clusters: apart ? [] : clusters, complete }
}
