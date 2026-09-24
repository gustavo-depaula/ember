import { describe, expect, it } from 'vitest'
import { logicalDay } from './windows'

describe('logicalDay', () => {
  it('1am with cutoff 4 returns previous day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 1, 30), 4)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(4)
    expect(result.getDate()).toBe(6)
    expect(result.getHours()).toBe(0)
  })

  it('4am returns same day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 4, 0), 4)
    expect(result.getDate()).toBe(7)
  })

  it('4:01am returns same day', () => {
    const result = logicalDay(new Date(2026, 4, 7, 4, 1), 4)
    expect(result.getDate()).toBe(7)
  })

  it('cutoff 0 (midnight) is identity (start of civil day)', () => {
    const result = logicalDay(new Date(2026, 4, 7, 23, 59), 0)
    expect(result.getDate()).toBe(7)
  })

  it('default cutoff is 4', () => {
    const result = logicalDay(new Date(2026, 4, 7, 3, 0))
    expect(result.getDate()).toBe(6)
  })
})
