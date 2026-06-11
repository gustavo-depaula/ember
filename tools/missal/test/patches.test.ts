import { describe, expect, it } from 'vitest'
import { applyPatches, assertNoStalePatches, type LoadedPatch } from '../src/patches'

function patch(over: Partial<LoadedPatch>): LoadedPatch {
  return {
    match: 'Paalvra do Senhor',
    replace: 'Palavra do Senhor',
    note: 'upstream typo',
    source: 'test.json',
    applied: 0,
    ...over,
  }
}

describe('applyPatches', () => {
  it('replaces all occurrences and counts applications', () => {
    const p = patch({})
    const out = applyPatches([p], 'Paalvra do Senhor. … Paalvra do Senhor.', {
      lang: 'pt-BR',
      id: 'tempore.advent.week-1.sunday',
    })
    expect(out).toBe('Palavra do Senhor. … Palavra do Senhor.')
    expect(p.applied).toBe(1)
  })

  it('respects lang and scope restrictions', () => {
    const langScoped = patch({ lang: 'la' })
    expect(applyPatches([langScoped], 'Paalvra do Senhor', { lang: 'pt-BR', id: 'x' })).toBe(
      'Paalvra do Senhor',
    )

    const idScoped = patch({ scope: 'sanctoral.' })
    expect(applyPatches([idScoped], 'Paalvra do Senhor', { lang: 'pt-BR', id: 'tempore.x' })).toBe(
      'Paalvra do Senhor',
    )
    expect(applyPatches([idScoped], 'Paalvra do Senhor', { lang: 'pt-BR', id: 'sanctoral.01-20' })).toBe(
      'Palavra do Senhor',
    )
  })
})

describe('assertNoStalePatches', () => {
  it('throws listing stale patches', () => {
    const fresh = patch({ applied: 3 })
    const stale = patch({ match: 'nunca aparece', applied: 0 })
    expect(() => assertNoStalePatches([fresh, stale])).toThrow(/stale patch/)
    expect(() => assertNoStalePatches([fresh])).not.toThrow()
  })
})
