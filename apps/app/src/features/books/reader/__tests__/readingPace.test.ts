import { describe, expect, it } from 'vitest'
import { appendTurn, estimateMinutesPerPage } from '../readingPace'

describe('estimateMinutesPerPage', () => {
  it('returns undefined under 4 turns', () => {
    expect(estimateMinutesPerPage([])).toBeUndefined()
    expect(estimateMinutesPerPage([{ at: 0 }, { at: 60_000 }])).toBeUndefined()
  })

  it('returns median of inter-turn intervals', () => {
    const turns = [
      { at: 0 },
      { at: 60_000 }, // 1 min
      { at: 120_000 }, // 1 min
      { at: 200_000 }, // 1.33 min
      { at: 260_000 }, // 1 min
    ]
    expect(estimateMinutesPerPage(turns)).toBe(1)
  })

  it('filters out pauses longer than 5 min', () => {
    const turns = [
      { at: 0 },
      { at: 60_000 },
      { at: 120_000 },
      { at: 180_000 },
      { at: 180_000 + 10 * 60_000 }, // 10-min pause — ignored
      { at: 180_000 + 10 * 60_000 + 60_000 },
    ]
    expect(estimateMinutesPerPage(turns)).toBe(1)
  })

  it('clamps to the last 20 turns', () => {
    const turns = Array.from({ length: 25 }, (_, i) => ({ at: i * 30_000 }))
    expect(estimateMinutesPerPage(turns)).toBe(0.5)
  })
})

describe('appendTurn', () => {
  it('appends and rolls the window at 20 entries', () => {
    let turns: { at: number }[] = []
    for (let i = 0; i < 25; i++) turns = appendTurn(turns, i)
    expect(turns).toHaveLength(20)
    expect(turns[0].at).toBe(5)
    expect(turns[19].at).toBe(24)
  })
})
