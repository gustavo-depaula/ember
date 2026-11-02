// The Brazilian municipality a church stands in. The directory's city field is unreliable: about one
// church in six names a neighbourhood ("Centro", "Aldeota", "Ceilândia"), an address ("Fortaleza
// Ceará", "Caruaru/Pe") or a neighbourhood that shares its name with a town in another state
// ("Betânia" in Belo Horizonte). The coordinates are sound, so the outline they fall in decides.
// The outlines are IBGE's coarsest and stray a few hundred metres at borders, so a written city
// that is a real municipality right beside the church is believed over them.
import data from './br-municipalities.json'

export type Municipality = { name: string; uf: string }

type Outline = Municipality & {
  rings: Float64Array[][]
  box: [number, number, number, number]
}

const unpack = (packed: number[]) => {
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

let outlines: Outline[] | undefined
let byName: Map<string, Outline[]> | undefined

function load() {
  outlines ??= (data as { name: string; uf: string; polygons: number[][][] }[]).map((m) => {
    const rings = m.polygons.map((polygon) => polygon.map(unpack))
    const box: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity]
    for (const polygon of rings) {
      const outer = polygon[0]
      for (let i = 0; i < outer.length; i += 2) {
        box[0] = Math.min(box[0], outer[i])
        box[1] = Math.min(box[1], outer[i + 1])
        box[2] = Math.max(box[2], outer[i])
        box[3] = Math.max(box[3], outer[i + 1])
      }
    }
    return { name: m.name, uf: m.uf, rings, box }
  })
  if (!byName) {
    byName = new Map()
    for (const m of outlines) byName.set(key(m.name), [...(byName.get(key(m.name)) ?? []), m])
  }
  return { outlines, byName }
}

const key = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function inRing(lng: number, lat: number, ring: Float64Array) {
  let inside = false
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const [xi, yi, xj, yj] = [ring[i], ring[i + 1], ring[j], ring[j + 1]]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const contains = (m: Outline, lng: number, lat: number) =>
  m.rings.some(
    ([outer, ...holes]) => inRing(lng, lat, outer) && !holes.some((hole) => inRing(lng, lat, hole)),
  )

/** How far, in degrees, a point lies outside a municipality's bounding box; 0 inside it. */
const boxGap = ({ box }: Outline, lng: number, lat: number) =>
  Math.hypot(Math.max(box[0] - lng, 0, lng - box[2]), Math.max(box[1] - lat, 0, lat - box[3]))

// About 10 km: the outlines' error at a border, and no more, so a neighbourhood called after a far
// town is not taken for it.
const nearby = 0.1

const abbreviations: [RegExp, string][] = [
  [/\bgov\.?\s/i, 'Governador '],
  [/\bpres\.?\s/i, 'Presidente '],
  [/\bsra\.?\s/i, 'Senhora '],
  [/\bsto\.?\s/i, 'Santo '],
  [/\bsta\.?\s/i, 'Santa '],
  [/\bdr\.?\s/i, 'Doutor '],
]

/** The city an importer wrote, freed of what follows it: "Redenção (PA)", "Caruaru/Pe", "X | Y". */
function written(city: string, stateNames: string[]) {
  let text = city.split(/[|(/,]/)[0].trim()
  for (const [pattern, full] of abbreviations) text = text.replace(pattern, full)
  for (const state of stateNames) {
    const tail = new RegExp(`[\\s-]+${state}$`, 'i')
    if (tail.test(text) && text.length > state.length + 2) text = text.replace(tail, '')
  }
  return text.trim()
}

/** The municipality at these coordinates, the written city deciding near a border. */
export function municipalityAt(
  lat: number,
  lng: number,
  city: string | null,
  stateNames: string[],
): Municipality | undefined {
  const { outlines, byName } = load()
  const named = city ? byName.get(key(written(city, stateNames))) : undefined
  const believed = named?.find((m) => boxGap(m, lng, lat) === 0 && contains(m, lng, lat))
  if (believed) return believed
  const inside = outlines.find((m) => boxGap(m, lng, lat) === 0 && contains(m, lng, lat))
  const close = named?.find((m) => boxGap(m, lng, lat) < nearby)
  // A written municipality beside the outline the point falls in is the border's error, not the
  // importer's.
  if (close && (!inside || close.uf === inside.uf)) return close
  if (inside) return inside
  // Off the coarse coast: the nearest municipality, if one is near.
  let best: Outline | undefined
  let gap = nearby
  for (const m of outlines) {
    const g = boxGap(m, lng, lat)
    if (g < gap) {
      gap = g
      best = m
    }
  }
  return best
}
