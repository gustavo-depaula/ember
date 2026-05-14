import { describe, expect, it } from 'vitest'
import { type EngineContext, type FlowContext, resolveFlow } from './engine'
import type { FlowDefinition, FlowSection } from './types'

function makeEngineContext(overrides: Partial<EngineContext> = {}): EngineContext {
  return {
    language: 'en-US',
    contentLanguage: 'en-US',
    localize: (text) => {
      if (typeof text === 'string') return { primary: text }
      return { primary: text['en-US'] ?? '' }
    },
    localizeUI: (text) => text['en-US'] ?? '',
    t: (key) => key,
    parsePsalmRef: () => ({ book: 'psalms', chapter: 1, numbering: 'hebrew' }) as never,
    parseTrackEntry: () => [],
    prayers: {},
    canticles: {},
    prose: {},
    ...overrides,
  }
}

function makeContext(): FlowContext {
  return { date: new Date('2026-05-01') }
}

function flow(...sections: FlowSection[]): FlowDefinition {
  return { sections }
}

describe('capture-resolution block', () => {
  it('resolves with computed window and prompt', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-resolution',
        level: 'daily',
        for: 'next',
        prompt: { 'en-US': 'One concrete resolution for tomorrow.' },
      }),
      makeContext(),
      makeEngineContext({
        resolutions: {
          active: () => undefined,
          pending: () => undefined,
        },
        windowFor: (_, _f) => ({ starts_at: 1000, ends_at: 2000 }),
      }),
    )

    expect(result[0]).toMatchObject({
      type: 'rendered-capture-resolution',
      level: 'daily',
      forward: 'next',
      prompt: { primary: 'One concrete resolution for tomorrow.' },
      window: { starts_at: 1000, ends_at: 2000 },
      optional: false,
    })
  })

  it('falls back to no-op when host lacks resolution support', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-resolution',
        level: 'daily',
        prompt: { 'en-US': 'x' },
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })
})

describe('review-resolution block', () => {
  function ctx(active?: { id: string; text: string }, pending?: { id: string; text: string }) {
    return makeEngineContext({
      resolutions: {
        active: () => (active ? { ...active, level: 'daily' } : undefined),
        pending: () => (pending ? { ...pending, level: 'daily' } : undefined),
      },
      windowFor: () => ({ starts_at: 0, ends_at: 0 }),
    })
  }

  it('returns rendered-review-resolution with the active resolution', () => {
    const result = resolveFlow(
      flow({
        type: 'review-resolution',
        mode: 'show',
        target: 'active-daily',
      }),
      makeContext(),
      ctx({ id: 'r1', text: "Today's intent" }),
    )
    expect(result[0]).toMatchObject({
      type: 'rendered-review-resolution',
      mode: 'show',
      target: 'active-daily',
      resolution: { id: 'r1', text: "Today's intent", level: 'daily' },
    })
  })

  it('returns the block with undefined resolution when no match', () => {
    const result = resolveFlow(
      flow({ type: 'review-resolution', mode: 'review', target: 'pending-daily' }),
      makeContext(),
      ctx(),
    )
    const block = result[0] as { resolution?: unknown }
    expect(block.resolution).toBeUndefined()
  })

  it('skips emission when skip_if_none and no match', () => {
    const result = resolveFlow(
      flow({
        type: 'review-resolution',
        target: 'pending-daily',
        skip_if_none: true,
      }),
      makeContext(),
      ctx(),
    )
    expect(result).toEqual([])
  })

  it('omits prompt when mode=show', () => {
    const result = resolveFlow(
      flow({
        type: 'review-resolution',
        mode: 'show',
        target: 'active-daily',
        prompt: { 'en-US': 'Did you keep this?' },
      }),
      makeContext(),
      ctx({ id: 'r1', text: 'x' }),
    )
    const block = result[0] as { prompt?: unknown }
    expect(block.prompt).toBeUndefined()
  })

  it('defaults outcomes to all three and allow_notes to true', () => {
    const result = resolveFlow(
      flow({ type: 'review-resolution', target: 'active-daily' }),
      makeContext(),
      ctx({ id: 'r1', text: 'x' }),
    )
    expect(result[0]).toMatchObject({
      outcomes: ['kept', 'partial', 'broken'],
      allow_notes: true,
    })
  })
})
