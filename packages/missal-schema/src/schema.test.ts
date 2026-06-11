import { describe, expect, it } from 'vitest'
import { massFormularySchema } from './formulary'
import { eucharisticPrayerSchema } from './order'
import { richTextSchema } from './richtext'

const richText = {
  lines: {
    'pt-BR': [[{ type: 'text', text: 'A vós, meu Deus, elevo a minha alma.' }]],
    la: [[{ type: 'text', text: 'Ad te levávi ánimam meam.' }]],
  },
  citation: { 'pt-BR': 'Sl 24, 1-3' },
}

describe('richTextSchema', () => {
  it('accepts lines + citation', () => {
    expect(richTextSchema.safeParse(richText).success).toBe(true)
  })

  it('rejects a plain field (lines-only contract)', () => {
    const parsed = richTextSchema.safeParse({ ...richText, plain: { 'pt-BR': 'x' } })
    // Unknown keys are stripped by default — assert they don't survive.
    expect(parsed.success).toBe(true)
    if (parsed.success) expect('plain' in parsed.data).toBe(false)
  })
})

describe('massFormularySchema', () => {
  it('accepts a minimal temporal formulary', () => {
    const result = massFormularySchema.safeParse({
      id: 'tempore.advent.week-1.sunday',
      kind: 'temporal',
      scope: 'universal',
      structure: 'mass',
      title: { 'pt-BR': 'Primeiro Domingo do Advento', la: 'Dominica I Adventus' },
      season: 'advent',
      color: 'violet',
      rank: 'sunday',
      cycleScheme: 'sunday',
      includeGloria: false,
      entranceAntiphon: { options: [{ body: richText }] },
      collect: { options: [{ body: richText }] },
    })
    expect(result.success).toBe(true)
  })

  it('accepts an OT ferial with inherited orations', () => {
    const result = massFormularySchema.safeParse({
      id: 'tempore.ordinary-time.week-10.tuesday',
      kind: 'temporal',
      scope: 'universal',
      structure: 'mass',
      title: { 'pt-BR': 'Terça-feira da 10ª Semana do Tempo Comum' },
      season: 'ordinary-time',
      cycleScheme: 'weekday',
      includeGloria: false,
      inheritsOrationsFrom: 'tempore.ordinary-time.week-10.sunday',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown structure (census contract)', () => {
    const result = massFormularySchema.safeParse({
      id: 'x',
      kind: 'temporal',
      scope: 'universal',
      structure: 'rogation-procession',
      title: { 'pt-BR': 'X' },
      cycleScheme: 'fixed',
      includeGloria: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('eucharisticPrayerSchema', () => {
  it('models the intrinsic preface (EP IV)', () => {
    const result = eucharisticPrayerSchema.safeParse({
      id: 'order.eucharistic-prayer.iv',
      label: { 'pt-BR': 'Oração Eucarística IV' },
      preface: richText,
      body: richText,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.preface).toBeDefined()
  })
})
