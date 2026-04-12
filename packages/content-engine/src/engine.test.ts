import { describe, expect, it } from 'vitest'
import { type EngineContext, type FlowContext, resolveFlow } from './engine'
import type { FlowDefinition, FlowSection } from './types'

// Minimal EngineContext stub — only localize and prose are needed for these tests
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

describe('resolveFlow — options collapsing', () => {
  it('renders all options as pills when multiple have content', () => {
    const result = resolveFlow(
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
      makeEngineContext({
        'slot-a': { 'pt-BR': 'Text A' },
        'slot-b': { 'pt-BR': 'Text B' },
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('options')
    if (result[0].type === 'options') {
      expect(result[0].options).toHaveLength(2)
      expect(result[0].options[0].id).toBe('a')
      expect(result[0].options[1].id).toBe('b')
    }
  })

  it('collapses to bare content when only one option has content', () => {
    const result = resolveFlow(
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
    )

    // Should collapse: no options wrapper, just the prose content
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('prose')
  })

  it('returns empty when no options have content', () => {
    const result = resolveFlow(
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
    )

    expect(result).toHaveLength(0)
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

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('options')
    if (result[0].type === 'options') {
      expect(result[0].options).toHaveLength(2)
      expect(result[0].options[0].id).toBe('a')
      expect(result[0].options[1].id).toBe('c')
    }
  })
})

describe('resolveFlow — prose with resolvedProse', () => {
  it('silently skips missing prose keys when resolvedProse is set', () => {
    const result = resolveFlow(
      flow({ type: 'prose', file: 'exists' }, { type: 'prose', file: 'missing' }),
      makeContext({ resolvedProse: { exists: { 'pt-BR': 'Hello' } } }),
      makeEngineContext(),
    )

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('prose')
    if (result[0].type === 'prose') {
      expect(result[0].text.primary).toBe('Hello')
    }
  })

  it('shows error for missing prose when resolvedProse is not set', () => {
    const result = resolveFlow(
      flow({ type: 'prose', file: 'missing' }),
      makeContext(),
      makeEngineContext(),
    )

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('prose')
    if (result[0].type === 'prose') {
      expect(result[0].text.primary).toContain('Prose not found')
    }
  })
})

describe('resolveFlow — template variable substitution', () => {
  it('substitutes template vars in section text', () => {
    const result = resolveFlow(
      flow({ type: 'heading', text: { 'pt-BR': '{{title}}' } }),
      makeContext({ templateVars: { title: 'Meditation for Today' } }),
      makeEngineContext(),
    )

    expect(result).toHaveLength(1)
    if (result[0].type === 'heading') {
      expect(result[0].text.primary).toBe('Meditation for Today')
    }
  })

  it('substitutes template vars inside options labels', () => {
    const result = resolveFlow(
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
    )

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('options')
    if (result[0].type === 'options') {
      expect(result[0].options[0].label.primary).toBe('First')
      expect(result[0].options[1].label.primary).toBe('Second')
    }
  })
})
