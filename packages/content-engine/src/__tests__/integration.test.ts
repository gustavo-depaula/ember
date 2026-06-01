import { describe, expect, it } from 'vitest'
import {
  flow,
  liguoriFlowFixture,
  liguoriLiturgicalMapFixture,
  makeContext,
  makeEngineContext,
} from '../__fixtures__/engine'
import { type EngineContext, resolveFlow, resolveFlowAsync } from '../engine'
import type { FlowDefinition } from '../types'

describe('celebration-banner — title rendering', () => {
  // Ferial titles arrive pre-synthesized from ember-extra's refine.py;
  // the engine no longer transforms them. These tests assert pass-through.

  it('passes through Sunday + solemnity titles unchanged', () => {
    const result = resolveFlow(
      flow({ type: 'celebration-banner', from: 'celebration.primary' }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              title: { 'pt-BR': 'QUINTO DOMINGO DA PÁSCOA' },
              season: 'easter',
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const banner = result[0] as { type: 'celebration-banner'; title: { primary: string } }
    expect(banner.title.primary).toBe('QUINTO DOMINGO DA PÁSCOA')
  })

  it('passes through OT weekday titles unchanged (already natural)', () => {
    const result = resolveFlow(
      flow({ type: 'celebration-banner', from: 'celebration.primary' }),
      makeContext({
        flowData: {
          celebration: {
            primary: {
              title: { 'pt-BR': 'Terça-feira da 29ª Semana do Tempo Comum' },
              season: 'ordinary-time',
            },
          },
        },
      }),
      makeEngineContext(),
    )
    const banner = result[0] as { type: 'celebration-banner'; title: { primary: string } }
    expect(banner.title.primary).toBe('Terça-feira da 29ª Semana do Tempo Comum')
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
  it('renders picker with every branch materialized (lazy network fetch is deferred to preprocessFlow per branch)', () => {
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
            sections: [{ type: 'heading', text: { primary: 'Thanks' } }],
          },
        ],
      },
    ])
  })
})

// --- Fragments ---
