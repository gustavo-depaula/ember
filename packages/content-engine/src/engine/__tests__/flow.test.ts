import { getLiturgicalDayName } from '@ember/liturgical'
import { afterEach, describe, expect, it } from 'vitest'
import { flow, flowDef, makeContext, makeEngineContext } from '../../__fixtures__/engine'
import { clearDataSources, type DataSource, registerDataSource } from '../../data-sources'
import { type EngineContext, resolveFlow, resolveFlowAsync } from '../../engine'
import type { FlowDefinition } from '../../types'

describe('resolveFlow — collapsible primitive', () => {
  it('wraps resolved sections in a collapsible (defaults closed)', () => {
    const result = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Quiet prayers' },
        sections: [
          { type: 'rubric', text: { 'pt-BR': 'Priest says quietly:' } },
          { type: 'prayer', speaker: 'priest', inline: { 'pt-BR': 'Bendito sejais...' } },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([
      {
        type: 'collapsible',
        title: { primary: 'Quiet prayers' },
        defaultOpen: false,
        sections: [
          { type: 'rubric', label: { primary: 'Priest says quietly:' } },
          {
            type: 'prayer',
            title: { primary: '' },
            text: { primary: 'Bendito sejais...' },
            speaker: 'priest',
          },
        ],
      },
    ])
  })

  it('honors defaultOpen: true', () => {
    const result = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Open by default' },
        defaultOpen: true,
        sections: [{ type: 'rubric', text: { 'pt-BR': 'A note' } }],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect((result[0] as { defaultOpen: boolean }).defaultOpen).toBe(true)
  })

  it('drops a collapsible whose body resolves to nothing', () => {
    const result = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Empty' },
        sections: [],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('uses defaultOpenFrom when the path resolves to a boolean', () => {
    const open = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Glória' },
        defaultOpenFrom: 'celebration.primary.includeGloria',
        defaultOpen: false,
        sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
      }),
      makeContext({ flowData: { celebration: { primary: { includeGloria: true } } } }),
      makeEngineContext(),
    )
    expect((open[0] as { defaultOpen: boolean }).defaultOpen).toBe(true)

    const closed = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Glória' },
        defaultOpenFrom: 'celebration.primary.includeGloria',
        defaultOpen: true,
        sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
      }),
      makeContext({ flowData: { celebration: { primary: { includeGloria: false } } } }),
      makeEngineContext(),
    )
    expect((closed[0] as { defaultOpen: boolean }).defaultOpen).toBe(false)
  })

  it('falls back to defaultOpen when defaultOpenFrom path is missing', () => {
    const result = resolveFlow(
      flow({
        type: 'collapsible',
        title: { 'pt-BR': 'Glória' },
        defaultOpenFrom: 'celebration.primary.includeGloria',
        defaultOpen: true,
        sections: [{ type: 'rubric', text: { 'pt-BR': 'x' } }],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect((result[0] as { defaultOpen: boolean }).defaultOpen).toBe(true)
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

describe('resolveFlow — fragments', () => {
  it('expands a fragment ref into its sections', () => {
    const result = resolveFlow(
      {
        sections: [{ type: 'fragment', ref: 'greeting' }],
        fragments: {
          greeting: [{ type: 'heading', text: { 'pt-BR': 'Olá' } }, { type: 'divider' }],
        },
      },
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Olá' } }, { type: 'divider' }])
  })

  it('returns empty for unknown fragment ref', () => {
    const result = resolveFlow(
      {
        sections: [{ type: 'fragment', ref: 'nonexistent' }],
        fragments: {},
      },
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('supports fragments referencing other fragments', () => {
    const result = resolveFlow(
      {
        sections: [{ type: 'fragment', ref: 'full' }],
        fragments: {
          opening: [{ type: 'heading', text: { 'pt-BR': 'Início' } }],
          closing: [{ type: 'heading', text: { 'pt-BR': 'Fim' } }],
          full: [
            { type: 'fragment', ref: 'opening' },
            { type: 'divider' },
            { type: 'fragment', ref: 'closing' },
          ],
        },
      },
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'heading', text: { primary: 'Início' } },
      { type: 'divider' },
      { type: 'heading', text: { primary: 'Fim' } },
    ])
  })

  it('substitutes templateVars into fragment sections', () => {
    const result = resolveFlow(
      {
        sections: [{ type: 'fragment', ref: 'greeting' }],
        fragments: {
          greeting: [{ type: 'heading', text: { 'pt-BR': 'Olá {{name}}' } }],
        },
      },
      makeContext({ templateVars: { name: 'Maria' } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Olá Maria' } }])
  })

  it('receives templateVars from repeat iterations', () => {
    const result = resolveFlow(
      {
        data: {
          mysteries: [
            { title: { 'pt-BR': 'Primeiro' }, meditation: { 'pt-BR': 'Contemplamos...' } },
            { title: { 'pt-BR': 'Segundo' }, meditation: { 'pt-BR': 'Meditamos...' } },
          ],
        },
        sections: [
          {
            type: 'repeat',
            from: 'mysteries',
            sections: [{ type: 'fragment', ref: 'decade' }],
          },
        ],
        fragments: {
          decade: [
            { type: 'subheading', text: { 'pt-BR': '{{title}}' } },
            { type: 'meditation', text: { 'pt-BR': '{{meditation}}' } },
            { type: 'divider' },
          ],
        },
      },
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'subheading', text: { primary: 'Primeiro' } },
      { type: 'meditation', text: { primary: 'Contemplamos...' } },
      { type: 'divider' },
      { type: 'subheading', text: { primary: 'Segundo' } },
      { type: 'meditation', text: { primary: 'Meditamos...' } },
      { type: 'divider' },
    ])
  })

  it('works inside select options', () => {
    const result = resolveFlow(
      {
        sections: [
          {
            type: 'select',
            on: 'dayOfWeek',
            map: { '0': 'a', '1': 'b' },
            options: [
              {
                id: 'a',
                label: { 'pt-BR': 'A' },
                sections: [{ type: 'fragment', ref: 'content-a' }],
              },
              {
                id: 'b',
                label: { 'pt-BR': 'B' },
                sections: [{ type: 'fragment', ref: 'content-b' }],
              },
            ],
          },
        ],
        fragments: {
          'content-a': [{ type: 'heading', text: { 'pt-BR': 'Sunday' } }],
          'content-b': [{ type: 'heading', text: { 'pt-BR': 'Monday' } }],
        },
      },
      makeContext({ date: new Date(2026, 3, 13) }), // Monday
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'Monday' } }])
  })
})

describe('resolveFlowAsync — load steps via DataSource registry', () => {
  afterEach(() => clearDataSources())

  it('calls a registered source and binds its result to flowData[as]', async () => {
    const fakeSource: DataSource = {
      async load(args, ctx) {
        return { value: `${args.greeting}-${ctx.now().getFullYear()}` }
      },
    }
    registerDataSource('fake', fakeSource)

    const result = await resolveFlowAsync(
      {
        load: [{ as: 'state', source: 'fake', greeting: 'hello' }],
        sections: [{ type: 'rubric', text: { 'pt-BR': '{{state.value}}' } }],
      },
      makeContext({ date: new Date('2026-04-12') }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'hello-2026' } }])
  })

  it('skips load steps with unknown source name', async () => {
    const result = await resolveFlowAsync(
      {
        load: [{ as: 'x', source: 'nonexistent' }],
        sections: [{ type: 'heading', text: { 'pt-BR': 'still here' } }],
      },
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'heading', text: { primary: 'still here' } }])
  })

  it('SourceContext.fetchOwnAsset falls back to cycleData when no engine impl', async () => {
    let captured: unknown
    const recorder: DataSource = {
      async load(_args, ctx) {
        captured = await ctx.fetchOwnAsset('my-data')
        return { ok: true }
      },
    }
    registerDataSource('recorder', recorder)

    await resolveFlowAsync(
      {
        load: [{ as: 'r', source: 'recorder' }],
        sections: [],
      },
      makeContext({ cycleData: { 'my-data': { hello: 'world' } } as never }),
      makeEngineContext(),
    )
    expect(captured).toEqual({ hello: 'world' })
  })
})

describe('resolveFlow — call (parameterized fragment / macro)', () => {
  it('expands a call by substituting args into the fragment body', () => {
    const result = resolveFlow(
      flowDef({
        fragments: {
          greet: [
            {
              type: 'rubric',
              text: { 'pt-BR': 'Olá, {{name}}!' },
            },
          ],
        },
        sections: [
          { type: 'call', ref: 'greet', args: { name: 'Maria' } },
          { type: 'call', ref: 'greet', args: { name: 'José' } },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'rubric', label: { primary: 'Olá, Maria!' } },
      { type: 'rubric', label: { primary: 'Olá, José!' } },
    ])
  })

  it('args override outer flowData/templateVars within the call body', () => {
    const result = resolveFlow(
      flowDef({
        fragments: {
          show: [{ type: 'rubric', text: { 'pt-BR': '{{name}}' } }],
        },
        sections: [{ type: 'call', ref: 'show', args: { name: 'macro-arg' } }],
      }),
      makeContext({ flowData: { name: 'outer-data' }, templateVars: { name: 'outer-tv' } }),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'macro-arg' } }])
  })

  it('returns empty when the macro is not registered', () => {
    const result = resolveFlow(
      flowDef({
        sections: [{ type: 'call', ref: 'missing', args: { x: 1 } }],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })

  it('macros can call other macros (recursive expansion)', () => {
    const result = resolveFlow(
      flowDef({
        fragments: {
          inner: [{ type: 'rubric', text: { 'pt-BR': '{{value}}' } }],
          outer: [{ type: 'call', ref: 'inner', args: { value: 'from-outer' } }],
        },
        sections: [{ type: 'call', ref: 'outer' }],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([{ type: 'rubric', label: { primary: 'from-outer' } }])
  })

  it('passes args as nested objects accessible via dotted paths', () => {
    const result = resolveFlow(
      flowDef({
        fragments: {
          mystery: [
            { type: 'heading', text: { 'pt-BR': '{{m.title}}' } },
            { type: 'rubric', text: { 'pt-BR': '{{m.intention}}' } },
          ],
        },
        sections: [
          {
            type: 'call',
            ref: 'mystery',
            args: { m: { title: 'A Anunciação', intention: 'Pela humildade' } },
          },
        ],
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([
      { type: 'heading', text: { primary: 'A Anunciação' } },
      { type: 'rubric', label: { primary: 'Pela humildade' } },
    ])
  })
})
