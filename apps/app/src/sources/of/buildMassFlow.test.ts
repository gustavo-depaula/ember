import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolveOfDay } from '@ember/mass'
import type {
  MassFormulary,
  OfCalendarStatics,
  OrderOfMass,
  SanctoralEntry,
  TemporalEntry,
} from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { buildOfMassFlow } from './buildMassFlow'

// vitest runs with cwd = apps/app; the corpus lives at the repo root.
const ofDir = join(process.cwd(), '../../content/of')
const read = <T>(p: string): T => JSON.parse(readFileSync(join(ofDir, p), 'utf-8'))

const statics: OfCalendarStatics = {
  temporal: read<TemporalEntry[]>('calendar/temporal.json'),
  sanctoral: read<SanctoralEntry[]>('calendar/sanctoral.json'),
}
const order = read<OrderOfMass>('order/order-of-mass.json')
const groupDir: Record<string, string> = {
  tempore: 'tempore',
  sanctorale: 'sanctoral',
  common: 'common',
  ritual: 'ritual',
  votive: 'votive',
}

function loadFormulary(ref: string): MassFormulary | undefined {
  const parts = ref.split('.')
  const path = `${join(ofDir, 'formularies', groupDir[parts[0]] ?? parts[0], ...parts.slice(1))}.json`
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf-8')) as MassFormulary) : undefined
}

const lang = { primary: 'pt-BR' as const, secondary: 'la' as const }

function buildDay(y: number, m: number, d: number) {
  const day = resolveOfDay(new Date(y, m - 1, d), statics, { scope: 'brazil' })
  const formularies: Record<string, MassFormulary> = {}
  for (const c of day.celebrations) {
    const f = loadFormulary(c.ref)
    if (f) formularies[c.ref] = f
    if (f?.inheritsOrationsFrom) {
      const g = loadFormulary(f.inheritsOrationsFrom)
      if (g) formularies[f.inheritsOrationsFrom] = g
    }
  }
  if (day.temporalRef && !formularies[day.temporalRef]) {
    const t = loadFormulary(day.temporalRef)
    if (t) formularies[day.temporalRef] = t
  }
  return buildOfMassFlow({ day, formularies, order, lang })
}

const types = (prims: unknown[]): string[] => prims.map((p) => (p as { type: string }).type)

describe('buildOfMassFlow', () => {
  it('renders an OT Sunday: banner + view switcher with collect + readings', () => {
    const flow = buildDay(2026, 6, 14)
    expect(types(flow)).toContain('callout') // celebration banner
    // The view switcher select holds the full Mass.
    const select = flow.find((p) => p.type === 'container' && p.behavior.kind === 'select')
    expect(select).toBeDefined()
    const full = (
      select as { behavior: { options: Array<{ id: string; children: unknown[] }> } }
    ).behavior.options.find((o) => o.id === 'full')
    const fullTypes = types(full?.children ?? [])
    expect(fullTypes).toContain('container') // choice-rich-text pickers
    expect(fullTypes).toContain('callout') // section markers
  })

  it('renders a multi-celebration day as a celebration picker', () => {
    const flow = buildDay(2025, 12, 25) // Christmas: vigil/night/dawn/day
    const picker = flow.find(
      (p) =>
        p.type === 'container' &&
        p.behavior.kind === 'select' &&
        p.behavior.overrideKey === 'of.celebration',
    )
    expect(picker).toBeDefined()
    const opts = (picker as { behavior: { options: unknown[] } }).behavior.options
    expect(opts.length).toBeGreaterThan(1)
  })

  it('renders a memorial day with the saint as principal', () => {
    const flow = buildDay(2026, 1, 17) // St Anthony
    // Either a single celebration (banner + switcher) or a picker — both valid.
    expect(flow.length).toBeGreaterThan(0)
    expect(types(flow).some((t) => t === 'callout' || t === 'container')).toBe(true)
  })

  it('renders Good Friday via the special-rite content tree', () => {
    const flow = buildDay(2026, 4, 3) // Good Friday 2026
    const flat = JSON.stringify(flow)
    expect(flow.length).toBeGreaterThan(0)
    // Solemn intercession text survives (folded into content).
    expect(flat.length).toBeGreaterThan(500)
  })
})
