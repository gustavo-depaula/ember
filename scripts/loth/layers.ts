// Files what was observed into layers. Each layer names the coordinates it
// depends on; a day's part goes into each layer whose coordinates are enough
// to tell it, as far as every day observed can show.

import { type Field, type Layer, lookup, type OfficeKey, project } from '../../packages/loth/src/index-types'

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
// Where a day not yet met fits two layers that disagree, the later one is
// believed. The Sunday cycle and the year of the readings come first, then:
// with a handful of days to a saint they agree by chance more often than the
// weekday does.
const celebration: Field[][] = [
  ['C', 'g'],
  ['C', 'g', 'c'],
  ['C', 'g', 'y'],
  ['C', 'g', 's'],
  ['C', 'g', 'd'],
  ['C', 'g', 'p', 'd'],
  ['C', 'g', 's', 'p', 'd'],
  ['C', 'g', 's', 'w', 'd'],
  ['C', 'g', 'k', 'd'],
  ['C', 'g', 'd', 'y'],
  ['C', 'g', 'p', 'd', 'y'],
  ['C', 'g', 'k', 'd', 'y'],
  ['C', 'g', 's', 'w', 'd', 'p', 'c', 'y', 'k', 'a'],
]

interface Group {
  value: string
  pure: boolean
}

function groupsOf(observations: Observation[], fields: Field[]): Map<string, Group> {
  const groups = new Map<string, Group>()
  for (const o of observations) {
    const at = project(o.key, fields)
    const group = groups.get(at)
    if (!group) groups.set(at, { value: o.value, pure: true })
    else if (group.value !== o.value) group.pure = false
  }
  return groups
}

/**
 * Files each observation under every layer that is enough to tell its part
 * and needs nothing more: the ways of grouping days in which this day's group
 * is of one mind, less those that only add a coordinate to another. A day met
 * later that shares any of those groupings finds the part.
 */
function file(observations: Observation[], candidates: Field[][], below: Layer[]): Layer[] {
  const layers = candidates.map((fields) => ({ fields, entries: {} as Record<string, string> }))
  const groups = candidates.map((fields) => groupsOf(observations, fields))
  const within = (a: Field[], b: Field[]) => a.length < b.length && a.every((f) => b.includes(f))
  for (const o of observations) {
    // A celebration's day that reads as the season's does needs no entry.
    if (below.length > 0 && lookup(below, { ...o.key, C: '' }) === o.value) continue
    const enough = candidates
      .map((fields, i) => ({ fields, i }))
      .filter(({ fields, i }) => groups[i].get(project(o.key, fields))?.pure)
    if (enough.length === 0) throw new Error(`no layer tells ${JSON.stringify(o.key)} apart`)
    for (const { fields, i } of enough) {
      if (enough.some((other) => within(other.fields, fields))) continue
      layers[i].entries[project(o.key, fields)] = o.value
    }
  }
  return layers.filter((layer) => Object.keys(layer.entries).length > 0)
}

export function buildLayers(observations: Observation[], invitatory: boolean): Layer[] {
  const withPsalm = (fields: Field[][]) =>
    fields.map((f) => (invitatory ? [...f, 'v' as const] : f))
  // A season's layers are drawn from the days that keep the season; a
  // celebration's only from its own days, over the season's.
  const ofSeason = file(observations.filter((o) => !o.key.C), withPsalm(season), [])
  const ofCelebration = file(observations.filter((o) => o.key.C), withPsalm(celebration), ofSeason)
  return [...ofSeason, ...ofCelebration]
}
