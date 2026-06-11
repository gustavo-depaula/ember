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
  // ensureAscii=false equivalent — JSON.stringify keeps UTF-8; sorted-key not
  // required here (build-corpus hashes its own canonical form).
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
export function loadBaselineMassDicts(baselineDataDir: string): Map<string, Record<string, unknown>> {
  const out = new Map<string, Record<string, unknown>>()
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
        const d = JSON.parse(readFileSync(p, 'utf-8')) as { id?: string }
        if (d.id) out.set(d.id, d as Record<string, unknown>)
      }
    }
  }
  walk(join(baselineDataDir, 'masses'))
  return out
}
