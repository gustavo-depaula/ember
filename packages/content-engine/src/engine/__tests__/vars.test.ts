import { describe, expect, it } from 'vitest'
import { flow, makeContext, makeEngineContext } from '../../__fixtures__/engine'
import { resolveFlow } from '../../engine'

describe('resolveFlow — template variable substitution', () => {
  it('substitutes template vars in section text', () => {
    expect(
      resolveFlow(
        flow({ type: 'heading', text: { 'pt-BR': '{{title}}' } }),
        makeContext({ templateVars: { title: 'Meditation for Today' } }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Meditation for Today' } }])
  })

  it('substitutes template vars inside options labels', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'Meditação' },
          options: [
            {
              id: 'a',
              label: { 'pt-BR': '{{labelA}}' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'content' } }],
            },
            {
              id: 'b',
              label: { 'pt-BR': '{{labelB}}' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'content' } }],
            },
          ],
        }),
        makeContext({ templateVars: { labelA: 'First', labelB: 'Second' } }),
        makeEngineContext(),
      ),
    ).toEqual([
      {
        type: 'options',
        label: { primary: 'Meditação' },
        options: [
          {
            id: 'a',
            label: { primary: 'First' },
            sections: [{ type: 'rubric', label: { primary: 'content' } }],
          },
          {
            id: 'b',
            label: { primary: 'Second' },
            sections: [{ type: 'rubric', label: { primary: 'content' } }],
          },
        ],
      },
    ])
  })
})

// =============================================================================

// --- getContextValue ---

describe('resolveFlow — nested template substitution', () => {
  it('substitutes dotted-path templates from flowData inside section text', () => {
    const result = resolveFlow(
      flow({ type: 'rubric', text: { 'pt-BR': '{{day.title}}' } }),
      makeContext({ flowData: { day: { title: 'Good Friday' } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'Good Friday' } }])
  })

  it('substitutes deep paths through nested objects', () => {
    const result = resolveFlow(
      flow({
        type: 'heading',
        text: { 'pt-BR': '{{celebration.primary.entranceAntiphon.body}}' },
      }),
      makeContext({
        flowData: {
          celebration: {
            primary: { entranceAntiphon: { body: 'In medio Ecclesiae' } },
          },
        },
      }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'In medio Ecclesiae' } }])
  })

  it('leaves unresolved templates intact', () => {
    const result = resolveFlow(
      flow({ type: 'rubric', text: { 'pt-BR': '{{day.unknown.field}}' } }),
      makeContext({ flowData: { day: {} } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: '{{day.unknown.field}}' } }])
  })

  it('templateVars wins over flowData on key conflict', () => {
    const result = resolveFlow(
      flow({ type: 'rubric', text: { 'pt-BR': '{{title}}' } }),
      makeContext({
        flowData: { title: 'from-data' },
        templateVars: { title: 'from-template' },
      }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'from-template' } }])
  })
})
