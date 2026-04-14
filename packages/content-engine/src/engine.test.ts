import { getLiturgicalDayName } from '@ember/liturgical'
import { describe, expect, it } from 'vitest'
import liguoriLiturgicalMapFixture from '../../../content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/data/liturgical-map.json'
import liguoriFlowFixture from '../../../content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/flow.json'
import {
  type EngineContext,
  type FlowContext,
  getContextValue,
  lookupMap,
  resolveFlow,
  resolveFlowAsync,
} from './engine'
import type { FlowDefinition, FlowSection, RepeatEntry } from './types'

function makeEngineContext(prose: Record<string, { 'pt-BR'?: string }> = {}): EngineContext {
  return {
    language: 'pt-BR',
    contentLanguage: 'pt-BR',
    localize: (text) => {
      if (typeof text === 'string') return { primary: text }
      return { primary: text['pt-BR'] ?? '' }
    },
    localizeUI: (text) => text['pt-BR'] ?? '',
    t: (key) => key,
    parsePsalmRef: () => ({ book: 'psalms', chapter: 1, numbering: 'hebrew' }) as never,
    parseTrackEntry: () => [],
    prayers: {},
    canticles: {},
    prose,
  }
}

function makeContext(overrides: Partial<FlowContext> = {}): FlowContext {
  return { date: new Date('2026-04-12'), ...overrides }
}

function flow(...sections: FlowSection[]): FlowDefinition {
  return { sections }
}

function flowDef(def: Partial<FlowDefinition> & { sections: FlowSection[] }): FlowDefinition {
  return def
}

// =============================================================================
// Existing tests (pre-unified-flow)
// =============================================================================

describe('resolveFlow — options collapsing', () => {
  it('renders all options as pills when multiple have content', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'Pick one' },
          options: [
            {
              id: 'a',
              label: { 'pt-BR': 'Option A' },
              sections: [{ type: 'prose', file: 'slot-a' }],
            },
            {
              id: 'b',
              label: { 'pt-BR': 'Option B' },
              sections: [{ type: 'prose', file: 'slot-b' }],
            },
          ],
        }),
        makeContext(),
        makeEngineContext({ 'slot-a': { 'pt-BR': 'Text A' }, 'slot-b': { 'pt-BR': 'Text B' } }),
      ),
    ).toEqual([
      {
        type: 'options',
        label: { primary: 'Pick one' },
        options: [
          {
            id: 'a',
            label: { primary: 'Option A' },
            sections: [{ type: 'prose', text: { primary: 'Text A' } }],
          },
          {
            id: 'b',
            label: { primary: 'Option B' },
            sections: [{ type: 'prose', text: { primary: 'Text B' } }],
          },
        ],
      },
    ])
  })

  it('collapses to bare content when only one option has content', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'Pick one' },
          options: [
            {
              id: 'a',
              label: { 'pt-BR': 'Option A' },
              sections: [{ type: 'prose', file: 'slot-a' }],
            },
            {
              id: 'b',
              label: { 'pt-BR': 'Option B' },
              sections: [{ type: 'prose', file: 'slot-b' }],
            },
          ],
        }),
        makeContext({ resolvedProse: { 'slot-a': { 'pt-BR': 'Only text' } } }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'prose', text: { primary: 'Only text' } }])
  })

  it('returns empty when no options have content', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'Pick one' },
          options: [
            { id: 'a', label: { 'pt-BR': 'A' }, sections: [{ type: 'prose', file: 'missing-1' }] },
            { id: 'b', label: { 'pt-BR': 'B' }, sections: [{ type: 'prose', file: 'missing-2' }] },
          ],
        }),
        makeContext({ resolvedProse: {} }),
        makeEngineContext(),
      ),
    ).toEqual([])
  })

  it('filters out empty options and keeps 2+ as pills', () => {
    const result = resolveFlow(
      flow({
        type: 'options',
        label: { 'pt-BR': 'Pick one' },
        options: [
          { id: 'a', label: { 'pt-BR': 'A' }, sections: [{ type: 'prose', file: 'slot-a' }] },
          { id: 'b', label: { 'pt-BR': 'B' }, sections: [{ type: 'prose', file: 'slot-b' }] },
          { id: 'c', label: { 'pt-BR': 'C' }, sections: [{ type: 'prose', file: 'slot-c' }] },
        ],
      }),
      makeContext({
        resolvedProse: { 'slot-a': { 'pt-BR': 'Text A' }, 'slot-c': { 'pt-BR': 'Text C' } },
      }),
      makeEngineContext(),
    )

    expect(result).toEqual([
      {
        type: 'options',
        label: { primary: 'Pick one' },
        options: [
          {
            id: 'a',
            label: { primary: 'A' },
            sections: [{ type: 'prose', text: { primary: 'Text A' } }],
          },
          {
            id: 'c',
            label: { primary: 'C' },
            sections: [{ type: 'prose', text: { primary: 'Text C' } }],
          },
        ],
      },
    ])
  })
})

describe('resolveFlow — prose with resolvedProse', () => {
  it('silently skips missing prose keys when resolvedProse is set', () => {
    expect(
      resolveFlow(
        flow({ type: 'prose', file: 'exists' }, { type: 'prose', file: 'missing' }),
        makeContext({ resolvedProse: { exists: { 'pt-BR': 'Hello' } } }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'prose', text: { primary: 'Hello' } }])
  })

  it('shows error for missing prose when resolvedProse is not set', () => {
    const result = resolveFlow(
      flow({ type: 'prose', file: 'missing' }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ type: 'prose' })
    if (result[0].type === 'prose') {
      expect(result[0].text.primary).toContain('Prose not found')
    }
  })
})

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

describe('getContextValue', () => {
  it('returns dayOfWeek as string "0"-"6"', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dayOfWeek'),
    ).toBe('0') // Sunday
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-13T12:00:00') }), 'dayOfWeek'),
    ).toBe('1') // Monday
  })

  it('returns dayOfMonth as string', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dayOfMonth'),
    ).toBe('12')
  })

  it('returns hour from the date', () => {
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T07:30:00') }), 'hour')).toBe(
      '7',
    )
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T00:15:00') }), 'hour')).toBe(
      '0',
    )
  })

  it('returns timeOfDay buckets', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T07:00:00') }), 'timeOfDay'),
    ).toBe('morning')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T14:00:00') }), 'timeOfDay'),
    ).toBe('afternoon')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T18:00:00') }), 'timeOfDay'),
    ).toBe('evening')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T22:00:00') }), 'timeOfDay'),
    ).toBe('night')
  })

  it('returns liturgicalCalendar and numbering from context', () => {
    expect(getContextValue(makeContext({ liturgicalCalendar: 'ef' }), 'liturgicalCalendar')).toBe(
      'ef',
    )
    expect(getContextValue(makeContext({ numbering: 'lxx' }), 'numbering')).toBe('lxx')
  })

  it('returns programDay as string', () => {
    expect(getContextValue(makeContext({ programDay: 14 }), 'programDay')).toBe('14')
  })

  it('returns dateKey in MM-DD format', () => {
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dateKey')).toBe(
      '04-12',
    )
    expect(getContextValue(makeContext({ date: new Date('2026-01-05T12:00:00') }), 'dateKey')).toBe(
      '01-05',
    )
  })

  it('returns undefined for unknown keys', () => {
    expect(getContextValue(makeContext(), 'nonExistentKey')).toBeUndefined()
  })
})

// --- lookupMap ---

describe('lookupMap', () => {
  it('matches exact string keys', () => {
    const map = { '1': 'joyful', '2': 'sorrowful', '3': 'glorious' }
    expect(lookupMap(map, '1')).toBe('joyful')
    expect(lookupMap(map, '2')).toBe('sorrowful')
  })

  it('matches numeric range keys (inclusive)', () => {
    const map = { '6-8': 'lauds', '9-11': 'terce', '17-19': 'vespers' }
    expect(lookupMap(map, '6')).toBe('lauds')
    expect(lookupMap(map, '7')).toBe('lauds')
    expect(lookupMap(map, '8')).toBe('lauds')
    expect(lookupMap(map, '9')).toBe('terce')
    expect(lookupMap(map, '17')).toBe('vespers')
  })

  it('returns first matching range when ranges overlap', () => {
    expect(lookupMap({ '5-10': 'first', '8-12': 'second' }, '8')).toBe('first')
  })

  it('prefers exact match over range match', () => {
    expect(lookupMap({ '7': 'exact', '6-8': 'range' }, '7')).toBe('exact')
  })

  it('returns undefined when no match', () => {
    expect(lookupMap({ '1': 'a', '6-8': 'b' }, '99')).toBeUndefined()
  })

  it('handles zero in range', () => {
    expect(lookupMap({ '0-5': 'matins' }, '0')).toBe('matins')
    expect(lookupMap({ '0-5': 'matins' }, '3')).toBe('matins')
  })
})

// --- select: silent conditional ---

describe('resolveFlow — select: silent conditional', () => {
  it('auto-selects and renders only the matched option sections', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          on: 'dayOfWeek',
          map: { '1': 'joyful', '2': 'sorrowful' },
          options: [
            {
              id: 'joyful',
              label: { 'pt-BR': 'Gozosos' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'Joyful' } }],
            },
            {
              id: 'sorrowful',
              label: { 'pt-BR': 'Dolorosos' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'Sorrowful' } }],
            },
          ],
        }),
        makeContext({ date: new Date('2026-04-13T12:00:00') }), // Monday = 1 → joyful
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Joyful' } }])
  })

  it('falls back to default when context value has no match', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          on: 'dayOfWeek',
          map: { '1': 'joyful' },
          default: 'sorrowful',
          options: [
            {
              id: 'joyful',
              label: { 'pt-BR': 'J' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'Joyful' } }],
            },
            {
              id: 'sorrowful',
              label: { 'pt-BR': 'S' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'Sorrowful' } }],
            },
          ],
        }),
        makeContext({ date: new Date('2026-04-12T12:00:00') }), // Sunday = 0, not in map
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Sorrowful' } }])
  })

  it('falls back to first option when no default and no match', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          on: 'dayOfWeek',
          map: { '99': 'never' },
          options: [
            {
              id: 'first',
              label: { 'pt-BR': 'F' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'First' } }],
            },
            {
              id: 'second',
              label: { 'pt-BR': 'S' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'Second' } }],
            },
          ],
        }),
        makeContext(),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'rubric', label: { primary: 'First' } }])
  })

  it('uses raw context value as option ID when no map', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          on: 'liturgicalCalendar',
          options: [
            {
              id: 'of',
              label: { 'pt-BR': 'OF' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'OF content' } }],
            },
            {
              id: 'ef',
              label: { 'pt-BR': 'EF' },
              sections: [{ type: 'rubric', text: { 'pt-BR': 'EF content' } }],
            },
          ],
        }),
        makeContext({ liturgicalCalendar: 'ef' }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'rubric', label: { primary: 'EF content' } }])
  })
})

// --- select: default + override (label present) ---

describe('resolveFlow — select: default + override', () => {
  it('emits rendered select with all options and auto-selected ID', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          on: 'dayOfWeek',
          label: { 'pt-BR': 'Mistérios' },
          map: { '1': 'joyful' },
          options: [
            {
              id: 'joyful',
              label: { 'pt-BR': 'Gozosos' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'J' } }],
            },
            {
              id: 'sorrowful',
              label: { 'pt-BR': 'Dolorosos' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'S' } }],
            },
          ],
        }),
        makeContext({ date: new Date('2026-04-13T12:00:00') }), // Monday → joyful
        makeEngineContext(),
      ),
    ).toEqual([
      {
        type: 'select',
        label: { primary: 'Mistérios' },
        overrideKey: 'joyful',
        selectedId: 'joyful',
        options: [
          {
            id: 'joyful',
            label: { primary: 'Gozosos' },
            sections: [{ type: 'heading', text: { primary: 'J' } }],
          },
          {
            id: 'sorrowful',
            label: { primary: 'Dolorosos' },
            sections: [],
          },
        ],
      },
    ])
  })

  it('respects selectOverrides', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'dayOfWeek',
        as: 'mysteries',
        label: { 'pt-BR': 'M' },
        map: { '1': 'joyful' },
        options: [
          {
            id: 'joyful',
            label: { 'pt-BR': 'J' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'J' } }],
          },
          {
            id: 'glorious',
            label: { 'pt-BR': 'G' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'G' } }],
          },
        ],
      }),
      makeContext({
        date: new Date('2026-04-13T12:00:00'),
        selectOverrides: { mysteries: 'glorious' },
      }),
      makeEngineContext(),
    )

    expect(result).toMatchObject([{ type: 'select', selectedId: 'glorious' }])
  })
})

// --- select: manual ---

describe('resolveFlow — select: manual', () => {
  it('uses default as selectedId, renders picker', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        label: { 'pt-BR': 'Modo' },
        default: 'prepare',
        options: [
          {
            id: 'prepare',
            label: { 'pt-BR': 'Prep' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'P' } }],
          },
          {
            id: 'thanks',
            label: { 'pt-BR': 'Thanks' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'T' } }],
          },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )

    expect(result).toMatchObject([
      {
        type: 'select',
        selectedId: 'prepare',
        options: expect.arrayContaining([
          expect.objectContaining({ id: 'prepare' }),
          expect.objectContaining({ id: 'thanks' }),
        ]),
      },
    ])
  })

  it('falls back to first option when no default', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        label: { 'pt-BR': 'Pick' },
        options: [
          {
            id: 'alpha',
            label: { 'pt-BR': 'A' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'A' } }],
          },
          {
            id: 'beta',
            label: { 'pt-BR': 'B' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'B' } }],
          },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )

    expect(result).toMatchObject([{ type: 'select', selectedId: 'alpha' }])
  })

  it('selectOverrides overrides manual default', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        as: 'mode',
        label: { 'pt-BR': 'Mode' },
        default: 'prepare',
        options: [
          {
            id: 'prepare',
            label: { 'pt-BR': 'P' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'P' } }],
          },
          {
            id: 'thanks',
            label: { 'pt-BR': 'T' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'T' } }],
          },
        ],
      }),
      makeContext({ selectOverrides: { mode: 'thanks' } }),
      makeEngineContext(),
    )

    expect(result).toMatchObject([{ type: 'select', selectedId: 'thanks' }])
  })
})

// --- select: as variable ---

describe('resolveFlow — select: as variable', () => {
  it('silent select with no option sections renders nothing, just sets the variable', () => {
    expect(
      resolveFlow(
        flow(
          {
            type: 'select',
            on: 'dayOfWeek',
            as: 'mysteries',
            map: { '1': 'joyful' },
            options: [
              { id: 'joyful', label: { 'pt-BR': 'G' } },
              { id: 'sorrowful', label: { 'pt-BR': 'D' } },
            ],
          },
          { type: 'rubric', text: { 'pt-BR': 'After select' } },
        ),
        makeContext({ date: new Date('2026-04-13T12:00:00') }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'rubric', label: { primary: 'After select' } }])
  })

  it('with label, shows picker with empty sections per option', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'dayOfWeek',
        as: 'mysteries',
        label: { 'pt-BR': 'Mistérios' },
        map: { '1': 'joyful' },
        options: [
          { id: 'joyful', label: { 'pt-BR': 'Gozosos' } },
          { id: 'sorrowful', label: { 'pt-BR': 'Dolorosos' } },
        ],
      }),
      makeContext({ date: new Date('2026-04-13T12:00:00') }),
      makeEngineContext(),
    )

    expect(result).toEqual([
      {
        type: 'select',
        label: { primary: 'Mistérios' },
        overrideKey: 'mysteries',
        selectedId: 'joyful',
        options: [
          { id: 'joyful', label: { primary: 'Gozosos' }, sections: [] },
          { id: 'sorrowful', label: { primary: 'Dolorosos' }, sections: [] },
        ],
      },
    ])
  })
})

// --- select: range map ---

describe('resolveFlow — select: range map', () => {
  const officeSelect = (_hour: string): FlowSection => ({
    type: 'select',
    on: 'hour',
    map: {
      '0-5': 'matins',
      '6-8': 'lauds',
      '9-11': 'terce',
      '12-13': 'sext',
      '14-16': 'none',
      '17-19': 'vespers',
      '20-23': 'compline',
    },
    options: [
      {
        id: 'matins',
        label: { 'pt-BR': 'Matinas' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Matins' } }],
      },
      {
        id: 'lauds',
        label: { 'pt-BR': 'Laudes' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Lauds' } }],
      },
      {
        id: 'terce',
        label: { 'pt-BR': 'Terça' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Terce' } }],
      },
      {
        id: 'sext',
        label: { 'pt-BR': 'Sexta' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Sext' } }],
      },
      {
        id: 'none',
        label: { 'pt-BR': 'Noa' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'None' } }],
      },
      {
        id: 'vespers',
        label: { 'pt-BR': 'Vésperas' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Vespers' } }],
      },
      {
        id: 'compline',
        label: { 'pt-BR': 'Completas' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Compline' } }],
      },
    ],
  })

  it('hour 7 → lauds', () => {
    expect(
      resolveFlow(
        flow(officeSelect('7')),
        makeContext({ date: new Date('2026-04-12T07:30:00') }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Lauds' } }])
  })

  it('hour 18 → vespers', () => {
    expect(
      resolveFlow(
        flow(officeSelect('18')),
        makeContext({ date: new Date('2026-04-12T18:00:00') }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Vespers' } }])
  })

  it('hour 3 → matins', () => {
    expect(
      resolveFlow(
        flow(officeSelect('3')),
        makeContext({ date: new Date('2026-04-12T03:00:00') }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'Matins' } }])
  })
})

// --- select: nested ---

describe('resolveFlow — select: nested selects', () => {
  it('outer by context, inner manual', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'liturgicalCalendar',
        label: { 'pt-BR': 'Forma' },
        map: { of: 'ordinary', ef: 'extraordinary' },
        default: 'ordinary',
        options: [
          {
            id: 'ordinary',
            label: { 'pt-BR': 'OF' },
            sections: [
              {
                type: 'select',
                label: { 'pt-BR': 'View' },
                default: 'full',
                options: [
                  {
                    id: 'full',
                    label: { 'pt-BR': 'Full' },
                    sections: [{ type: 'rubric', text: { 'pt-BR': 'Full OF' } }],
                  },
                  {
                    id: 'propers',
                    label: { 'pt-BR': 'Propers' },
                    sections: [{ type: 'rubric', text: { 'pt-BR': 'OF Propers' } }],
                  },
                ],
              },
            ],
          },
          {
            id: 'extraordinary',
            label: { 'pt-BR': 'EF' },
            sections: [{ type: 'rubric', text: { 'pt-BR': 'EF Mass' } }],
          },
        ],
      }),
      makeContext({ liturgicalCalendar: 'of' }),
      makeEngineContext(),
    )

    expect(result).toMatchObject([
      {
        type: 'select',
        selectedId: 'ordinary',
        options: expect.arrayContaining([
          expect.objectContaining({
            id: 'ordinary',
            sections: [expect.objectContaining({ type: 'select', selectedId: 'full' })],
          }),
        ]),
      },
    ])
  })
})

// --- repeat from ---

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

describe('resolveFlow — options from', () => {
  it('generates option tabs from named data array', () => {
    const entries: RepeatEntry[] = [
      { id: 'ch1', label: { 'pt-BR': 'Chapter One' }, chapterId: 'chapter-1' },
      { id: 'ch2', label: { 'pt-BR': 'Chapter Two' }, chapterId: 'chapter-2' },
    ]

    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'Meditação' },
          from: 'meditations',
          sections: [{ type: 'heading', text: { 'pt-BR': '{{chapterId}}' } }],
        }),
        makeContext({ flowData: { meditations: entries } }),
        makeEngineContext(),
      ),
    ).toEqual([
      {
        type: 'options',
        label: { primary: 'Meditação' },
        options: [
          {
            id: 'ch1',
            label: { primary: 'Chapter One' },
            sections: [{ type: 'heading', text: { primary: 'chapter-1' } }],
          },
          {
            id: 'ch2',
            label: { primary: 'Chapter Two' },
            sections: [{ type: 'heading', text: { primary: 'chapter-2' } }],
          },
        ],
      },
    ])
  })

  it('falls back to index as option id when entry has no id', () => {
    const result = resolveFlow(
      flow({
        type: 'options',
        label: { 'pt-BR': 'P' },
        from: 'items',
        sections: [{ type: 'rubric', text: { 'pt-BR': 'c' } }],
      }),
      makeContext({
        flowData: {
          items: [{ id: 'feast', label: { 'pt-BR': 'Feast' } }, { label: { 'pt-BR': 'Temporal' } }],
        },
      }),
      makeEngineContext(),
    )

    expect(result).toMatchObject([
      {
        type: 'options',
        options: [{ id: 'feast' }, { id: '1' }],
      },
    ])
  })

  it('collapses to bare content when only one entry', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'P' },
          from: 'items',
          sections: [{ type: 'rubric', text: { 'pt-BR': '{{data}}' } }],
        }),
        makeContext({ flowData: { items: [{ label: { 'pt-BR': 'Only' }, data: 'value' }] } }),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'rubric', label: { primary: 'value' } }])
  })

  it('returns empty when from references missing data', () => {
    expect(
      resolveFlow(
        flow({
          type: 'options',
          label: { 'pt-BR': 'P' },
          from: 'missing',
          sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
        }),
        makeContext({ flowData: {} }),
        makeEngineContext(),
      ),
    ).toEqual([])
  })
})

describe('resolveFlow — flowVersion', () => {
  it('accepts flowVersion 1 and legacy flows without version', () => {
    expect(
      resolveFlow(
        flowDef({
          flowVersion: '1',
          sections: [{ type: 'heading', text: { 'pt-BR': 'ok' } }],
        }),
        makeContext(),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'ok' } }])

    expect(
      resolveFlow(
        flowDef({
          sections: [{ type: 'heading', text: { 'pt-BR': 'legacy' } }],
        }),
        makeContext(),
        makeEngineContext(),
      ),
    ).toEqual([{ type: 'heading', text: { primary: 'legacy' } }])
  })

  it('throws for unsupported flowVersion in sync and async resolvers', async () => {
    const unsupported = {
      flowVersion: '2',
      sections: [{ type: 'heading', text: { 'pt-BR': 'x' } }],
    } as unknown as FlowDefinition

    expect(() => resolveFlow(unsupported, makeContext(), makeEngineContext())).toThrow(
      'Unsupported flowVersion: 2',
    )
    await expect(resolveFlowAsync(unsupported, makeContext(), makeEngineContext())).rejects.toThrow(
      'Unsupported flowVersion: 2',
    )
  })
})

describe('resolveFlowAsync — resolve strategy + dynamic prose', () => {
  it('hydrates flowData/template vars from resolve and loads dynamic prose chapters', async () => {
    const liturgicalMap = {
      temporal: {},
      fixedDates: {
        '04-11': { primary: 'temporal-chapter' },
        '04-12': { primary: 'temporal-chapter' },
      },
      feasts: {
        '04-11': { primary: 'feast-chapter' },
        '04-12': { primary: 'feast-chapter' },
      },
      novenas: {},
      reserves: [],
    }

    const context = makeContext({
      cycleData: { 'liturgical-map': liturgicalMap as never },
      liturgicalCalendar: 'ef',
    })

    const engineContext: EngineContext = {
      ...makeEngineContext(),
      getBookChapterTitle: (_book, chapter) => `Title ${chapter}`,
      loadBookChapterTextAsync: async (_book, chapter) => ({ 'pt-BR': `Text ${chapter}` }),
    }

    const result = await resolveFlowAsync(
      flowDef({
        resolve: [
          {
            source: 'liturgical',
            dataType: 'liturgical-meditation-map',
            data: 'liturgical-map',
            strategy: 'liturgical-day',
            as: 'meditations',
            book: 'meditacoes-ligorio',
          },
        ],
        sections: [
          { type: 'heading', text: { 'pt-BR': '{{meditationTitle}}' } },
          {
            type: 'options',
            label: { 'pt-BR': 'Meditação' },
            from: 'meditations',
            sections: [{ type: 'prose', book: 'meditacoes-ligorio', chapter: '{{chapterId}}' }],
          },
        ],
      }),
      context,
      engineContext,
    )

    expect(result).toEqual([
      { type: 'heading', text: { primary: 'Title feast-chapter' } },
      {
        type: 'options',
        label: { primary: 'Meditação' },
        options: [
          {
            id: '0',
            label: { primary: 'Title feast-chapter' },
            sections: [{ type: 'prose', text: { primary: 'Text feast-chapter' } }],
          },
          {
            id: '1',
            label: { primary: 'Title temporal-chapter' },
            sections: [{ type: 'prose', text: { primary: 'Text temporal-chapter' } }],
          },
        ],
      },
    ])
  })

  it('includes fixed-date and weekdaysOfMonths additions in resolved entries', async () => {
    const liturgicalMap = {
      temporal: {},
      fixedDates: {
        '04-25': { primary: 'fixed-date-additional-chapter' },
      },
      feasts: {},
      novenas: {},
      weekdaysOfMonths: {
        '4th-saturday-of-april': { primary: 'weekday-chapter' },
      },
      reserves: ['temporal-chapter'],
    }

    const context = makeContext({
      date: new Date('2026-04-25T12:00:00Z'),
      cycleData: { 'liturgical-map': liturgicalMap as never },
      liturgicalCalendar: 'ef',
    })

    const engineContext: EngineContext = {
      ...makeEngineContext(),
      getBookChapterTitle: (_book, chapter) => `Title ${chapter}`,
      loadBookChapterTextAsync: async (_book, chapter) => ({ 'pt-BR': `Text ${chapter}` }),
    }

    const result = await resolveFlowAsync(
      flowDef({
        resolve: [
          {
            source: 'liturgical',
            dataType: 'liturgical-meditation-map',
            data: 'liturgical-map',
            strategy: 'liturgical-day',
            as: 'meditations',
            book: 'meditacoes-ligorio',
          },
        ],
        sections: [
          {
            type: 'options',
            label: { 'pt-BR': 'Meditação' },
            from: 'meditations',
            sections: [{ type: 'prose', book: 'meditacoes-ligorio', chapter: '{{chapterId}}' }],
          },
        ],
      }),
      context,
      engineContext,
    )

    const meditationOptions = result.find((section) => section.type === 'options')
    expect(meditationOptions).toBeDefined()
    if (!meditationOptions || meditationOptions.type !== 'options') {
      throw new Error('Expected options section')
    }

    const proseTexts = meditationOptions.options.flatMap((option) => {
      const prose = option.sections[0]
      if (!prose || prose.type !== 'prose') return []
      return [prose.text.primary]
    })
    expect(proseTexts).toEqual(
      expect.arrayContaining([
        'Text temporal-chapter',
        'Text fixed-date-additional-chapter',
        'Text weekday-chapter',
      ]),
    )
  })

  it('uses resolve-step calendar override instead of context liturgicalCalendar', async () => {
    const date = new Date('2026-02-10T12:00:00Z')
    const liturgicalMap = {
      temporal: {},
      fixedDates: { '02-10': { primary: 'temporal-chapter' } },
      feasts: {},
      novenas: {},
      reserves: [],
    }

    const context = makeContext({
      date,
      cycleData: { 'liturgical-map': liturgicalMap as never },
      liturgicalCalendar: 'of',
    })
    const ec: EngineContext = {
      ...makeEngineContext(),
      t: (key, options) => `${key}:${JSON.stringify(options ?? {})}`,
    }

    const result = await resolveFlowAsync(
      flowDef({
        resolve: [
          {
            source: 'liturgical',
            dataType: 'liturgical-meditation-map',
            data: 'liturgical-map',
            calendar: 'ef',
            strategy: 'liturgical-day',
            as: 'meditations',
          },
        ],
        sections: [{ type: 'heading', text: { 'pt-BR': '{{liturgicalLabel}}' } }],
      }),
      context,
      ec,
    )

    const expectedEf = getLiturgicalDayName(date, 'ef', { t: ec.t })
    const expectedOf = getLiturgicalDayName(date, 'of', { t: ec.t })
    expect(expectedEf).not.toBe(expectedOf)
    expect(result).toEqual([{ type: 'heading', text: { primary: expectedEf } }])
  })
})

describe('integration: meditacoes-ligorio canonical flow', () => {
  it('uses resolve array data and renders prose without legacy fixed-slot placeholders', async () => {
    const context = makeContext({
      date: new Date('2026-04-12T12:00:00Z'),
      cycleData: { 'liturgical-map': liguoriLiturgicalMapFixture as never },
      liturgicalCalendar: 'ef',
    })

    const engineContext: EngineContext = {
      ...makeEngineContext(),
      language: 'en-US',
      contentLanguage: 'en-US',
      localize: (text) => {
        if (typeof text === 'string') return { primary: text }
        return { primary: text['en-US'] ?? text['pt-BR'] ?? '' }
      },
      getBookLanguages: () => ['pt-BR'],
      getBookChapterTitle: (_book, chapter) => `Title ${chapter}`,
      loadBookChapterTextAsync: async (_book, chapter, lang) =>
        lang === 'pt-BR' ? { 'pt-BR': `Text ${chapter}` } : undefined,
    }

    const result = await resolveFlowAsync(
      liguoriFlowFixture as unknown as FlowDefinition,
      context,
      engineContext,
    )

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('{{')
    expect(serialized).not.toContain('feastLabel')
    expect(serialized).not.toContain('meditation-feast')

    const meditationOptions = result.find((section) => section.type === 'options')
    if (meditationOptions?.type === 'options') {
      expect(meditationOptions.options.length).toBeGreaterThan(0)
      for (const option of meditationOptions.options) {
        expect(option.sections.length).toBe(1)
        const prose = option.sections[0]
        expect(prose.type).toBe('prose')
        if (prose.type !== 'prose') throw new Error('Expected prose option section')
        expect(prose.text.primary).toContain('Text ')
      }
      return
    }

    const proseSections = result.filter((section) => section.type === 'prose')
    expect(proseSections.length).toBeGreaterThan(0)
    for (const section of proseSections) {
      if (section.type !== 'prose') continue
      expect(section.text.primary).toContain('Text ')
    }
  })

  it('renders both temporal and monthly-25th meditations on May 25', async () => {
    const context = makeContext({
      date: new Date('2026-05-25T12:00:00Z'),
      cycleData: { 'liturgical-map': liguoriLiturgicalMapFixture as never },
      liturgicalCalendar: 'of',
    })

    const engineContext: EngineContext = {
      ...makeEngineContext(),
      language: 'pt-BR',
      contentLanguage: 'pt-BR',
      getBookChapterTitle: (_book, chapter) => `Title ${chapter}`,
      loadBookChapterTextAsync: async (_book, chapter) => ({ 'pt-BR': `Text ${chapter}` }),
    }

    const result = await resolveFlowAsync(
      liguoriFlowFixture as unknown as FlowDefinition,
      context,
      engineContext,
    )
    const meditationOptions = result.find((section) => section.type === 'options')
    expect(meditationOptions).toBeDefined()
    if (!meditationOptions || meditationOptions.type !== 'options') {
      throw new Error('Expected options section with multiple meditations')
    }
    expect(meditationOptions.options.length).toBeGreaterThanOrEqual(2)
  })
})

// --- flow.data ---

describe('resolveFlow — flow.data', () => {
  it('makes static data arrays available to repeat from', () => {
    expect(
      resolveFlow(
        flowDef({
          data: {
            stations: [{ name: { 'pt-BR': 'Condemned' } }, { name: { 'pt-BR': 'Carries cross' } }],
          },
          sections: [
            {
              type: 'repeat',
              from: 'stations',
              sections: [{ type: 'heading', text: { 'pt-BR': '{{name}}' } }],
            },
          ],
        }),
        makeContext(),
        makeEngineContext(),
      ),
    ).toEqual([
      { type: 'heading', text: { primary: 'Condemned' } },
      { type: 'heading', text: { primary: 'Carries cross' } },
    ])
  })

  it('select as + repeat from reads flow.data (Rosary pattern)', () => {
    const result = resolveFlow(
      flowDef({
        data: {
          joyful: [{ name: { 'pt-BR': 'Annunciation' } }, { name: { 'pt-BR': 'Visitation' } }],
          sorrowful: [{ name: { 'pt-BR': 'Agony' } }],
        },
        sections: [
          {
            type: 'select',
            on: 'dayOfWeek',
            as: 'mysteries',
            map: { '1': 'joyful' },
            options: [
              { id: 'joyful', label: { 'pt-BR': 'J' } },
              { id: 'sorrowful', label: { 'pt-BR': 'S' } },
            ],
          },
          {
            type: 'repeat',
            from: '{{mysteries}}',
            sections: [{ type: 'heading', text: { 'pt-BR': '{{ordinal}}: {{name}}' } }],
          },
        ],
      }),
      makeContext({ date: new Date('2026-04-13T12:00:00') }), // Monday → joyful
      makeEngineContext(),
    )

    expect(result).toEqual([
      { type: 'heading', text: { primary: 'Primeiro: Annunciation' } },
      { type: 'heading', text: { primary: 'Segundo: Visitation' } },
    ])
  })

  it('flowData from context merges with flow.data', () => {
    expect(
      resolveFlow(
        flowDef({
          data: { static: [{ name: 'From flow.data' }] },
          sections: [
            {
              type: 'repeat',
              from: 'dynamic',
              sections: [{ type: 'rubric', text: { 'pt-BR': '{{name}}' } }],
            },
            {
              type: 'repeat',
              from: 'static',
              sections: [{ type: 'rubric', text: { 'pt-BR': '{{name}}' } }],
            },
          ],
        }),
        makeContext({ flowData: { dynamic: [{ name: 'From context' }] } }),
        makeEngineContext(),
      ),
    ).toEqual([
      { type: 'rubric', label: { primary: 'From context' } },
      { type: 'rubric', label: { primary: 'From flow.data' } },
    ])
  })
})

// --- dynamic prose ---

describe('resolveFlow — dynamic prose (book + chapter)', () => {
  function ecWithBookLoader(
    loader: (book: string, chapter: string, lang: string) => { 'pt-BR'?: string } | undefined,
  ): EngineContext {
    const ec = makeEngineContext()
    ;(ec as Record<string, unknown>).loadBookChapterText = (
      book: string,
      chapter: string,
      lang: string,
    ) => loader(book, chapter, lang)
    return ec
  }

  it('loads chapter text via loadBookChapterText', () => {
    expect(
      resolveFlow(
        flow({ type: 'prose', book: 'my-book', chapter: 'ch1' }),
        makeContext(),
        ecWithBookLoader(() => ({ 'pt-BR': 'Loaded chapter' })),
      ),
    ).toEqual([{ type: 'prose', text: { primary: 'Loaded chapter' } }])
  })

  it('template-substitutes chapter field before loading', () => {
    let requested = ''
    resolveFlow(
      flow({ type: 'prose', book: 'my-book', chapter: '{{chapterId}}' }),
      makeContext({ templateVars: { chapterId: 'resolved-chapter' } }),
      ecWithBookLoader((_b, ch) => {
        requested = ch
        return { 'pt-BR': 'x' }
      }),
    )
    expect(requested).toBe('resolved-chapter')
  })

  it('omits section when resolved chapter is empty', () => {
    expect(
      resolveFlow(
        flow({ type: 'prose', book: 'my-book', chapter: '{{chapterId}}' }),
        makeContext({ templateVars: { chapterId: '' } }),
        ecWithBookLoader(() => ({ 'pt-BR': 'text' })),
      ),
    ).toEqual([])
  })

  it('omits section when loadBookChapterText returns undefined', () => {
    expect(
      resolveFlow(
        flow({ type: 'prose', book: 'my-book', chapter: 'missing' }),
        makeContext(),
        ecWithBookLoader(() => undefined),
      ),
    ).toEqual([])
  })

  it('supports book-default language fallback policy', () => {
    const ec = makeEngineContext()
    ec.language = 'en-US'
    ec.contentLanguage = 'en-US'
    ec.localize = (text) => {
      if (typeof text === 'string') return { primary: text }
      return { primary: text['en-US'] ?? text['pt-BR'] ?? '' }
    }
    ;(ec as Record<string, unknown>).getBookLanguages = () => ['pt-BR']
    ;(ec as Record<string, unknown>).loadBookChapterText = (
      _book: string,
      _chapter: string,
      lang: string,
    ) => (lang === 'pt-BR' ? { 'pt-BR': 'Texto carregado' } : undefined)

    expect(
      resolveFlow(
        flow({
          type: 'prose',
          book: 'meditacoes-ligorio',
          chapter: 'capitulo',
          langPolicy: 'book-default',
        }),
        makeContext(),
        ec,
      ),
    ).toEqual([{ type: 'prose', text: { primary: 'Texto carregado' } }])
  })

  it('static prose still works alongside dynamic prose', () => {
    expect(
      resolveFlow(
        flow({ type: 'prose', file: 'key' }, { type: 'prose', book: 'b', chapter: 'c' }),
        makeContext(),
        makeEngineContext({ key: { 'pt-BR': 'Static' } }),
      ),
    ).toEqual([{ type: 'prose', text: { primary: 'Static' } }])
  })
})

// --- resolve steps ---

describe('resolveFlow — resolve steps', () => {
  it('does not crash with resolve steps present', () => {
    const result = resolveFlow(
      flowDef({
        resolve: [{ data: 'liturgical-map', strategy: 'liturgical-day', as: 'meditations' }],
        sections: [{ type: 'heading', text: { 'pt-BR': '{{liturgicalLabel}}' } }],
      }),
      makeContext({ cycleData: { 'liturgical-map': { indexBy: 'fixed', entries: {} } } }),
      makeEngineContext(),
    )
    expect(Array.isArray(result)).toBe(true)
  })
})

// --- CycleData contextKey ---

describe('resolveFlow — CycleData contextKey', () => {
  it('uses contextKey to select entry set', () => {
    const result = resolveFlow(
      flow({ type: 'cycle', data: 'psalter', as: 'psalmody' }),
      makeContext({
        numbering: 'lxx',
        cycleData: {
          psalter: {
            indexBy: 'day-of-month',
            contextKey: 'numbering',
            entries: { lxx: [[90, 91]], mt: [[91, 92]] },
          },
        },
      }),
      makeEngineContext(),
    )
    expect(result).toMatchObject([{ type: 'psalmody' }])
  })
})

// =============================================================================
// Integration tests
// =============================================================================

describe('integration: Rosary — select + repeat from + flow.data', () => {
  const rosaryFlow: FlowDefinition = {
    data: {
      joyful: [
        { name: { 'pt-BR': 'A Anunciação' }, meditation: { 'pt-BR': 'O Anjo Gabriel...' } },
        { name: { 'pt-BR': 'A Visitação' }, meditation: { 'pt-BR': 'Maria visita Isabel...' } },
        { name: { 'pt-BR': 'O Nascimento' }, meditation: { 'pt-BR': 'Jesus nasce...' } },
      ],
      sorrowful: [
        { name: { 'pt-BR': 'Agonia no Horto' }, meditation: { 'pt-BR': 'Jesus ora...' } },
        { name: { 'pt-BR': 'Flagelação' }, meditation: { 'pt-BR': 'Jesus é flagelado...' } },
        { name: { 'pt-BR': 'Coroação de Espinhos' }, meditation: { 'pt-BR': 'Coroam Jesus...' } },
      ],
    },
    sections: [
      { type: 'rubric', text: { 'pt-BR': 'Em nome do Pai...' } },
      {
        type: 'select',
        on: 'dayOfWeek',
        as: 'mysteries',
        label: { 'pt-BR': 'Mistérios' },
        map: {
          '0': 'sorrowful',
          '1': 'joyful',
          '2': 'sorrowful',
          '3': 'joyful',
          '4': 'sorrowful',
          '5': 'sorrowful',
          '6': 'joyful',
        },
        options: [
          { id: 'joyful', label: { 'pt-BR': 'Mistérios Gozosos' } },
          { id: 'sorrowful', label: { 'pt-BR': 'Mistérios Dolorosos' } },
        ],
      },
      {
        type: 'repeat',
        count: 3,
        from: '{{mysteries}}',
        sections: [
          { type: 'heading', text: { 'pt-BR': '{{ordinal}} Mistério: {{name}}' } },
          { type: 'meditation', text: { 'pt-BR': '{{meditation}}' } },
        ],
      },
      { type: 'rubric', text: { 'pt-BR': 'Salve Rainha' } },
    ],
  }

  it('Monday → joyful: picker + 3 mysteries + closing rubric', () => {
    const result = resolveFlow(
      rosaryFlow,
      makeContext({ date: new Date('2026-04-13T12:00:00') }),
      makeEngineContext(),
    )

    expect(result.filter((s) => s.type === 'heading')).toEqual([
      { type: 'heading', text: { primary: 'Primeiro Mistério: A Anunciação' } },
      { type: 'heading', text: { primary: 'Segundo Mistério: A Visitação' } },
      { type: 'heading', text: { primary: 'Terceiro Mistério: O Nascimento' } },
    ])
    expect(result.filter((s) => s.type === 'meditation')).toHaveLength(3)
    expect(result.find((s) => s.type === 'select')).toMatchObject({ selectedId: 'joyful' })
  })

  it('Sunday → sorrowful', () => {
    const result = resolveFlow(
      rosaryFlow,
      makeContext({ date: new Date('2026-04-12T12:00:00') }),
      makeEngineContext(),
    )
    expect(result.find((s) => s.type === 'select')).toMatchObject({ selectedId: 'sorrowful' })
    expect(result.filter((s) => s.type === 'heading')[0]).toMatchObject({
      text: { primary: 'Primeiro Mistério: Agonia no Horto' },
    })
  })

  it('selectOverrides switches mysteries', () => {
    const result = resolveFlow(
      rosaryFlow,
      makeContext({
        date: new Date('2026-04-13T12:00:00'),
        selectOverrides: { mysteries: 'sorrowful' },
      }),
      makeEngineContext(),
    )
    expect(result.find((s) => s.type === 'select')).toMatchObject({ selectedId: 'sorrowful' })
    expect(result.filter((s) => s.type === 'heading')[0]).toMatchObject({
      text: { primary: 'Primeiro Mistério: Agonia no Horto' },
    })
  })
})

describe('integration: Confession — manual select', () => {
  it('renders picker with both modes', () => {
    expect(
      resolveFlow(
        flow({
          type: 'select',
          label: { 'pt-BR': 'Modo' },
          default: 'prepare',
          options: [
            {
              id: 'prepare',
              label: { 'pt-BR': 'Preparação' },
              sections: [
                { type: 'heading', text: { 'pt-BR': 'Examine' } },
                { type: 'rubric', text: { 'pt-BR': 'Reflect' } },
              ],
            },
            {
              id: 'thanks',
              label: { 'pt-BR': 'Ação de Graças' },
              sections: [{ type: 'heading', text: { 'pt-BR': 'Thanks' } }],
            },
          ],
        }),
        makeContext(),
        makeEngineContext(),
      ),
    ).toEqual([
      {
        type: 'select',
        label: { primary: 'Modo' },
        overrideKey: 'prepare',
        selectedId: 'prepare',
        options: [
          {
            id: 'prepare',
            label: { primary: 'Preparação' },
            sections: [
              { type: 'heading', text: { primary: 'Examine' } },
              { type: 'rubric', label: { primary: 'Reflect' } },
            ],
          },
          {
            id: 'thanks',
            label: { primary: 'Ação de Graças' },
            sections: [],
          },
        ],
      },
    ])
  })
})
