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
})
