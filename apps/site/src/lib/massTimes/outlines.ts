// The outlines of IBGE's areas, as the generator scripts pack them: each ring integers of 1/10000°,
// every point the difference from the one before.

export type Outline = {
  rings: Float64Array[]
  box: [number, number, number, number]
}

function unpack(packed: number[]) {
  const ring = new Float64Array(packed.length)
  let x = 0
  let y = 0
  for (let i = 0; i < packed.length; i += 2) {
    x += packed[i]
    y += packed[i + 1]
    ring[i] = x / 1e4
    ring[i + 1] = y / 1e4
  }
  return ring
}

export function outlineOf(packed: number[][]): Outline {
  const rings = packed.map(unpack)
  const box: Outline['box'] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      box[0] = Math.min(box[0], ring[i])
      box[1] = Math.min(box[1], ring[i + 1])
      box[2] = Math.max(box[2], ring[i])
      box[3] = Math.max(box[3], ring[i + 1])
    }
  }
  return { rings, box }
}

/** How far, in degrees, a point lies outside an outline's bounding box; 0 inside it. */
export function boxGap({ box }: Outline, lng: number, lat: number) {
  return Math.hypot(
    Math.max(box[0] - lng, 0, lng - box[2]),
    Math.max(box[1] - lat, 0, lat - box[3]),
  )
}

// Even–odd over every ring: a point in a hole crosses its outer ring and the hole, and so is out;
// the parts of a split area each count alone.
export function contains(outline: Outline, lng: number, lat: number) {
  if (boxGap(outline, lng, lat) > 0) return false
  let inside = false
  for (const ring of outline.rings) {
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const [xi, yi, xj, yj] = [ring[i], ring[i + 1], ring[j], ring[j + 1]]
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}
