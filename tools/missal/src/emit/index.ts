import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { MassFormulary, OfCalendarStatics, OrderOfMass } from '@ember/missal-schema'
import { massFormularySchema, ofCalendarStaticsSchema, orderOfMassSchema } from '@ember/missal-schema'

const groupDir: Record<string, string> = {
  tempore: 'tempore',
  sanctorale: 'sanctoral',
  common: 'common',
  ritual: 'ritual',
  votive: 'votive',
}

/** formulary id → relative file path under content/of/formularies/. */
function formularyPath(id: string): string {
  const parts = id.split('.')
  const dir = groupDir[parts[0]] ?? parts[0]
  return join('formularies', dir, ...parts.slice(1)) + '.json'
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  // Keys needn't be sorted: build-corpus hashes its own canonical form.
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

export interface EmitResult {
  formularies: number
  errors: Array<{ id: string; issue: string }>
}

export function emitCorpus(
  outDir: string,
  formularies: MassFormulary[],
  order: OrderOfMass,
  calendar: OfCalendarStatics,
): EmitResult {
  // Clean the formularies/order/calendar trees (idempotent rebuild).
  for (const sub of ['formularies', 'order', 'calendar']) {
    rmSync(join(outDir, sub), { recursive: true, force: true })
  }

  const errors: EmitResult['errors'] = []
  let written = 0

  for (const f of formularies) {
    const parsed = massFormularySchema.safeParse(f)
    if (!parsed.success) {
      errors.push({ id: f.id, issue: parsed.error.issues[0]?.message ?? 'invalid' })
      continue
    }
    writeJson(join(outDir, formularyPath(f.id)), parsed.data)
    written += 1
  }

  const orderParsed = orderOfMassSchema.safeParse(order)
  if (!orderParsed.success) errors.push({ id: 'order-of-mass', issue: orderParsed.error.issues[0]?.message ?? 'invalid' })
  else writeJson(join(outDir, 'order', 'order-of-mass.json'), orderParsed.data)

  const calParsed = ofCalendarStaticsSchema.safeParse(calendar)
  if (!calParsed.success) errors.push({ id: 'calendar', issue: calParsed.error.issues[0]?.message ?? 'invalid' })
  else {
    writeJson(join(outDir, 'calendar', 'temporal.json'), calParsed.data.temporal)
    writeJson(join(outDir, 'calendar', 'sanctoral.json'), calParsed.data.sanctoral)
  }

  writeJson(join(outDir, 'index.json'), {
    schemaVersion: 1,
    formularies: formularies.map((f) => f.id),
    counts: {
      formularies: written,
      eucharisticPrayers: order.eucharisticPrayers.length,
      temporal: calendar.temporal.length,
      sanctoral: calendar.sanctoral.length,
    },
  })

  return { formularies: written, errors }
}

/** Load every baseline mass dict keyed by id. */
// The General Roman Calendar's rank where the baseline carries a regional one:
// Hildegard is a feast in the German-speaking lands, an optional memorial in
// the universal calendar (CDW decree of 25 January 2021).
const universalRanks: Record<string, string> = { 'sanctorale.09-17.hildegard': 'optional-memorial' }

// Spain's propers the baseline (built on the Spanish missal) files among the
// universal saints; the id's region suffix is what scopes them. 6 November:
// the CDW inscribed Ss Pedro Poveda, Inocencio and companions in Spain's
// calendar (decree of 12 September 2014).
const spanishIds: Record<string, string> = { 'sanctorale.11-06': 'sanctorale.11-06.spain' }

/**
 * A date's other saints, which the baseline nests in its mass file's
 * `alternatives[]` (20 January: Fabian's file holds Sebastian), each as a
 * mass of its own, `<date id>.<key>`, on the same date. Another form of the
 * same celebration (`assumption-2`, `all-souls-form-3`) is not a celebration
 * of its own and stays out: the calendar would list it as a second feast.
 */
function alternativeCelebrations(d: Record<string, unknown> & { id: string }): (Record<string, unknown> & { id: string })[] {
  const alts = Array.isArray(d.alternatives) ? (d.alternatives as Record<string, unknown>[]) : []
  return alts
    .filter((a) => typeof a.key === 'string' && !/(^|-)\d+$/.test(a.key))
    .map((a) => {
      const id = `${d.id}.${a.key}`
      return { ...a, id, group: d.group, date: d.date, ...(universalRanks[id] ? { rank: universalRanks[id] } : {}) }
    })
}

export function loadBaselineMassDicts(baselineDataDir: string): Map<string, Record<string, unknown>> {
  const out = new Map<string, Record<string, unknown>>()
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
        const d = JSON.parse(readFileSync(p, 'utf-8')) as Record<string, unknown> & { id?: string }
        if (!d.id) continue
        d.id = spanishIds[d.id] ?? d.id
        out.set(d.id, d)
        for (const alt of alternativeCelebrations(d)) out.set(alt.id, alt)
      }
    }
  }
  walk(join(baselineDataDir, 'masses'))
  return out
}
