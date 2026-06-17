import type { MassFormulary } from '@ember/missal-schema'
import { massFormularySchema } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { buildCalendarStatics } from '../src/enrich/calendar'
import { buildFormulary } from '../src/enrich/formulary'

const emptyLib = new Map()

const baselineMass = {
  id: 'tempore.advent.week-1.sunday',
  group: 'tempore',
  season: 'advent',
  weekIndex: 1,
  weekday: 'sunday',
  liturgicalColor: 'violet',
  title: { la: 'DOMINICA I ADVENTUS', en: 'Advent Season 1st Week: Sunday', 'pt-BR': 'Primeiro Domingo do Advento' },
  entranceAntiphon: {
    body: {
      plain: { 'pt-BR': 'A vós, meu Deus, elevo a minha alma.' },
      lines: { 'pt-BR': [[{ type: 'text', text: 'A vós, meu Deus, elevo a minha alma.' }]] },
    },
    citation: { 'pt-BR': 'Sl 24, 1-3' },
  },
  collect: { body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Deus todo-poderoso.' }]] } } },
  readings: {
    A: { firstReading: { citation: { 'pt-BR': 'Is 2, 1-5' }, body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Leitura.' }]] } } } },
  },
}

describe('buildFormulary', () => {
  it('transforms a baseline Sunday mass into the new schema', () => {
    const f = buildFormulary(baselineMass, emptyLib, [])
    expect(f).toBeDefined()
    const parsed = massFormularySchema.safeParse(f)
    expect(parsed.success).toBe(true)

    // en → en-US, title prettified (season prefix stripped)
    expect(f!.title['en-US']).toBe('1st Week: Sunday')
    expect(f!.title['pt-BR']).toBe('Primeiro Domingo do Advento')
    // structure + cycle + gloria
    expect(f!.structure).toBe('mass')
    expect(f!.cycleScheme).toBe('sunday')
    expect(f!.includeGloria).toBe(false) // Advent
    // antiphon → options[], citation inlined on the RichText, plain dropped
    expect(f!.entranceAntiphon!.options).toHaveLength(1)
    expect(f!.entranceAntiphon!.options[0].body.citation?.['pt-BR']).toBe('Sl 24, 1-3')
    expect('plain' in f!.entranceAntiphon!.options[0].body).toBe(false)
  })

  it('marks OT ferials as inheriting orations from their Sunday', () => {
    const ferial = {
      id: 'tempore.ordinary-time.week-10.tuesday',
      group: 'tempore',
      season: 'ordinary-time',
      weekday: 'tuesday',
      title: { 'pt-BR': 'Terça-feira da 10ª Semana do Tempo Comum' },
      readings: { I: { gospel: { body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Ev.' }]] } } } } },
    }
    const f = buildFormulary(ferial, emptyLib, [])
    expect(f!.inheritsOrationsFrom).toBe('tempore.ordinary-time.week-10.sunday')
    expect(f!.collect).toBeUndefined()
    expect(f!.cycleScheme).toBe('weekday')
  })

  it('maps the solemnity season to ordinary-time', () => {
    const f = buildFormulary(
      { id: 'tempore.solemnity.christ-the-king', group: 'tempore', season: 'solemnity', title: { 'pt-BR': 'Cristo Rei' } },
      emptyLib,
      [],
    )
    expect(f!.season).toBe('ordinary-time')
    expect(f!.rank).toBe('solemnity')
    expect(f!.includeGloria).toBe(true)
  })
})

describe('buildCalendarStatics', () => {
  // Minimal fixture — buildCalendarStatics only reads id/kind/rank/scope/title/color/structure.
  const sanctoral = (id: string, title = { 'pt-BR': id }): MassFormulary =>
    ({ id, kind: 'sanctoral', scope: 'universal', rank: 'memorial', color: 'white', title } as unknown as MassFormulary)

  it('dates the movable sanctoral memorials Easter-relative (keyed by their real ids)', () => {
    // The two movable memorials carry no fixed date upstream and don't have an
    // MM-DD their id-parse can recover — they rely solely on the easter-relative
    // table. A stale/mis-keyed table silently drops them (the Immaculate Heart bug).
    const { sanctoral: out } = buildCalendarStatics(
      [sanctoral('sanctorale.movable.05-32'), sanctoral('sanctorale.movable.05-35')],
      new Map(),
    )
    const byRef = new Map(out.map((e) => [e.formularyRef, e]))
    expect(byRef.get('sanctorale.movable.05-32')?.dateRule).toEqual({ type: 'easter-relative', offsetDays: 69 })
    expect(byRef.get('sanctorale.movable.05-35')?.dateRule).toEqual({ type: 'easter-relative', offsetDays: 50 })
  })

  it('keeps fixed sanctoral entries dated from their id MM-DD', () => {
    const { sanctoral: out } = buildCalendarStatics([sanctoral('sanctorale.01-02')], new Map())
    expect(out[0]?.dateRule).toEqual({ type: 'fixed', month: 1, day: 2 })
  })
})
