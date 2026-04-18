import { describe, expect, it } from 'vitest'

import { currentAngelusSlot, isAngelusWindow } from './slots'

describe('currentAngelusSlot', () => {
  it('returns morning from 5:00 through 6:59', () => {
    expect(currentAngelusSlot(5)).toBe('morning')
    expect(currentAngelusSlot(6)).toBe('morning')
  })

  it('returns noon from 11:00 through 12:59', () => {
    expect(currentAngelusSlot(11)).toBe('noon')
    expect(currentAngelusSlot(12)).toBe('noon')
  })

  it('returns evening from 17:00 through 18:59', () => {
    expect(currentAngelusSlot(17)).toBe('evening')
    expect(currentAngelusSlot(18)).toBe('evening')
  })

  it('returns undefined outside the windows', () => {
    expect(currentAngelusSlot(0)).toBeUndefined()
    expect(currentAngelusSlot(4)).toBeUndefined()
    expect(currentAngelusSlot(7)).toBeUndefined()
    expect(currentAngelusSlot(10)).toBeUndefined()
    expect(currentAngelusSlot(13)).toBeUndefined()
    expect(currentAngelusSlot(16)).toBeUndefined()
    expect(currentAngelusSlot(19)).toBeUndefined()
    expect(currentAngelusSlot(23)).toBeUndefined()
  })
})

describe('isAngelusWindow', () => {
  it('is true inside any window', () => {
    expect(isAngelusWindow(6)).toBe(true)
    expect(isAngelusWindow(12)).toBe(true)
    expect(isAngelusWindow(18)).toBe(true)
  })

  it('is false outside every window', () => {
    expect(isAngelusWindow(0)).toBe(false)
    expect(isAngelusWindow(9)).toBe(false)
    expect(isAngelusWindow(15)).toBe(false)
    expect(isAngelusWindow(22)).toBe(false)
  })
})
