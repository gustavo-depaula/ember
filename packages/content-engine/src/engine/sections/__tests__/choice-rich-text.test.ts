import { describe, expect, it } from 'vitest'
import { flow, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { resolveFlow } from '../../../engine'

describe('splitPlainIntoLines via choice-rich-text', () => {
  it('splits a long single-paragraph reading on sentence boundaries', () => {
    // Mock a slot whose body.plain.pt-BR is a single paragraph of
    // five sentences (>240 chars total); expect five RichTextLines.
    const longText =
      'Naqueles dias, de Antioquia chegaram judeus que convenceram as multidões. ' +
      'Então apedrejaram Paulo e arrastaram-no para fora da cidade, pensando que ele estivesse morto. ' +
      'Enquanto os discípulos o rodeavam, Paulo levantou-se e entrou na cidade. ' +
      'No dia seguinte partiu para Derbe com Barnabé. ' +
      'Voltaram depois para Listra, Icônio e Antioquia.'
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Reading' },
        slot: 'firstReading',
      }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              source: 'tempore',
              firstReading: {
                body: { plain: { 'pt-BR': longText } },
              },
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const choice = result[0] as Extract<(typeof result)[number], { type: 'choice-rich-text' }>
    const primary = choice.options[0].body.primary
    expect(primary.length).toBe(5)
  })

  it('keeps short prayers as a single line (no over-splitting)', () => {
    const shortPrayer =
      'Pai nosso que estais no céu, santificado seja o vosso nome. Venha a nós o vosso Reino.'
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Prayer' },
        slot: 'collect',
      }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              source: 'tempore',
              collect: { body: { plain: { 'pt-BR': shortPrayer } } },
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const choice = result[0] as Extract<(typeof result)[number], { type: 'choice-rich-text' }>
    expect(choice.options[0].body.primary.length).toBe(1)
  })
})

describe('resolveFlow — choice-rich-text (per-slot picker)', () => {
  // Synthetic celebration matching ember-extra's shape.
  const tempore = {
    source: 'tempore',
    entranceAntiphon: {
      body: {
        lines: {
          'pt-BR': [[{ type: 'text', text: 'No meio da Igreja...' }]],
          la: [[{ type: 'text', text: 'In medio Ecclesiae...' }]],
        },
      },
      citation: 'Sir 15, 5',
    },
    collect: { body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Pai Santo...' }]] } } },
  }
  const sanctoral = {
    source: 'sanctoral',
    entranceAntiphon: {
      body: {
        lines: { 'pt-BR': [[{ type: 'text', text: 'Antífona do santo...' }]] },
      },
    },
    // no collect — alternate has no entry for this slot
  }
  const celebration = { primary: tempore, alternates: [sanctoral] }

  it('renders chips for primary + alternates that have the slot', () => {
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Antífona' },
        slot: 'entranceAntiphon',
      }),
      makeContext({ flowData: { celebration } }),
      makeEngineContext(),
    )
    expect(result).toEqual([
      {
        type: 'choice-rich-text',
        label: { primary: 'Antífona' },
        overrideKey: 'celebration.entranceAntiphon',
        selectedId: 'tempore',
        options: [
          {
            id: 'tempore',
            label: { primary: 'Tmp' },
            body: {
              primary: [[{ type: 'text', text: 'No meio da Igreja...' }]],
              secondary: [[{ type: 'text', text: 'In medio Ecclesiae...' }]],
            },
            citation: { primary: 'Sir 15, 5' },
          },
          {
            id: 'sanctoral',
            label: { primary: 'Snt' },
            body: { primary: [[{ type: 'text', text: 'Antífona do santo...' }]] },
          },
        ],
      },
    ])
  })

  it('filters out alternates with no entry for the slot', () => {
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Coleta' },
        slot: 'collect',
      }),
      makeContext({ flowData: { celebration } }),
      makeEngineContext(),
    )
    // sanctoral has no collect → only primary (tempore) is offered
    expect(result).toMatchObject([
      {
        type: 'choice-rich-text',
        selectedId: 'tempore',
        options: [{ id: 'tempore' }],
      },
    ])
    expect((result[0] as { options: unknown[] }).options).toHaveLength(1)
  })

  it('honors selectOverrides to switch the active source per slot', () => {
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Antífona' },
        slot: 'entranceAntiphon',
      }),
      makeContext({
        flowData: { celebration },
        selectOverrides: { 'celebration.entranceAntiphon': 'sanctoral' },
      }),
      makeEngineContext(),
    )
    expect((result[0] as { selectedId: string }).selectedId).toBe('sanctoral')
  })

  it('returns empty when no celebration is bound', () => {
    const result = resolveFlow(
      flow({ type: 'choice-rich-text', label: { 'pt-BR': 'X' }, slot: 'collect' }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('returns empty when no formulary has the slot', () => {
    const result = resolveFlow(
      flow({ type: 'choice-rich-text', label: { 'pt-BR': 'X' }, slot: 'nonexistentSlot' }),
      makeContext({ flowData: { celebration } }),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('emits a liturgical-color section with localized label', () => {
    const result = resolveFlow(
      flow({
        type: 'liturgical-color',
        from: 'celebration.primary.liturgicalColor',
      }),
      makeContext({
        flowData: { celebration: { primary: { liturgicalColor: 'red' } } },
      }),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'liturgical-color', color: 'red', label: { primary: 'Vermelha' } },
    ])
  })

  it('omits liturgical-color when the path is missing or unknown', () => {
    const empty = resolveFlow(
      flow({ type: 'liturgical-color', from: 'celebration.primary.liturgicalColor' }),
      makeContext({ flowData: {} }),
      makeEngineContext(),
    )
    expect(empty).toEqual([])
    const unknown = resolveFlow(
      flow({ type: 'liturgical-color', from: 'celebration.primary.liturgicalColor' }),
      makeContext({
        flowData: { celebration: { primary: { liturgicalColor: 'mauve' } } },
      }),
      makeEngineContext(),
    )
    expect(unknown).toEqual([])
  })

  it('explodes alternatives[] into multiple chips with roman-numeral suffixes', () => {
    // ember-extra wraps multi-option readings as `slot.alternatives[]`.
    // Each alternative is a separate option chip; suffix the source label
    // (Tmp, Snt, ...) with I / II / III to disambiguate.
    const multiAltCelebration = {
      primary: {
        source: 'sanctoral',
        readings: {
          default: {
            firstReading: {
              alternatives: [
                {
                  body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Reading A' }]] } },
                  citation: 'Is 1, 1',
                },
                {
                  body: { lines: { 'pt-BR': [[{ type: 'text', text: 'Reading B' }]] } },
                  citation: 'Jer 1, 1',
                },
              ],
            },
          },
        },
      },
    }
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Primeira Leitura' },
        slot: 'readings.default.firstReading',
      }),
      makeContext({ flowData: { celebration: multiAltCelebration } }),
      makeEngineContext(),
    )
    expect(result).toMatchObject([
      {
        type: 'choice-rich-text',
        options: [
          { id: 'sanctoral-0', label: { primary: 'Snt I' } },
          { id: 'sanctoral-1', label: { primary: 'Snt II' } },
        ],
      },
    ])
  })

  it('passes through precedingResponse (localized) on the rendered section', () => {
    // The Gospel slot uses precedingResponse to render the people's "Glory to
    // you, O Lord." between the priest's introduction and the body. Verify
    // the engine localizes the field and forwards it on the rendered output.
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Evangelho' },
        slot: 'gospel',
        precedingResponse: {
          'en-US': '℟. Glory to you, O Lord.',
          'pt-BR': '℟. Glória a vós, Senhor.',
        },
      }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              source: 'tempore',
              gospel: { body: { plain: { 'pt-BR': 'Naquele tempo...' } } },
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const choice = result[0] as Extract<(typeof result)[number], { type: 'choice-rich-text' }>
    expect(choice.precedingResponse?.primary).toBe('℟. Glória a vós, Senhor.')
  })

  it('omits precedingResponse when not set on the input section', () => {
    const result = resolveFlow(
      flow({
        type: 'choice-rich-text',
        label: { 'pt-BR': 'Coleta' },
        slot: 'collect',
      }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              source: 'tempore',
              collect: { body: { plain: { 'pt-BR': 'Pai nosso...' } } },
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const choice = result[0] as Extract<(typeof result)[number], { type: 'choice-rich-text' }>
    expect(choice.precedingResponse).toBeUndefined()
  })
})
