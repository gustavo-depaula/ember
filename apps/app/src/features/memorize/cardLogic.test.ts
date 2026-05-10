import { describe, expect, it } from 'vitest'

import { partitionLinesForCued } from './cardLogic'

describe('partitionLinesForCued', () => {
  const lines = ['L1', 'L2', 'L3', 'L4', 'L5']

  it('mastery 0 hides every line; line 1 is the target', () => {
    expect(partitionLinesForCued(lines, 0)).toEqual({
      visible: [],
      targetLine: 'L1',
      targetLineNumber: 1,
    })
  })

  it('mastery 3 shows lines 1-3; line 4 is the target', () => {
    expect(partitionLinesForCued(lines, 3)).toEqual({
      visible: ['L1', 'L2', 'L3'],
      targetLine: 'L4',
      targetLineNumber: 4,
    })
  })

  it('mastery equal to length: every line visible, no target', () => {
    expect(partitionLinesForCued(lines, 5)).toEqual({
      visible: ['L1', 'L2', 'L3', 'L4', 'L5'],
      targetLine: undefined,
      targetLineNumber: undefined,
    })
  })

  it('mastery beyond length is clamped to length', () => {
    expect(partitionLinesForCued(lines, 99)).toEqual({
      visible: ['L1', 'L2', 'L3', 'L4', 'L5'],
      targetLine: undefined,
      targetLineNumber: undefined,
    })
  })
})
