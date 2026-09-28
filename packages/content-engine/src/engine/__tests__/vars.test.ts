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
})

describe('resolveFlow — nested template substitution', () => {
  it('substitutes dotted-path templates from flowData inside section text', () => {
    const result = resolveFlow(
      flow({ type: 'rubric', text: { 'pt-BR': '{{day.title}}' } }),
      makeContext({ flowData: { day: { title: 'Good Friday' } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'Good Friday' } }])
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
