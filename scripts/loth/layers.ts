// Files what was observed into layers. Each layer names the coordinates it
// depends on; a day's part goes into each layer whose coordinates are enough
// to tell it, as far as every day observed can show.
//
// Which coordinates a part may depend on is not left to the data: with a
// handful of days to a saint, the data will find that his psalms follow the
// Sunday cycle. The lists below are the dependences the book itself has.

import { applies, type Field, type Layer, lookup, type OfficeKey, project } from '../../packages/loth/src/index-types'

export interface Observation {
  key: OfficeKey
  value: string
}

export interface Slot {
  hour: string
  slot: string
}

// The antiphon of the Gospel canticle follows the Sunday's Gospel, and so the
// three-year cycle; nothing else does.
const followsTheGospel = (slot: string) => slot.startsWith('canticle')

/**
 * The tiers of the book, from the general to the particular, and in each the
 * sets of coordinates a part may be filed under. Where a day not yet met fits
 * two layers that disagree, the later one is believed.
 */
function tiers({ hour, slot }: Slot): Tier[] {
  const cycle = followsTheGospel(slot)
  // The Office of Readings has a two-year cycle of its own, for the first
  // reading and what answers it.
  const biennial = hour === 'readings' && /^(reading-1|responsory-1|verse)/.test(slot)
  // A year of the readings is filed straight after the layer it divides, so
  // that it never outweighs a later, more particular one: 11 January fell on
  // a Saturday in every year I of 2020-2040, and "a weekday of 11 January in
  // year I" must not answer for the Friday that the date and weekday tell.
  const byYear = (fields: Field[]): Field[][] => (biennial ? [fields, [...fields, 'y']] : [fields])
  const ofSeason: Field[][] = [
    [],
    ['p', 'd', 'g'],
    ['s'],
    ['s', 'd', 'g'],
    ['s', 'p', 'd', 'g'],
    ...byYear(['s', 'w', 'd', 'g']),
    ...(cycle ? ([['s', 'w', 'd', 'g', 'c']] as Field[][]) : []),
    // Advent's third week is by the week until the 17th comes.
    ['s', 'w', 'd', 'g', 'k'],
    ...(cycle ? ([['s', 'w', 'd', 'g', 'k', 'c']] as Field[][]) : []),
    // From 17 December the days go by date, and a date's weekday is like any
    // other but for the Sunday.
    ['s', 'k', 'g'],
    ...byYear(['s', 'k', 'D', 'g']),
    ...byYear(['s', 'k', 'd', 'g']),
    ...(cycle ? ([['s', 'k', 'd', 'g', 'c']] as Field[][]) : []),
    ...(hour === 'compline' ? ([['p', 'd', 'g', 'a'], ['s', 'p', 'd', 'g', 'a']] as Field[][]) : []),
  ]
  // What a rank brings whatever the celebration: Night Prayer of a solemnity
  // is Sunday's, a feast's little hours take the complementary psalms.
  const ofRank: Field[][] = [
    ['r', 'g'],
    ['r', 'g', 'D'],
    ['r', 'g', 'd'],
    ['r', 'g', 's'],
    ['r', 'g', 's', 'D'],
    ['r', 'g', 's', 'd'],
    // Of the weekday's two hymns a memorial's little hour prints one, and
    // Night Prayer of a solemnity keeps the hymn of its day: the hymn goes by
    // the day of the psalter whatever the celebration.
    ...(slot === 'hymn'
      ? ([['r', 'g', 'p'], ['r', 'g', 's', 'p'], ['r', 'g', 'p', 'd'], ['r', 'g', 's', 'p', 'd']] as Field[][])
      : []),
  ]
  const ofCommon: Field[][] = [
    ['K', 'g'],
    ['K', 'g', 's'],
  ]
  // The Sunday cycle and the year of the readings come first: with a handful
  // of days to a saint they agree by chance more often than the season does.
  const ofCelebration: Field[][] = [
    ['C', 'g'],
    ...(cycle ? ([['C', 'g', 'c']] as Field[][]) : []),
    ...(biennial ? ([['C', 'g', 'y']] as Field[][]) : []),
    ['C', 'g', 'D'],
    ['C', 'g', 'd'],
    ['C', 'g', 's'],
    ['C', 'g', 's', 'D'],
    ['C', 'g', 's', 'd'],
    ...(biennial ? ([['C', 'g', 's', 'y']] as Field[][]) : []),
    // Saint Mary on Saturday takes her texts in turn, by the week.
    ['C', 'g', 'p'],
    ['C', 'g', 'w'],
  ]
  const withPsalm = (fields: Field[][]) =>
    hour === 'invitatory' ? fields.map((f) => [...f, 'v' as const]) : fields
  return [
    { candidates: withPsalm(ofSeason), rule: 'all' },
    // A rank or a Common gives what most of its celebrations have; the few
    // with something of their own say so in the tier above.
    { candidates: withPsalm(ofRank), rule: 'most' },
    { candidates: withPsalm(ofCommon), rule: 'most' },
    { candidates: withPsalm(ofCelebration), rule: 'all', allows: aSaintsOwn },
  ]
}

/**
 * What a saint's own part may go by. A day of the temporal cycle is a day of
 * its week, with the Sunday's Gospel and the year's readings; a saint has one
 * office wherever his date falls, altered only by the season (Easter's
 * "Aleluia") and by falling on a Sunday. Saint Mary on Saturday alone takes
 * her texts in turn, by the week.
 */
function aSaintsOwn(fields: Field[], key: OfficeKey): boolean {
  if (!key.C.startsWith('sanctorale.')) return true
  const inTurn = key.C === 'sanctorale.saint-mary-on-saturday'
  return fields.every((f) => 'CgsDv'.includes(f) || (inTurn && (f === 'p' || f === 'w')))
}

interface Tier {
  candidates: Field[][]
  // Whether a group must be of one mind, or most of its celebrations enough.
  rule: 'all' | 'most'
  // The layers of the tier a day's part may be filed under at all.
  allows?: (fields: Field[], key: OfficeKey) => boolean
}

// Every coordinate: where no layer above tells a day's part, it is filed here
// so the year it was observed in still reads right, and counted, because no
// later year will find it.
const everything: Field[] = ['s', 'w', 'd', 'D', 'p', 'c', 'y', 'k', 'g', 'a', 'v', 'r', 'K', 'C']

// What a group of days agrees on: the one part they all have, or the part
// most of their celebrations have.
function agreed(observations: Observation[], fields: Field[], rule: Tier['rule']): Map<string, string | undefined> {
  const groups = new Map<string, Map<string, Set<string>>>()
  for (const o of observations) {
    const at = project(o.key, fields)
    const values = groups.get(at) ?? new Map<string, Set<string>>()
    groups.set(at, values)
    const who = values.get(o.value) ?? new Set<string>()
    values.set(o.value, who)
    who.add(o.key.C)
  }
  const out = new Map<string, string | undefined>()
  for (const [at, values] of groups) {
    if (rule === 'all') {
      out.set(at, values.size === 1 ? [...values.keys()][0] : undefined)
      continue
    }
    // Most celebrations have the one part, each of them always; the rest
    // never have it, having something of their own. A celebration with now
    // one and now another is following something else (its weekday), and
    // then the group says nothing.
    const celebrations = new Set([...values.values()].flatMap((who) => [...who])).size
    const [value, who] = [...values].sort((a, b) => b[1].size - a[1].size)[0]
    const steady = [...values].every(([other, others]) => other === value || [...others].every((c) => !who.has(c)))
    // And one celebration is no rule: what only it has is its own.
    out.set(at, steady && who.size >= 2 && who.size * 2 > celebrations ? value : undefined)
  }
  return out
}

/**
 * Files each observation the layers below do not already give under every
 * layer of this tier that is enough to tell its part and needs nothing more:
 * the ways of grouping days in which this day's group agrees on its part,
 * less those that only add a coordinate to another. Returns what no layer told.
 */
function file(
  observations: Observation[],
  { candidates, rule, allows = () => true }: Tier,
  below: Layer[],
): { layers: Layer[]; untold: Observation[] } {
  const layers = candidates.map((fields) => ({ fields, entries: {} as Record<string, string> }))
  const groups = candidates.map((fields) => agreed(observations, fields, rule))
  // `D` is what is left of `d` when only Sunday matters.
  const has = (b: Field[], f: Field) => b.includes(f) || (f === 'D' && b.includes('d'))
  const within = (a: Field[], b: Field[]) =>
    a.every((f) => has(b, f)) && (a.length < b.length || (a.includes('D') && !b.includes('D')))
  const untold: Observation[] = []
  for (const o of observations) {
    if (lookup(below, o.key) === o.value) continue
    const enough = candidates
      .map((fields, i) => ({ fields, i }))
      .filter(({ fields }) => applies({ fields, entries: {} }, o.key) && allows(fields, o.key))
      .filter(({ fields, i }) => groups[i].get(project(o.key, fields)) === o.value)
    if (enough.length === 0) {
      untold.push(o)
      continue
    }
    for (const { fields, i } of enough) {
      if (enough.some((other) => within(other.fields, fields))) continue
      layers[i].entries[project(o.key, fields)] = o.value
    }
  }
  return { layers: layers.filter((layer) => Object.keys(layer.entries).length > 0), untold }
}

// Set by the importer, which holds the parts' text.
export let diffUntold: ((slot: Slot, o: Observation, below: string | undefined) => void) | undefined
export const setDiffUntold = (f: typeof diffUntold) => {
  diffUntold = f
}

// For working out which dependence the lists above lack.
function explainUntold(untold: Observation[], all: Observation[], { hour, slot }: Slot) {
  const tries: Field[][] = [
    ['C', 'g', 'p'], ['C', 'g', 'w'], ['C', 'g', 'p', 'd'], ['C', 'g', 's', 'p', 'd'], ['C', 'g', 's', 'w', 'd'],
    ['C', 'g', 'k', 'd'], ['C', 'g', 'c'], ['C', 'g', 'y'], ['C', 'g', 'd', 'y'], ['C', 'g', 's', 'w'],
    ['s', 'w', 'd', 'g', 'c'], ['s', 'w', 'd', 'g', 'y'], ['s', 'p', 'd', 'g', 'c'], ['s', 'w', 'd', 'g', 'k', 'c'], ['s', 'w', 'd', 'p', 'g'],
  ]
  const tally = new Map<string, number>()
  const sample = new Map<string, string>()
  for (const o of untold) {
    const pool = all.filter((x) => Boolean(x.key.C) === Boolean(o.key.C))
    const fits = tries
      .filter((fields) => fields.includes('C') === Boolean(o.key.C))
      .filter((fields) => pool.every((x) => project(x.key, fields) !== project(o.key, fields) || x.value === o.value))
      .map((f) => f.join(''))
    const name = `${o.key.C || `${o.key.s}`} <- ${fits.slice(0, 4).join(',') || 'NOTHING'}`
    tally.set(name, (tally.get(name) ?? 0) + 1)
    sample.set(name, JSON.stringify(o.key))
  }
  console.log(`  UNTOLD ${hour} ${slot}:`)
  for (const [name, n] of [...tally].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`     ${n} ${name}   e.g. ${sample.get(name)}`)
}

export function buildLayers(
  observations: Observation[],
  slot: Slot,
): { layers: Layer[]; untold: number } {
  const [ofSeason, ...ofCelebrations] = tiers(slot)
  const kept = observations.filter((o) => o.key.C)
  const season = file(observations.filter((o) => !o.key.C), ofSeason, [])
  let layers = season.layers
  let untold = season.untold
  for (const [i, candidates] of ofCelebrations.entries()) {
    const tier = file(kept, candidates, layers)
    layers = [...layers, ...tier.layers]
    // Only what the last tier leaves is left.
    if (i === ofCelebrations.length - 1) untold = [...untold, ...tier.untold]
  }
  if (untold.length === 0) return { layers, untold: 0 }
  if (process.env.LOTH_UNTOLD) explainUntold(untold, observations, slot)
  if (process.env.LOTH_UNTOLD && diffUntold) {
    for (const o of untold.filter((u) => u.key.C).slice(0, Number(process.env.LOTH_UNTOLD)))
      diffUntold(slot, o, lookup(layers, o.key))
  }
  // A day without a celebration cannot be found under a celebration's coordinates.
  const plain = everything.filter((f) => !'rKC'.includes(f))
  const lastOfSeason: Layer = { fields: plain, entries: {} }
  const last: Layer = { fields: everything, entries: {} }
  for (const o of untold) {
    if (o.key.C) last.entries[project(o.key, everything)] = o.value
    else lastOfSeason.entries[project(o.key, plain)] = o.value
  }
  const filled = (layer: Layer) => Object.keys(layer.entries).length > 0
  return {
    layers: [...season.layers, ...[lastOfSeason].filter(filled), ...layers.slice(season.layers.length), ...[last].filter(filled)],
    untold: untold.length,
  }
}
