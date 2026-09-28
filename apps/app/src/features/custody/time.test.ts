import { describe, expect, it } from 'vitest'

import { parseHHmm } from './time'

describe('parseHHmm', () => {
  it('parses zero-padded HH:mm', () => {
    expect(parseHHmm('07:30')).toEqual({ hours: 7, minutes: 30 })
    expect(parseHHmm('23:59')).toEqual({ hours: 23, minutes: 59 })
  })

  it('parses non-zero-padded forms', () => {
    expect(parseHHmm('9:5')).toEqual({ hours: 9, minutes: 5 })
  })

  it('rejects out-of-range values', () => {
    expect(parseHHmm('24:00')).toBeUndefined()
    expect(parseHHmm('10:60')).toBeUndefined()
    expect(parseHHmm('-1:00')).toBeUndefined()
  })

  it('rejects malformed strings', () => {
    expect(parseHHmm('')).toBeUndefined()
    expect(parseHHmm('21')).toBeUndefined()
    expect(parseHHmm('21:00:00')).toBeUndefined()
    expect(parseHHmm('10:6x')).toBeUndefined()
  })
})
