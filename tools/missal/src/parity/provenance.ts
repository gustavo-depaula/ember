import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface ProvenanceRef {
  massId: string
  category: string
  /** Canonical basename matching the parse stage (e.g. "tiempos_advnav"). */
  basename: string
  anchor?: string
}

// e.g. "misal_v2/m_<lang>/tiempos/m_<lang>_tiempos_advnav.html#A010"
const provenanceRe = /^misal_v2\/m_<lang>\/([^/]+)\/m_<lang>_(.+?)\.html(?:#(.+))?$/

export function parseProvenanceValue(massId: string, value: string): ProvenanceRef | undefined {
  const m = provenanceRe.exec(value)
  if (!m) return undefined
  return { massId, category: m[1], basename: m[2], anchor: m[3] }
}

/** Load the old corpus' provenance.json → massId → upstream location. */
export function loadProvenance(baselineDataDir: string): Map<string, ProvenanceRef> {
  const raw = JSON.parse(readFileSync(join(baselineDataDir, 'provenance.json'), 'utf-8')) as Record<
    string,
    string
  >
  const out = new Map<string, ProvenanceRef>()
  for (const [massId, value] of Object.entries(raw)) {
    const ref = parseProvenanceValue(massId, value)
    if (ref) out.set(massId, ref)
  }
  return out
}
