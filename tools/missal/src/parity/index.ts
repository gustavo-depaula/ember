import type { ParsedCorpus } from '../parse/types'
import { loadPatches } from '../patches'
import { type BaselineLang, loadBaselineMasses } from './baseline'
import { buildPools, buildReport, classifyMass, type ParityReport } from './classify'
import { loadProvenance } from './provenance'

export { baselineLangs, extractStrings, loadBaselineMasses } from './baseline'
export type { MassParity, MassStatus, ParityReport, StringBucket } from './classify'
export { buildPools, buildReport, classifyMass } from './classify'
export { loadProvenance, parseProvenanceValue } from './provenance'

/**
 * PR-1a gate: prove the TS parse stage extracts at least the text the old
 * (ember-extra) corpus carries, mass by mass, language by language.
 */
export function runParity(
  corpus: ParsedCorpus,
  baselineDataDir: string,
  opts: { langs?: BaselineLang[]; patchesDir?: string } = {},
): ParityReport {
  const patches = opts.patchesDir ? loadPatches(opts.patchesDir) : []
  const pools = buildPools(corpus, patches)
  const provenance = loadProvenance(baselineDataDir)
  const masses = loadBaselineMasses(baselineDataDir)
  const langs = opts.langs ? new Set(opts.langs) : undefined

  return buildReport(masses.map((m) => classifyMass(m, provenance.get(m.id), pools, langs)))
}
