import { describe, expect, it } from 'vitest'

import { pickMode } from './modes'
import type { MemorizationCardState } from './types'

function card(overrides: Partial<MemorizationCardState>): MemorizationCardState {
  return {
    prayerId: 'p',
    language: 'en-US',
    portionIndex: 0,
    totalLines: 5,
    mastery: 0,
    ease: 2.5,
    intervalDays: 0,
    dueAt: '2026-05-09',
    lastSeenAt: null,
    lastMode: null,
    coldSuccesses: 0,
    hasFirstColdBonus: false,
    createdAt: 0,
    ...overrides,
  }
}

describe('pickMode', () => {
  it('mastery 0 → cued (no foothold yet)', () => {
    expect(pickMode(card({ mastery: 0 }))).toBe('cued')
  })

  it('mastery 1 → cued (still building foothold)', () => {
    expect(pickMode(card({ mastery: 1 }))).toBe('cued')
  })

  it('mastery in [2, totalLines) alternates cued/letters based on lastMode', () => {
    expect(pickMode(card({ mastery: 3, totalLines: 5, lastMode: 'cued' }))).toBe('letters')
    expect(pickMode(card({ mastery: 3, totalLines: 5, lastMode: 'letters' }))).toBe('cued')
  })

  it('mastery in middle range with no lastMode defaults to cued', () => {
    expect(pickMode(card({ mastery: 3, totalLines: 5, lastMode: null }))).toBe('cued')
  })

  it('mastery == totalLines and coldSuccesses < 2 alternates letters/cold', () => {
    expect(
      pickMode(card({ mastery: 5, totalLines: 5, coldSuccesses: 0, lastMode: 'letters' })),
    ).toBe('cold')
    expect(pickMode(card({ mastery: 5, totalLines: 5, coldSuccesses: 1, lastMode: 'cold' }))).toBe(
      'letters',
    )
  })

  it('mastery == totalLines and coldSuccesses >= 2 picks cold (dominant)', () => {
    expect(pickMode(card({ mastery: 5, totalLines: 5, coldSuccesses: 2, lastMode: 'cold' }))).toBe(
      'cold',
    )
    expect(
      pickMode(card({ mastery: 5, totalLines: 5, coldSuccesses: 5, lastMode: 'letters' })),
    ).toBe('cold')
  })

  it('mastery == totalLines first review (no lastMode) starts with cold', () => {
    expect(pickMode(card({ mastery: 5, totalLines: 5, coldSuccesses: 0, lastMode: null }))).toBe(
      'cold',
    )
  })
})
