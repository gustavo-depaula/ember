import { describe, expect, it } from 'vitest'
import { flow, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { resolveFlow } from '../../../engine'

describe('resolveFlow — repeat from', () => {
  it('iterates entries from flowData with template substitution', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: 'items',
          sections: [{ type: 'heading', text: { 'pt-BR': '{{name}}' } }],
        }),
        makeContext({
          flowData: { items: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }] },
        }),
        makeEngineContext(),
      ),
    ).toEqual([
      { type: 'heading', text: { primary: 'First' } },
      { type: 'heading', text: { primary: 'Second' } },
      { type: 'heading', text: { primary: 'Third' } },
    ])
  })

  it('limits by count when both count and from are present', () => {
    const result = resolveFlow(
      flow({
        type: 'repeat',
        count: 3,
        from: 'items',
        sections: [{ type: 'rubric', text: { 'pt-BR': '{{name}}' } }],
      }),
      makeContext({
        flowData: {
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }],
        },
      }),
      makeEngineContext(),
    )
    expect(result).toHaveLength(3)
  })

  it('provides index and ordinal template vars', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: 'items',
          sections: [{ type: 'heading', text: { 'pt-BR': '{{ordinal}}: {{name}} ({{index}})' } }],
        }),
        makeContext({ flowData: { items: [{ name: 'A' }, { name: 'B' }] } }),
        makeEngineContext(),
      ),
    ).toEqual([
      { type: 'heading', text: { primary: 'Primeiro: A (0)' } },
      { type: 'heading', text: { primary: 'Segundo: B (1)' } },
    ])
  })

  it('template-substitutes the from field before lookup', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: '{{mysteries}}',
          sections: [{ type: 'heading', text: { 'pt-BR': '{{name}}' } }],
        }),
        makeContext({
          templateVars: { mysteries: 'joyful' },
          flowData: { joyful: [{ name: { 'pt-BR': 'Annunciation' } }] },
        }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Annunciation' } }])
  })

  it('localizes LocalizedText entries', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: 'items',
          sections: [{ type: 'heading', text: { 'pt-BR': '{{name}}' } }],
        }),
        makeContext({
          flowData: { items: [{ name: { 'en-US': 'English', 'pt-BR': 'Português' } }] },
        }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Português' } }])
  })

  it('returns empty when from references missing data', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: 'nonexistent',
          sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
        }),
        makeContext({ flowData: {} }),
        makeEngineContext(),
      ),
    ).toEqual([])
  })
})

// --- options from ---

describe('resolveFlow — repeat.from with dotted path', () => {
  it('iterates an array reachable via path through flowData', () => {
    const result = resolveFlow(
      flow({
        type: 'repeat',
        from: 'day.intercessions',
        sections: [{ type: 'rubric', text: { 'pt-BR': '{{ordinal}} - {{title}}' } }],
      }),
      makeContext({
        flowData: {
          day: {
            intercessions: [{ title: 'Pro Ecclesia' }, { title: 'Pro Pontifice' }],
          },
        },
      }),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'rubric', label: { primary: 'Primeiro - Pro Ecclesia' } },
      { type: 'rubric', label: { primary: 'Segundo - Pro Pontifice' } },
    ])
  })

  it('returns empty when the path resolves to a non-array', () => {
    const result = resolveFlow(
      flow({
        type: 'repeat',
        from: 'day.notAnArray',
        sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
      }),
      makeContext({ flowData: { day: { notAnArray: 'oops' } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })
})
