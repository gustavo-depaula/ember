import { describe, expect, it } from 'vitest'

import { currentMealSlot } from './slots'

describe('currentMealSlot', () => {
  it('returns breakfast from 6:00 through 9:59', () => {
    expect(currentMealSlot(6)).toBe('breakfast')
    expect(currentMealSlot(9)).toBe('breakfast')
  })

  it('returns lunch from 11:00 through 13:59', () => {
    expect(currentMealSlot(11)).toBe('lunch')
    expect(currentMealSlot(13)).toBe('lunch')
  })

  it('returns dinner from 17:00 through 20:59', () => {
    expect(currentMealSlot(17)).toBe('dinner')
    expect(currentMealSlot(20)).toBe('dinner')
  })

  it('returns undefined between meals', () => {
    expect(currentMealSlot(0)).toBeUndefined()
    expect(currentMealSlot(5)).toBeUndefined()
    expect(currentMealSlot(10)).toBeUndefined()
    expect(currentMealSlot(14)).toBeUndefined()
    expect(currentMealSlot(16)).toBeUndefined()
    expect(currentMealSlot(21)).toBeUndefined()
    expect(currentMealSlot(23)).toBeUndefined()
  })
})
