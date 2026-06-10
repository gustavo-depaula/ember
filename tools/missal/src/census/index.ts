import type { Lang, MassFormulary, Structure } from '@ember/missal-schema'
import { structures } from '@ember/missal-schema'

export interface CensusReport {
  total: number
  byStructure: Record<string, number>
  byKind: Record<string, number>
  chipCollisions: Array<{ key: string; ids: string[]; title: string }>
  withReadings: number
  withPrefaces: number
  inheritedOrations: number
}

/**
 * The census is the data↔renderer contract: every formulary is classified
 * against the known structure enum, and same-day sibling celebrations must
 * have distinct display titles (else the picker shows duplicate chips).
 */
export function runCensus(formularies: MassFormulary[]): CensusReport {
  const byStructure: Record<string, number> = Object.fromEntries(structures.map((s) => [s, 0]))
  const byKind: Record<string, number> = {}
  let withReadings = 0
  let withPrefaces = 0
  let inheritedOrations = 0

  // Group sanctoral celebrations by (date, scope) to check chip-uniqueness.
  const sameDay = new Map<string, MassFormulary[]>()

  for (const f of formularies) {
    byStructure[f.structure] = (byStructure[f.structure] ?? 0) + 1
    byKind[f.kind] = (byKind[f.kind] ?? 0) + 1
    if (f.readings) withReadings += 1
    if (f.prefaces) withPrefaces += 1
    if (f.inheritsOrationsFrom) inheritedOrations += 1

    if (f.kind === 'sanctoral') {
      const m = /sanctorale\.(\d{2}-\d{2})/.exec(f.id)
      if (m) {
        const key = `${m[1]}|${f.scope}`
        const arr = sameDay.get(key) ?? []
        arr.push(f)
        sameDay.set(key, arr)
      }
    }
  }

  const chipCollisions: CensusReport['chipCollisions'] = []
  const displayLangs: Lang[] = ['pt-BR', 'en-US', 'la']
  for (const [key, group] of sameDay) {
    if (group.length < 2) continue
    const seen = new Map<string, string[]>()
    for (const f of group) {
      const title = displayLangs.map((l) => f.title[l] ?? '').join('|')
      const ids = seen.get(title) ?? []
      ids.push(f.id)
      seen.set(title, ids)
    }
    for (const [title, ids] of seen) {
      if (ids.length > 1) chipCollisions.push({ key, ids, title })
    }
  }

  return {
    total: formularies.length,
    byStructure,
    byKind,
    chipCollisions,
    withReadings,
    withPrefaces,
    inheritedOrations,
  }
}

export function formatCensus(r: CensusReport): string {
  const struct = (Object.entries(r.byStructure) as Array<[Structure, number]>)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${s}=${n}`)
    .join(' ')
  const kind = Object.entries(r.byKind).map(([k, n]) => `${k}=${n}`).join(' ')
  return [
    `Formularies: ${r.total}`,
    `  kinds:      ${kind}`,
    `  structures: ${struct}`,
    `  readings=${r.withReadings} prefaces=${r.withPrefaces} inherited-orations=${r.inheritedOrations}`,
    `  chip collisions: ${r.chipCollisions.length}`,
  ].join('\n')
}
