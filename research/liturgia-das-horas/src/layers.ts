// Files what was observed into layers. Each layer names the coordinates it
// depends on; an entry goes into the most general layer in which every day
// that shares those coordinates has the same part, and only where the layers
// before it do not already give it.

import { type Field, type Layer, lookup, type OfficeKey, project } from '../../../packages/loth/src/index-types'

export interface Observation {
  key: OfficeKey
  value: string
}

const season: Field[][] = [
  [],
  ['p', 'd', 'g'],
  ['s'],
  ['s', 'd', 'g'],
  ['s', 'p', 'd', 'g'],
  ['s', 'w', 'd', 'g'],
  ['s', 'w', 'd', 'g', 'c'],
  ['s', 'k', 'g'],
  ['s', 'k', 'd', 'g'],
  ['s', 'w', 'd', 'g', 'k'],
  ['s', 'w', 'd', 'g', 'k', 'c'],
  ['p', 'd', 'g', 'a'],
  ['s', 'p', 'd', 'g', 'y'],
  ['s', 'w', 'd', 'g', 'y'],
  ['s', 'w', 'd', 'g', 'k', 'y'],
  ['s', 'w', 'd', 'p', 'c', 'y', 'k', 'g', 'a'],
]
const celebration: Field[][] = [
  ['C', 'g'],
  ['C', 'g', 's'],
  ['C', 'g', 'd'],
  ['C', 'g', 'c'],
  ['C', 'g', 'y'],
  ['C', 'g', 'p', 'd'],
  ['C', 'g', 's', 'p', 'd'],
  ['C', 'g', 's', 'w', 'd'],
  ['C', 'g', 'k', 'd'],
  ['C', 'g', 's', 'w', 'd', 'p', 'c', 'y', 'k', 'a'],
]

export const layerFields = (invitatory: boolean): Field[][] =>
  [...season, ...celebration].map((fields) => (invitatory ? [...fields, 'v' as const] : fields))

export function buildLayers(observations: Observation[], invitatory: boolean): Layer[] {
  const layers: Layer[] = []
  for (const fields of layerFields(invitatory)) {
    const ofCelebration = fields.includes('C')
    const groups = new Map<string, Observation[]>()
    for (const o of observations) {
      // A season's layer is drawn from the days that keep the season; a
      // celebration's only from its own days.
      if (ofCelebration !== Boolean(o.key.C)) continue
      const at = project(o.key, fields)
      const group = groups.get(at)
      if (group) group.push(o)
      else groups.set(at, [o])
    }
    const layer: Layer = { fields, entries: {} }
    for (const [at, group] of groups) {
      const value = group[0].value
      if (!group.every((o) => o.value === value)) continue
      if (group.every((o) => lookup(layers, o.key) === value)) continue
      layer.entries[at] = value
    }
    if (Object.keys(layer.entries).length > 0) layers.push(layer)
  }
  return layers
}
