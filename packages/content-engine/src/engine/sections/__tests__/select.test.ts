import { describe, expect, it } from 'vitest'
import { flow, makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { resolveFlow } from '../../../engine'
import type { FlowSection, RepeatEntry } from '../../../types'

describe('resolveFlow — pickerStyle: cards', () => {
  it('passes pickerStyle through and derives an excerpt per option', () => {
    const result = resolveFlow(
      flow({
        type: 'options',
        label: { 'pt-BR': 'Eucharistic Prayer' },
        pickerStyle: 'cards',
        options: [
          {
            id: 'ep2',
            label: { 'pt-BR': 'EP II' },
            sections: [
              { type: 'rubric', text: { 'pt-BR': 'Note about EP II' } },
              {
                type: 'prayer',
                speaker: 'priest',
                inline: { 'pt-BR': 'You are indeed Holy, Lord' },
              },
            ],
          },
          {
            id: 'ep3',
            label: { 'pt-BR': 'EP III' },
            sections: [
              {
                type: 'prayer',
                speaker: 'priest',
                inline: { 'pt-BR': 'You are indeed Holy, O Lord' },
              },
            ],
          },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toMatchObject([
      {
        type: 'options',
        pickerStyle: 'cards',
        options: [
          { id: 'ep2', excerpt: { primary: 'You are indeed Holy, Lord' } },
          { id: 'ep3', excerpt: { primary: 'You are indeed Holy, O Lord' } },
        ],
      },
    ])
  })

  it('omits pickerStyle and excerpt when not requested (default chips)', () => {
    const result = resolveFlow(
      flow({
        type: 'options',
        label: { 'pt-BR': 'Pick' },
        options: [
          {
            id: 'a',
            label: { 'pt-BR': 'A' },
            sections: [{ type: 'prayer', speaker: 'priest', inline: { 'pt-BR': 'A text' } }],
          },
          {
            id: 'b',
            label: { 'pt-BR': 'B' },
            sections: [{ type: 'prayer', speaker: 'priest', inline: { 'pt-BR': 'B text' } }],
          },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )
    const widget = result[0] as { pickerStyle?: string; options: Array<{ excerpt?: unknown }> }
    expect(widget.pickerStyle).toBeUndefined()
    expect(widget.options.every((o) => o.excerpt === undefined)).toBe(true)
  })
})

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

// --- select: compound on ---

describe('resolveFlow — select: compound on', () => {
  const compoundSelect: FlowSection = {
    type: 'select',
    on: ['dayOfWeek', 'liturgicalSeason'],
    label: { 'pt-BR': 'Mistérios' },
    map: {
      '0:advent': 'gozosos',
      '0:christmas': 'gozosos',
      '0:lent': 'dolorosos',
      '0:easter': 'gloriosos',
      '0:post-pentecost': 'gloriosos',
      '1': 'gozosos',
      '2': 'dolorosos',
      '3': 'gloriosos',
    },
    default: 'gozosos',
    options: [
      {
        id: 'gozosos',
        label: { 'pt-BR': 'Mistérios Gozosos' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Gozosos' } }],
      },
      {
        id: 'dolorosos',
        label: { 'pt-BR': 'Mistérios Dolorosos' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Dolorosos' } }],
      },
      {
        id: 'gloriosos',
        label: { 'pt-BR': 'Mistérios Gloriosos' },
        sections: [{ type: 'heading', text: { 'pt-BR': 'Gloriosos' } }],
      },
    ],
  }

  it('compound match on Sunday + season', () => {
    // Sunday in Lent → dolorosos (compound key "0:lent")
    const result = resolveFlow(
      flow(compoundSelect),
      makeContext({ date: new Date(2026, 2, 1) }), // Sunday March 1 2026 = Lent
      makeEngineContext(),
    )
    expect(result).toMatchObject([{ type: 'select', selectedId: 'dolorosos' }])
  })

  it('falls back to shorter key on weekday', () => {
    // Monday → gozosos (simple key "1", no compound needed)
    const result = resolveFlow(
      flow(compoundSelect),
      makeContext({ date: new Date(2026, 3, 13) }), // Monday April 13 2026
      makeEngineContext(),
    )
    expect(result).toMatchObject([{ type: 'select', selectedId: 'gozosos' }])
  })

  it('falls to default when no key matches', () => {
    // Saturday (6) has no map entry → falls to default "gozosos"
    const result = resolveFlow(
      flow(compoundSelect),
      makeContext({ date: new Date(2026, 3, 11) }), // Saturday April 11 2026
      makeEngineContext(),
    )
    expect(result).toMatchObject([{ type: 'select', selectedId: 'gozosos' }])
  })

  it('silent compound select emits only selected sections', () => {
    const silent: FlowSection = {
      type: 'select',
      on: ['dayOfWeek', 'liturgicalSeason'],
      map: {
        '0:easter': 'gloriosos',
        '0:lent': 'dolorosos',
        '1': 'gozosos',
      },
      default: 'gozosos',
      options: [
        {
          id: 'gozosos',
          label: { 'pt-BR': 'G' },
          sections: [{ type: 'heading', text: { 'pt-BR': 'Gozosos' } }],
        },
        {
          id: 'dolorosos',
          label: { 'pt-BR': 'D' },
          sections: [{ type: 'heading', text: { 'pt-BR': 'Dolorosos' } }],
        },
        {
          id: 'gloriosos',
          label: { 'pt-BR': 'Gl' },
          sections: [{ type: 'heading', text: { 'pt-BR': 'Gloriosos' } }],
        },
      ],
    }
    // Monday → gozosos, emitted directly (no label = silent)
    const result = resolveFlow(
      flow(silent),
      makeContext({ date: new Date(2026, 3, 13) }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Gozosos' } }])
  })
})

// --- repeat from ---

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

describe('resolveFlow — select with from-data (celebration picker)', () => {
  const celebrations = [
    { id: 'tempore.lords-supper', title: 'Mass of the Lords Supper', rite: 'lords-supper' },
    { id: 'tempore.chrism-mass', title: 'Chrism Mass', rite: 'chrism-mass' },
  ]

  it('renders a chip-header select when multiple items exist', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        label: { 'pt-BR': 'Liturgia de Hoje' },
        hideIfSingle: true,
        body: [{ type: 'heading', text: { 'pt-BR': '{{celebration.title}}' } }],
      }),
      makeContext({ flowData: { day: { celebrations } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([
      {
        type: 'select',
        label: { primary: 'Liturgia de Hoje' },
        overrideKey: 'celebration',
        selectedId: 'tempore.lords-supper',
        options: [
          {
            id: 'tempore.lords-supper',
            label: { primary: 'Mass of the Lords Supper' },
            sections: [{ type: 'heading', text: { primary: 'Mass of the Lords Supper' } }],
          },
          {
            id: 'tempore.chrism-mass',
            label: { primary: 'Chrism Mass' },
            sections: [],
          },
        ],
      },
    ])
  })

  it('hides the picker and renders body inline when hideIfSingle and one item', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        label: { 'pt-BR': 'Liturgia' },
        hideIfSingle: true,
        body: [{ type: 'heading', text: { 'pt-BR': '{{celebration.title}}' } }],
      }),
      makeContext({ flowData: { day: { celebrations: [celebrations[0]] } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Mass of the Lords Supper' } }])
  })

  it('honors selectOverrides[as] to pick a non-default item', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        label: { 'pt-BR': 'Liturgia' },
        body: [{ type: 'heading', text: { 'pt-BR': '{{celebration.title}}' } }],
      }),
      makeContext({
        flowData: { day: { celebrations } },
        selectOverrides: { celebration: 'tempore.chrism-mass' },
      }),
      makeEngineContext(),
    )
    expect(result[0]).toMatchObject({
      type: 'select',
      selectedId: 'tempore.chrism-mass',
      options: [
        { id: 'tempore.lords-supper', sections: [] },
        {
          id: 'tempore.chrism-mass',
          sections: [{ type: 'heading', text: { primary: 'Chrism Mass' } }],
        },
      ],
    })
  })

  it('returns empty when the array is empty', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        body: [{ type: 'heading', text: { 'pt-BR': 'unused' } }],
      }),
      makeContext({ flowData: { day: { celebrations: [] } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('binds chosen item under flowData[as] for inner select on celebration.rite', () => {
    // The canonical Mass shape: top-level celebration picker → inner select on
    // celebration.rite → per-rite fragment dispatch. The inner select is inside
    // body, so it sees the bound celebration via path access.
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        hideIfSingle: true,
        body: [
          {
            type: 'select',
            on: 'celebration.rite',
            options: [
              {
                id: 'lords-supper',
                label: { 'pt-BR': 'LS' },
                sections: [{ type: 'heading', text: { 'pt-BR': 'Holy Thursday' } }],
              },
              {
                id: 'mass',
                label: { 'pt-BR': 'M' },
                sections: [{ type: 'heading', text: { 'pt-BR': 'Ordinary' } }],
              },
            ],
          },
        ],
      }),
      makeContext({ flowData: { day: { celebrations: [celebrations[0]] } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Holy Thursday' } }])
  })

  it('falls back to first item when no default and no override', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        from: 'day.celebrations',
        as: 'celebration',
        body: [{ type: 'heading', text: { 'pt-BR': '{{celebration.id}}' } }],
      }),
      makeContext({ flowData: { day: { celebrations } } }),
      makeEngineContext(),
    )
    expect(result[0]).toMatchObject({ selectedId: 'tempore.lords-supper' })
  })
})

describe('resolveFlow — select.on with dotted path', () => {
  it('branches on a value reached via path through flowData', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'celebration.rite',
        options: [
          {
            id: 'mass',
            label: { 'pt-BR': 'Mass' },
            sections: [{ type: 'heading', text: { 'pt-BR': 'Ordinary' } }],
          },
          {
            id: 'lords-supper',
            label: { 'pt-BR': 'Lords Supper' },
            sections: [{ type: 'heading', text: { 'pt-BR': 'Holy Thursday' } }],
          },
        ],
      }),
      makeContext({ flowData: { celebration: { rite: 'lords-supper' } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Holy Thursday' } }])
  })

  it('falls through to default when the path is missing', () => {
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'celebration.rite',
        default: 'mass',
        options: [
          {
            id: 'mass',
            label: { 'pt-BR': 'Mass' },
            sections: [{ type: 'heading', text: { 'pt-BR': 'Default' } }],
          },
          {
            id: 'lords-supper',
            label: { 'pt-BR': 'Lords Supper' },
            sections: [{ type: 'heading', text: { 'pt-BR': 'HT' } }],
          },
        ],
      }),
      makeContext({ flowData: {} }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Default' } }])
  })

  it('falls through to default when the resolved value matches no option id', () => {
    // Regression: silent dispatch like `select on celebration.id` should NOT
    // render `options[0]` for any unmatched id — it must fall through to
    // `default`. (Earlier, the resolver picked options[0] as a fallback,
    // which caused the Easter Sunday sequence to render on every Easter
    // weekday.)
    const result = resolveFlow(
      flow({
        type: 'select',
        on: 'celebration.id',
        default: 'none',
        options: [
          {
            id: 'tempore.easter.week-1.sunday',
            label: { 'pt-BR': 'Easter' },
            sections: [{ type: 'heading', text: { 'pt-BR': 'Victimae Paschali' } }],
          },
          {
            id: 'none',
            label: { 'pt-BR': '—' },
            sections: [],
          },
        ],
      }),
      makeContext({ flowData: { celebration: { id: 'tempore.easter.week-5.monday' } } }),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })
})
