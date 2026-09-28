import { describe, expect, it } from 'vitest'
import { formatPsalmRef, parsePsalmRef } from './psalter'

describe('parsePsalmRef', () => {
  it('parses a plain psalm number', () => {
    expect(parsePsalmRef(95)).toEqual({ psalm: 95 })
  })

  it('parses a psalm with verse range', () => {
    expect(parsePsalmRef('119:33-72')).toEqual({ psalm: 119, verseRange: [33, 72] })
  })
})

describe('formatPsalmRef', () => {
  it('formats a psalm without verse range', () => {
    expect(formatPsalmRef({ psalm: 95 })).toBe('Psalm 95')
  })

  it('formats a psalm with verse range', () => {
    expect(formatPsalmRef({ psalm: 119, verseRange: [33, 72] })).toBe('Psalm 119:33-72')
  })
})
