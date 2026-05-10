import { describe, expect, it } from 'vitest'

import { resolvePortions, splitBodyLines } from './lines'

describe('splitBodyLines', () => {
  it('splits on newlines and filters empty lines', () => {
    expect(splitBodyLines('a\nb\nc')).toEqual(['a', 'b', 'c'])
    expect(splitBodyLines('a\n\nb')).toEqual(['a', 'b'])
  })

  it('drops whitespace-only lines', () => {
    expect(splitBodyLines('a\n  \nb')).toEqual(['a', 'b'])
  })

  it('preserves leading/trailing whitespace within a line', () => {
    expect(splitBodyLines('  hello  \nworld')).toEqual(['  hello  ', 'world'])
  })

  it('returns empty array for empty input', () => {
    expect(splitBodyLines('')).toEqual([])
    expect(splitBodyLines('\n\n')).toEqual([])
  })

  it('returns single line when no newlines', () => {
    expect(splitBodyLines('one line')).toEqual(['one line'])
  })
})

describe('resolvePortions', () => {
  const body = ['L1', 'L2', 'L3', 'L4', 'L5']

  it('returns the whole body as one portion when portions is undefined', () => {
    const result = resolvePortions(body, undefined)
    expect(result).toEqual([
      { lines: ['L1', 'L2', 'L3', 'L4', 'L5'], label: undefined, startLine: 1, endLine: 5 },
    ])
  })

  it('returns the whole body as one portion when portions is empty array', () => {
    const result = resolvePortions(body, [])
    expect(result).toEqual([
      { lines: ['L1', 'L2', 'L3', 'L4', 'L5'], label: undefined, startLine: 1, endLine: 5 },
    ])
  })

  it('respects author-marked portions inclusively', () => {
    const portions = [
      { lines: [1, 2] as [number, number] },
      { lines: [3, 5] as [number, number], label: { 'en-US': 'Latter half' } },
    ]
    expect(resolvePortions(body, portions)).toEqual([
      { lines: ['L1', 'L2'], label: undefined, startLine: 1, endLine: 2 },
      { lines: ['L3', 'L4', 'L5'], label: { 'en-US': 'Latter half' }, startLine: 3, endLine: 5 },
    ])
  })

  it('throws when portions leave a gap', () => {
    expect(() =>
      resolvePortions(body, [
        { lines: [1, 2] as [number, number] },
        { lines: [4, 5] as [number, number] },
      ]),
    ).toThrow(/portions/i)
  })

  it('throws when portions overlap', () => {
    expect(() =>
      resolvePortions(body, [
        { lines: [1, 3] as [number, number] },
        { lines: [3, 5] as [number, number] },
      ]),
    ).toThrow(/portions/i)
  })

  it('throws when a portion exceeds body length', () => {
    expect(() => resolvePortions(body, [{ lines: [1, 6] as [number, number] }])).toThrow(
      /portions/i,
    )
  })

  it('throws when first portion does not start at line 1', () => {
    expect(() => resolvePortions(body, [{ lines: [2, 5] as [number, number] }])).toThrow(
      /portions/i,
    )
  })

  it('throws when a portion has start > end', () => {
    expect(() => resolvePortions(body, [{ lines: [3, 2] as [number, number] }])).toThrow(
      /portions/i,
    )
  })
})
