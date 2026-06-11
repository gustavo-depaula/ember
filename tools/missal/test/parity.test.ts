import { describe, expect, it } from 'vitest'
import type { ParsedCorpus } from '../src/parse/types'
import { extractStrings } from '../src/parity/baseline'
import { buildPools, classifyMass } from '../src/parity/classify'
import { parseProvenanceValue } from '../src/parity/provenance'

describe('parseProvenanceValue', () => {
  it('parses category, basename, and anchor', () => {
    const ref = parseProvenanceValue(
      'tempore.advent.week-1.sunday',
      'misal_v2/m_<lang>/tiempos/m_<lang>_tiempos_advnav.html#A010',
    )
    expect(ref).toEqual({
      massId: 'tempore.advent.week-1.sunday',
      category: 'tiempos',
      basename: 'tiempos_advnav',
      anchor: 'A010',
    })
  })

  it('handles anchorless values', () => {
    const ref = parseProvenanceValue('x', 'misal_v2/m_<lang>/santos/m_<lang>_santos_01.html')
    expect(ref?.anchor).toBeUndefined()
    expect(ref?.basename).toBe('santos_01')
  })
})

describe('extractStrings', () => {
  it('collects localized strings, skipping lines subtrees', () => {
    const strings = extractStrings({
      id: 'x',
      title: { la: 'DOMINICA I ADVENTUS', 'pt-BR': 'Primeiro Domingo do Advento' },
      collect: {
        body: {
          plain: { 'pt-BR': 'Ó Deus todo-poderoso, concedei aos vossos fiéis o desejo.' },
          lines: { 'pt-BR': [[{ type: 'text', text: 'should not be collected' }]] },
        },
      },
    })
    expect(strings).toContainEqual({ lang: 'la', text: 'DOMINICA I ADVENTUS' })
    expect(strings).toContainEqual({ lang: 'pt-BR', text: 'Primeiro Domingo do Advento' })
    expect(strings.some((s) => s.text.includes('should not be collected'))).toBe(false)
    expect(strings.some((s) => s.text.includes('todo-poderoso'))).toBe(true)
  })
})

function corpusWith(text: string): ParsedCorpus {
  return {
    files: [
      {
        category: 'tiempos',
        basename: 'tiempos_advnav',
        languages: ['port'],
        blockCounts: { port: 1 },
        hasStructure: true,
        days: [
          {
            id: 'A010',
            category: 'tiempos',
            basename: 'tiempos_advnav',
            estructuraLanguages: ['port'],
            languagesWithContent: ['port'],
            parts: [
              {
                kind: 'slot',
                type: 'x_colecta',
                items: [{ role: 'main', padre: 1, content: { port: { text, segments: [] } } }],
              },
            ],
          },
        ],
      },
    ],
  }
}

const ref = {
  massId: 'tempore.advent.week-1.sunday',
  category: 'tiempos',
  basename: 'tiempos_advnav',
  anchor: 'A010',
}

describe('classifyMass', () => {
  it('buckets exact, casing, punct, and not-found', () => {
    const pools = buildPools(
      corpusWith('Ó Deus todo-poderoso, concedei aos vossos fiéis o desejo. “Vinde, Senhor!”'),
    )
    const mass = {
      id: ref.massId,
      path: 'x',
      strings: [
        { lang: 'pt-BR' as const, text: 'Ó Deus todo-poderoso, concedei aos vossos fiéis o desejo.' },
        { lang: 'pt-BR' as const, text: 'ó deus TODO-PODEROSO, concedei aos vossos fiéis o desejo.' },
        { lang: 'pt-BR' as const, text: '"Vinde, Senhor!"' },
        { lang: 'pt-BR' as const, text: 'Texto que não existe em lugar nenhum do corpus.' },
      ],
    }
    const result = classifyMass(mass, ref, pools)
    expect(result.buckets.matched).toBe(1)
    expect(result.buckets.casing).toBe(1)
    expect(result.buckets.punct).toBe(1)
    expect(result.buckets['not-found']).toBe(1)
    expect(result.status).toBe('partial')
    expect(result.misses[0].text).toContain('não existe')
  })

  it('reports missing-day when no pool exists', () => {
    const pools = buildPools(corpusWith('irrelevant'))
    const result = classifyMass(
      { id: 'y', path: 'y', strings: [] },
      { ...ref, basename: 'tiempos_unknown' },
      pools,
    )
    expect(result.status).toBe('missing-day')
  })

  it('reports no-provenance without a ref', () => {
    const pools = buildPools(corpusWith('irrelevant'))
    const result = classifyMass({ id: 'z', path: 'z', strings: [] }, undefined, pools)
    expect(result.status).toBe('no-provenance')
  })
})
