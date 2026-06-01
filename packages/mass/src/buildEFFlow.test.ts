import { describe, expect, it } from 'vitest'
import { buildEFFlow } from './buildEFFlow'

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

// Collect every `proper` slot the builder emits, at any depth.
function properSlots(sections: unknown[]): string[] {
  const slots: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const obj = node as Record<string, unknown>
    if (obj.type === 'proper' && typeof obj.slot === 'string') slots.push(obj.slot)
    for (const value of Object.values(obj)) walk(value)
  }
  sections.forEach(walk)
  return slots
}

// The three view options, by id.
function viewOption(id: string) {
  const select = buildEFFlow()[0] as {
    options: { id: string; sections: unknown[] }[]
  }
  return select.options.find((o) => o.id === id)?.sections ?? []
}

describe('buildEFFlow — EF assembly computed in code', () => {
  it('is a single view select (Full Mass / Propers Only / Readings Only)', () => {
    const [select] = buildEFFlow() as [{ type: string; options: { id: string }[] }]
    expect(select.type).toBe('select')
    expect(select.options.map((o) => o.id)).toEqual([
      'extraordinary',
      'extraordinary-propers',
      'extraordinary-readings',
    ])
  })

  it('Full Mass calls the Order-of-Mass content fragments in sequence', () => {
    expect(callRefs(viewOption('extraordinary'))).toEqual([
      'ef-asperges',
      'ef-prayers-at-the-foot-of-the-altar',
      'ef-kyrie',
      'ef-gloria',
      'ef-liturgy-of-the-word',
      'ef-credo',
      'ef-offertory',
      'ef-preface',
      'ef-canon-of-the-mass',
      'ef-communion-rite',
      'ef-dismissal',
      'ef-last-gospel',
      'ef-leonine-prayers',
    ])
  })

  it('Propers Only emits the ten day-proper slots in liturgical order', () => {
    expect(properSlots(viewOption('extraordinary-propers'))).toEqual([
      'introit',
      'collect',
      'epistle',
      'gradual',
      'gospel',
      'offertory',
      'secret',
      'preface',
      'communion',
      'postcommunion',
    ])
  })

  it('Readings Only is just epistle / gradual / gospel', () => {
    expect(properSlots(viewOption('extraordinary-readings'))).toEqual([
      'epistle',
      'gradual',
      'gospel',
    ])
  })

  it('every proper slot is tagged form: ef', () => {
    const allProper = (node: unknown, out: Record<string, unknown>[] = []) => {
      if (!node || typeof node !== 'object') return out
      if (Array.isArray(node)) {
        for (const n of node) allProper(n, out)
        return out
      }
      const obj = node as Record<string, unknown>
      if (obj.type === 'proper') out.push(obj)
      for (const v of Object.values(obj)) allProper(v, out)
      return out
    }
    expect(allProper(buildEFFlow()).every((p) => p.form === 'ef')).toBe(true)
  })
})
