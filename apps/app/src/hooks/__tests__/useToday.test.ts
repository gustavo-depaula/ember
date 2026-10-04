import { act, renderHook } from '@testing-library/react'
import { format } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useToday } from '../useToday'

const dayOf = (date: Date) => format(date, 'yyyy-MM-dd')

describe('useToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('moves to the next day at 4am while the app stays open', () => {
    vi.setSystemTime(new Date(2026, 9, 4, 23, 50))
    const { result } = renderHook(() => useToday())
    expect(dayOf(result.current)).toBe('2026-10-04')

    // Past midnight is still last night.
    act(() => {
      vi.advanceTimersByTime(60 * 60_000)
    })
    expect(dayOf(result.current)).toBe('2026-10-04')

    act(() => {
      vi.advanceTimersByTime(4 * 60 * 60_000)
    })
    expect(dayOf(result.current)).toBe('2026-10-05')
  })

  it('catches up when the app returns to the foreground', () => {
    vi.setSystemTime(new Date(2026, 9, 4, 22, 0))
    const { result } = renderHook(() => useToday())

    // Backgrounded overnight: the clock moves but no timer fires.
    vi.setSystemTime(new Date(2026, 9, 5, 8, 0))
    expect(dayOf(result.current)).toBe('2026-10-04')

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(dayOf(result.current)).toBe('2026-10-05')
  })
})
