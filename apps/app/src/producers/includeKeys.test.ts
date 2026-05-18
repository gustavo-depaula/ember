import { describe, expect, it } from 'vitest'
import type { RenderedSection } from '@/content/types'
import { collectIncludes, includeKeyFor } from './includeKeys'

// Identity walker — the unit tests pass flat section arrays.
function flatWalk(sections: RenderedSection[]): Iterable<RenderedSection> {
  return sections
}

describe('includeKeyFor', () => {
  it('returns just the ref when no params are passed', () => {
    expect(includeKeyFor('producer/x')).toBe('producer/x')
  })

  it('returns just the ref when params is an empty object', () => {
    expect(includeKeyFor('producer/x', {})).toBe('producer/x')
  })

  it('appends serialized params for non-empty params', () => {
    expect(includeKeyFor('producer/x', { a: 1, b: 'two' })).toMatch(
      /^producer\/x::\{"a":1,"b":"two"\}$/,
    )
  })

  it('different params yield different keys', () => {
    const a = includeKeyFor('producer/x', { rite: 'of' })
    const b = includeKeyFor('producer/x', { rite: 'ef' })
    expect(a).not.toBe(b)
  })

  it('is insertion-order independent (same key for same semantic params)', () => {
    expect(includeKeyFor('producer/x', { a: 1, b: 2 })).toBe(
      includeKeyFor('producer/x', { b: 2, a: 1 }),
    )
  })
})

describe('collectIncludes', () => {
  it('deduplicates includes with identical (ref, params)', () => {
    const sections: RenderedSection[] = [
      { type: 'include', ref: 'producer/a' },
      { type: 'include', ref: 'producer/a' },
    ]
    const out = collectIncludes(sections, flatWalk)
    expect(out).toHaveLength(1)
    expect(out[0]).toEqual({ ref: 'producer/a', params: undefined, key: 'producer/a' })
  })

  it('keeps distinct entries for same ref + different params', () => {
    const sections: RenderedSection[] = [
      { type: 'include', ref: 'producer/x', params: { rite: 'of' } },
      { type: 'include', ref: 'producer/x', params: { rite: 'ef' } },
    ]
    const out = collectIncludes(sections, flatWalk)
    expect(out).toHaveLength(2)
    expect(out[0].params).toEqual({ rite: 'of' })
    expect(out[1].params).toEqual({ rite: 'ef' })
  })

  it('ignores non-include sections', () => {
    const sections: RenderedSection[] = [
      { type: 'divider' },
      { type: 'include', ref: 'producer/x' },
      { type: 'heading', text: { primary: 'h' } },
    ]
    const out = collectIncludes(sections, flatWalk)
    expect(out).toHaveLength(1)
    expect(out[0].ref).toBe('producer/x')
  })

  it('returns an empty list when no includes are present', () => {
    expect(collectIncludes([{ type: 'divider' }], flatWalk)).toEqual([])
  })
})
