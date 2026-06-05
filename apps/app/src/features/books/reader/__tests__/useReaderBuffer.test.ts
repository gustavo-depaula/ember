import { describe, expect, test } from 'vitest'
import { bufferWindowIds } from '../useReaderBuffer'

const leaves = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('bufferWindowIds', () => {
  test('returns all-empty when currentChapterId is undefined', () => {
    expect(bufferWindowIds(leaves, undefined)).toEqual({})
  })

  test('returns only curId when current chapter is not in leaves', () => {
    expect(bufferWindowIds(leaves, 'missing')).toEqual({ curId: 'missing' })
  })

  test('first chapter has no prev', () => {
    expect(bufferWindowIds(leaves, 'a')).toEqual({
      prevId: undefined,
      curId: 'a',
      nextId: 'b',
    })
  })

  test('middle chapter has both prev and next', () => {
    expect(bufferWindowIds(leaves, 'b')).toEqual({
      prevId: 'a',
      curId: 'b',
      nextId: 'c',
    })
  })

  test('last chapter has no next', () => {
    expect(bufferWindowIds(leaves, 'd')).toEqual({
      prevId: 'c',
      curId: 'd',
      nextId: undefined,
    })
  })

  test('single-leaf book has neither prev nor next', () => {
    expect(bufferWindowIds([{ id: 'only' }], 'only')).toEqual({
      prevId: undefined,
      curId: 'only',
      nextId: undefined,
    })
  })

  test('empty leaves with set currentChapterId returns just curId', () => {
    expect(bufferWindowIds([], 'x')).toEqual({ curId: 'x' })
  })
})
