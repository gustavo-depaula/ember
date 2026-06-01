import { describe, expect, it } from 'vitest'
import { buildMassFlow } from './buildMassFlow'
import type { DayLiturgies } from './types'

// Collect every `call` ref the builder emits, at any depth.
function callRefs(sections: unknown[]): string[] {
  const refs: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const obj = node as Record<string, unknown>
    if (obj.type === 'call' && typeof obj.ref === 'string') refs.push(obj.ref)
    for (const value of Object.values(obj)) walk(value)
  }
  sections.forEach(walk)
  return refs
}

// Collect every `choice-rich-text` slot the builder emits, at any depth.
function slots(sections: unknown[]): string[] {
  const out: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const obj = node as Record<string, unknown>
    if (obj.type === 'choice-rich-text' && typeof obj.slot === 'string') out.push(obj.slot)
    for (const value of Object.values(obj)) walk(value)
  }
  sections.forEach(walk)
  return out
}

// The View select wrapping a normal Mass body, if present.
function viewSelect(
  sections: unknown[],
): { options: { id: string; sections: unknown[] }[] } | undefined {
  let found: { options: { id: string; sections: unknown[] }[] } | undefined
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const obj = node as Record<string, unknown>
    if (obj.type === 'select' && (obj.as === 'ofView' || obj.default === 'ordinary')) {
      found = obj as never
    }
    for (const value of Object.values(obj)) walk(value)
  }
  sections.forEach(walk)
  return found
}

function day(rite: string, season?: string): DayLiturgies {
  return {
    celebrations: [
      { id: 'x', title: {}, rite, rank: null, primary: { id: 'p', season }, alternates: [] },
    ],
    ordinary: {},
    cycle: 'A',
  } as unknown as DayLiturgies
}

describe('buildMassFlow — assembly computed in code', () => {
  it('dispatches the rite in code (Easter Vigil → its body, not the Order of Mass)', () => {
    const refs = callRefs(buildMassFlow(day('easter-vigil', 'easter')))
    expect(refs).toContain('of-easter-vigil-rite-body')
    expect(refs).not.toContain('of-introductory-rites')
  })

  it('a normal Mass calls the Order of Mass content fragments', () => {
    const refs = callRefs(buildMassFlow(day('mass', 'ordinary-time')))
    expect(refs).toEqual(
      expect.arrayContaining([
        'of-introductory-rites',
        'of-liturgy-of-the-word',
        'of-liturgy-of-the-eucharist',
        'of-communion-rite',
        'of-dismissal',
      ]),
    )
  })

  it('computes the seasonal blessing instead of a 6-way select', () => {
    expect(callRefs(buildMassFlow(day('mass', 'lent')))).toContain('of-blessing-lent')
    expect(callRefs(buildMassFlow(day('mass', 'easter')))).toContain('of-blessing-easter')
    // Seasons without a proper blessing (e.g. Holy Week) and missing seasons
    // fall back to the general blessing.
    expect(callRefs(buildMassFlow(day('mass', 'holy-week')))).toContain('of-blessing-default')
    expect(callRefs(buildMassFlow(day('mass', undefined)))).toContain('of-blessing-default')
  })

  it('wraps a normal Mass in a View switcher (Full Mass / Readings Only)', () => {
    const view = viewSelect(buildMassFlow(day('mass', 'ordinary-time')))
    expect(view).toBeDefined()
    expect(view!.options.map((o) => o.id)).toEqual(['ordinary', 'ordinary-readings'])
  })

  it('the Readings Only view exposes the Lectionary slots, cycle-bound', () => {
    const view = viewSelect(buildMassFlow(day('mass', 'ordinary-time')))!
    const readings = view.options.find((o) => o.id === 'ordinary-readings')!
    expect(slots(readings.sections)).toEqual([
      'readings.{{day.cycle}}.firstReading',
      'readings.{{day.cycle}}.responsorialPsalm',
      'readings.{{day.cycle}}.secondReading',
      'readings.{{day.cycle}}.sequentia',
      'readings.{{day.cycle}}.gospelAcclamation',
      'readings.{{day.cycle}}.gospel',
    ])
  })

  it('special rites have no View switcher (Easter Vigil renders its own body)', () => {
    expect(viewSelect(buildMassFlow(day('easter-vigil', 'easter')))).toBeUndefined()
  })
})
