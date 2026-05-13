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

function makeContext(overrides: Partial<FlowContext> = {}): FlowContext {
  return { date: new Date('2026-05-01'), ...overrides }
}

function flow(...sections: FlowSection[]): FlowDefinition {
  return { sections }
}

describe('offering block resolution', () => {
  it('resolves to a rendered-offering with mode and defaults', () => {
    const result = resolveFlow(
      flow({
        type: 'offering',
        mode: 'intercessory',
        default: 'all-active',
        show: 'list',
        label: { 'en-US': 'For our intentions' },
      }),
      makeContext(),
      makeEngineContext({ supportsMovements: true }),
    )

    expect(result).toEqual([
      {
        type: 'rendered-offering',
        mode: 'intercessory',
        default: 'all-active',
        show: 'list',
        label: { primary: 'For our intentions' },
      },
    ])
  })

  it('falls back to default values when fields are omitted', () => {
    const result = resolveFlow(
      flow({ type: 'offering', mode: 'thanksgiving' }),
      makeContext(),
      makeEngineContext({ supportsMovements: true }),
    )

    expect(result[0]).toMatchObject({
      type: 'rendered-offering',
      mode: 'thanksgiving',
      default: 'pinned',
      show: 'list',
    })
  })

  it('skips emission when host does not support movements', () => {
    const result = resolveFlow(
      flow({ type: 'offering', mode: 'intercessory' }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })
})

describe('capture-movement block resolution', () => {
  it('resolves to a rendered-capture-movement with prompt and defaults', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-movement',
        kind: 'intention',
        prompt: { 'en-US': 'Anything new this morning?' },
        multi: true,
        optional: true,
        defaults: { cadence: 'goal' },
      }),
      makeContext(),
      makeEngineContext({ supportsMovements: true }),
    )

    expect(result).toEqual([
      {
        type: 'rendered-capture-movement',
        kind: 'intention',
        prompt: { primary: 'Anything new this morning?' },
        multi: true,
        optional: true,
        defaultCadence: 'goal',
      },
    ])
  })

  it('falls back to multi=false, optional=false, cadence=perpetual when omitted', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-movement',
        kind: 'intention',
        prompt: { 'en-US': 'For whom?' },
      }),
      makeContext(),
      makeEngineContext({ supportsMovements: true }),
    )

    expect(result[0]).toMatchObject({
      type: 'rendered-capture-movement',
      multi: false,
      optional: false,
      defaultCadence: 'perpetual',
    })
  })

  it('thanksgiving capture has no cadence default', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-movement',
        kind: 'thanksgiving',
        prompt: { 'en-US': 'A grace today?' },
      }),
      makeContext(),
      makeEngineContext({ supportsMovements: true }),
    )

    const block = result[0] as { type: 'rendered-capture-movement'; defaultCadence?: string }
    expect(block.type).toBe('rendered-capture-movement')
    expect(block.defaultCadence).toBeUndefined()
  })

  it('renders a no-op text when host does not support movements', () => {
    const result = resolveFlow(
      flow({
        type: 'capture-movement',
        kind: 'intention',
        prompt: { 'en-US': 'Anything?' },
      }),
      makeContext(),
      makeEngineContext(),
    )
    expect(result).toEqual([])
  })
})
