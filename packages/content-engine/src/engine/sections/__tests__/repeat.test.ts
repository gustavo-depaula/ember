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

  // The app can run its interface in one language and its prayers in another;
  // a heading must not take its template from one and its values from the other.
  it('fills each language of a template with that language’s values', () => {
    expect(
      resolveFlow(
        flow({
          type: 'repeat',
          from: 'mysteries',
          sections: [
            {
              type: 'heading',
              text: {
                'en-US': '{{ordinal}} Mystery: {{name}}',
                'pt-BR': '{{ordinal}} Mistério: {{name}}',
              },
            },
            { type: 'meditation', text: '{{meditation}}' },
          ],
        }),
        makeContext({
          flowData: {
            mysteries: [
              {
                name: { 'en-US': 'The Agony in the Garden', 'pt-BR': 'A Agonia no Horto' },
                meditation: { 'en-US': 'Jesus prays.', 'pt-BR': 'Jesus ora.' },
              },
            ],
          },
        }),
        {
          ...makeEngineContext(),
          language: 'pt-BR',
          contentLanguage: 'en-US',
          localize: (text) =>
            typeof text === 'string'
              ? { primary: text }
              : { primary: text['en-US'] ?? '', secondary: text['pt-BR'] },
        },
      ),
    ).toEqual([
      {
        type: 'heading',
        text: {
          primary: 'First Mystery: The Agony in the Garden',
          secondary: 'Primeiro Mistério: A Agonia no Horto',
        },
      },
      { type: 'meditation', text: { primary: 'Jesus prays.', secondary: 'Jesus ora.' } },
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
})
