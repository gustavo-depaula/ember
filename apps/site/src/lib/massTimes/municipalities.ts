// The Brazilian municipality a church stands in. The directory's city field is unreliable: about one
// church in six names a neighbourhood ("Centro", "Aldeota", "Ceilândia"), an address ("Fortaleza
// Ceará", "Caruaru/Pe") or a neighbourhood that shares its name with a town in another state
// ("Betânia" in Belo Horizonte). The coordinates are sound, so the outline they fall in decides.
// The outlines are IBGE's coarsest and stray a few hundred metres at borders, so a written city
// that is a real municipality right beside the church is believed over them.
import data from './br-municipalities.json'
import { boxGap, contains, type Outline, outlineOf } from './outlines'

export type Municipality = { id: string; name: string; uf: string }

type Area = Municipality & Outline

let outlines: Area[] | undefined
let byName: Map<string, Area[]> | undefined

function load() {
  outlines ??= (data as { id: string; name: string; uf: string; polygons: number[][][] }[]).map(
    ({ polygons, ...m }) => ({ ...m, ...outlineOf(polygons.flat()) }),
  )
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
  const believed = named?.find((m) => contains(m, lng, lat))
  if (believed) return believed
  const inside = outlines.find((m) => contains(m, lng, lat))
  const close = named?.find((m) => boxGap(m, lng, lat) < nearby)
  // A written municipality beside the outline the point falls in is the border's error, not the
  // importer's.
  if (close && (!inside || close.uf === inside.uf)) return close
  if (inside) return inside
  // Off the coarse coast: the nearest municipality, if one is near.
  let best: Area | undefined
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
