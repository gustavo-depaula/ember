import { describe, expect, it } from 'vitest'
import type { Schedule } from './schedule'
import { getOccurrenceBasedProgramDay } from './schedule'

const firstFriday: Schedule = { type: 'nth-weekday', n: 1, day: 5 }
const firstSaturday: Schedule = { type: 'nth-weekday', n: 1, day: 6 }

function date(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d)
}

describe('getOccurrenceBasedProgramDay', () => {
  // 2026 first Fridays: Jan 2, Feb 6, Mar 6, Apr 3, May 1, Jun 5, Jul 3, Aug 7, Sep 4

  it('returns undefined before first occurrence', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-03', date(2026, 1, 15), 9)).toBe(
      undefined,
    )
  })

  it('returns 0 on the first occurrence day', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 1, 2), 9)).toBe(0)
  })

  it('returns 0 when enrolled on occurrence day', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-02', date(2026, 1, 2), 9)).toBe(0)
  })

  it('returns 1 the day after first occurrence (one passed)', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 1, 3), 9)).toBe(1)
  })

  it('returns 1 on the second occurrence day', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 2, 6), 9)).toBe(1)
  })

  it('returns 2 after two occurrences have passed', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 2, 7), 9)).toBe(2)
  })

  it('handles mid-month enrollment (skips current months past occurrence)', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-15', date(2026, 2, 6), 9)).toBe(0)
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-15', date(2026, 2, 7), 9)).toBe(1)
  })

  it('returns undefined when all occurrences have passed', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 9, 5), 9)).toBe(
      undefined,
    )
  })

  it('returns last valid day on the final occurrence', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 9, 4), 9)).toBe(8)
  })

  it('handles year boundary (December to January)', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2025-12-01', date(2025, 12, 5), 9)).toBe(0)
    expect(getOccurrenceBasedProgramDay(firstFriday, '2025-12-01', date(2026, 1, 2), 9)).toBe(1)
    expect(getOccurrenceBasedProgramDay(firstFriday, '2025-12-01', date(2026, 1, 3), 9)).toBe(2)
  })

  it('works for first Saturday schedule', () => {
    expect(getOccurrenceBasedProgramDay(firstSaturday, '2026-01-01', date(2026, 1, 3), 5)).toBe(0)
    expect(getOccurrenceBasedProgramDay(firstSaturday, '2026-01-01', date(2026, 1, 4), 5)).toBe(1)
  })

  it('returns undefined for unsupported schedule types', () => {
    const daily: Schedule = { type: 'daily' }
    expect(getOccurrenceBasedProgramDay(daily, '2026-01-01', date(2026, 1, 5), 9)).toBe(undefined)
  })

  it('stays within bounds between occurrences', () => {
    expect(getOccurrenceBasedProgramDay(firstFriday, '2026-01-01', date(2026, 1, 20), 9)).toBe(1)
  })
})
