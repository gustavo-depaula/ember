import { describe, expect, it } from 'vitest'
import { parseReaderPosition } from '../useReaderCursor'

describe('parseReaderPosition', () => {
  it('parses the new {chapterId, fraction} format', () => {
    expect(parseReaderPosition(JSON.stringify({ chapterId: 'ch-1', fraction: 0.42 }))).toEqual({
      chapterId: 'ch-1',
      fraction: 0.42,
      updatedAt: undefined,
    })
  })

  it('parses updatedAt when present', () => {
    expect(
      parseReaderPosition(JSON.stringify({ chapterId: 'ch', fraction: 0.1, updatedAt: 12345 })),
    ).toEqual({ chapterId: 'ch', fraction: 0.1, updatedAt: 12345 })
  })

  it('reads legacy {chapterId, page} cursors as fraction=0', () => {
    expect(parseReaderPosition(JSON.stringify({ chapterId: 'ch-2', page: 7 }))).toEqual({
      chapterId: 'ch-2',
      fraction: 0,
    })
  })

  it('returns undefined when chapterId is missing', () => {
    expect(parseReaderPosition(JSON.stringify({ fraction: 0.5 }))).toBeUndefined()
  })

  it('returns undefined for malformed JSON', () => {
    expect(parseReaderPosition('not json')).toBeUndefined()
  })
})
