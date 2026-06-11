import { massFormularySchema } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
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
