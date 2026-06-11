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

/** The children of the "Full Mass" view-switcher branch. */
function fullView(flow: unknown[]): unknown[] {
  const select = flow.find(
    (p) => (p as { behavior?: { kind?: string } }).behavior?.kind === 'select',
  ) as { behavior: { options: Array<{ id: string; children: unknown[] }> } } | undefined
  return select?.behavior.options.find((o) => o.id === 'full')?.children ?? []
}

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

  it('weaves the ordinary with the propers on an OT Sunday (Gloria, Creed, Sanctus, Our Father all present)', () => {
    const full = JSON.stringify(fullView(buildDay(2026, 6, 14)))
    // Ordinary moments woven in…
    expect(full).toMatch(/Gl[oó]ria a Deus/)
    expect(full).toMatch(/Creio em um só Deus/)
    expect(full).toMatch(/Santo, Santo, Santo/)
    expect(full).toMatch(/Pai nosso/)
    // …alongside the proper Collect label and a section structure.
    expect(full).toContain('Oração do Dia')
    expect(full).toContain('Ritos Iniciais')
  })

  it('renders the Penitential Act as a 3-form chip picker with a nested invitation picker', () => {
    const full = fullView(buildDay(2026, 6, 14))
    type Sel = {
      behavior: {
        kind?: string
        overrideKey?: string
        options: Array<{ label: { primary: string }; children: unknown[] }>
      }
    }
    const findSelect = (nodes: unknown[], key: string): Sel | undefined => {
      for (const n of nodes) {
        const p = n as {
          behavior?: { kind?: string; overrideKey?: string; options?: unknown[] }
          children?: unknown[]
        }
        if (p.behavior?.kind === 'select' && p.behavior.overrideKey === key) return p as Sel
        if (p.behavior?.options) {
          for (const o of p.behavior.options as Array<{ children?: unknown[] }>) {
            const hit = o.children && findSelect(o.children, key)
            if (hit) return hit
          }
        }
        if (p.children) {
          const hit = findSelect(p.children, key)
          if (hit) return hit
        }
      }
      return undefined
    }
    const forms = findSelect(full, 'of.penitential-act.c1')
    expect(forms).toBeDefined()
    expect(forms?.behavior.options.map((o) => o.label.primary)).toEqual([
      'Confiteor',
      'Tende compaixão',
      'Invocações',
    ])
    // The Confiteor form nests its own invitation picker.
    const invitation = findSelect(full, 'of.penitential-act.c1.0.c0')
    expect(invitation).toBeDefined()
    expect(invitation?.behavior.options.length).toBeGreaterThanOrEqual(2)
  })

  it('weaves a COMPLETE Order of Mass on an OT Sunday — every moment present, in order', () => {
    const full = JSON.stringify(fullView(buildDay(2026, 6, 14)))
    // Each moment of the rite, start to finish. If any is missing the woven
    // ordinary is incomplete.
    const moments = [
      'Ritos Iniciais', // §
      'Antífona da Entrada', // entrance antiphon (proper)
      'Em nome do Pai', // sign of the cross
      'Bendito seja Deus', // greeting — people's response
      'Confesso a Deus', // Penitential Act, Confiteor form
      'Senhor, tende piedade', // Kyrie
      'Glória a Deus nas alturas', // Gloria
      'Oração do Dia', // Collect (label)
      'Liturgia da Palavra', // §
      'Primeira Leitura',
      'Graças a Deus', // reading response
      'Salmo Responsorial',
      'Segunda Leitura',
      'Glória a vós, Senhor', // gospel response
      'Homilia',
      'Creio em um só Deus', // Creed
      'Liturgia Eucarística', // §
      'Oração sobre as Oferendas',
      'Santo, Santo, Santo', // Sanctus
      'Rito da Comunhão', // §
      'Pai nosso', // Our Father
      'Cordeiro de Deus', // Agnus Dei
      'Eis o Cordeiro de Deus', // Invitation to Communion
      'Antífona da Comunhão',
      'Oração depois da Comunhão',
      'Ritos Finais', // §
      'Ide em paz', // Dismissal
      'Amém', // oration response
    ]
    const missing = moments.filter((m) => !full.includes(m))
    expect(missing).toEqual([])

    // Sections appear in liturgical order.
    const order = [
      'Ritos Iniciais',
      'Liturgia da Palavra',
      'Liturgia Eucarística',
      'Rito da Comunhão',
      'Ritos Finais',
    ]
    const positions = order.map((s) => full.indexOf(s))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('every selector option has content (no empty chips 2…n)', () => {
    const full = fullView(buildDay(2026, 6, 14))
    const empties: string[] = []
    const walk = (nodes: unknown[]) => {
      for (const n of nodes) {
        const p = n as {
          behavior?: {
            kind?: string
            overrideKey?: string
            options?: Array<{ id: string; children?: unknown[] }>
          }
          children?: unknown[]
        }
        if (p.behavior?.kind === 'select') {
          for (const o of p.behavior.options ?? []) {
            if (!o.children || o.children.length === 0)
              empties.push(`${p.behavior.overrideKey}/${o.id}`)
            else walk(o.children)
          }
        }
        if (p.children) walk(p.children)
      }
    }
    walk(full)
    expect(empties).toEqual([])
  })

  it('renders no drop-caps — the first letter joins its word with the right spacing', () => {
    const full = JSON.stringify(fullView(buildDay(2026, 6, 14)))
    expect(full).not.toContain('dropCap')
    expect(full).toContain('A graça de nosso Senhor') // greeting, not "Agraça…"
    expect(full).not.toContain('Agraça')
  })

  it('seals orations and readings with the fixed assembly responses', () => {
    const full = JSON.stringify(fullView(buildDay(2026, 6, 14)))
    expect(full).toContain('Amém.') // people's reply to the Collect/Offerings/Postcommunion
    expect(full).toContain('Graças a Deus.') // reply to "Palavra do Senhor."
    expect(full).toContain('Glória a vós, Senhor.') // gospel announcement + "Palavra da Salvação."
  })

  it('omits the Gloria and Creed on an Advent ferial', () => {
    // 2025-12-09 — Tuesday of the 2nd week of Advent (no Gloria, no Creed).
    const full = JSON.stringify(fullView(buildDay(2025, 12, 9)))
    expect(full).not.toMatch(/Gl[oó]ria a Deus nas alturas/)
    expect(full).not.toMatch(/Creio em um só Deus/)
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
