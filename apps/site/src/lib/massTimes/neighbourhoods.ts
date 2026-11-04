// The neighbourhood a Brazilian church stands in, from the 2022 census's outlines
// (scripts/br-neighbourhoods.mjs): the bairros of the cities that have them, São Paulo's districts
// and Brasília's administrative regions. Undefined where the city has none, or the church stands
// outside all of them, as on a city's rural edge.
import data from './br-neighbourhoods.json'
import { contains, type Outline, outlineOf } from './outlines'

type Neighbourhood = Outline & { name: string }

const packed = data as Record<string, { name: string; rings: number[][] }[]>
const loaded = new Map<string, Neighbourhood[]>()

function inMunicipality(id: string) {
  let list = loaded.get(id)
  if (!list) {
    list = (packed[id] ?? []).map(({ name, rings }) => ({ name, ...outlineOf(rings) }))
    loaded.set(id, list)
  }
  return list
}

export function neighbourhoodAt(
  municipalityId: string,
  lat: number,
  lng: number,
): string | undefined {
  return inMunicipality(municipalityId).find((n) => contains(n, lng, lat))?.name
}
