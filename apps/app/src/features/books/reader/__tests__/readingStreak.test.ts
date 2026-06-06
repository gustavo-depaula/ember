import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/repositories/cursors', () => {
  const cursors = new Map<string, { id: string; position: string; started_at: string }>()
  return {
    getCursor: (id: string) => cursors.get(id),
    setCursor: async (id: string, position: string) => {
      cursors.set(id, { id, position, started_at: '2026-06-06' })
    },
    readingStreakCursorId: (bookId: string) => `book/${bookId}/streak`,
    __mock: cursors,
  }
})

const { getReadingStreak, touchReadingStreak } = await import('../readingStreak')
const { __mock } = (await import('@/db/repositories/cursors')) as unknown as {
  __mock: Map<string, { id: string; position: string }>
}

beforeEach(() => {
  __mock.clear()
})

describe('readingStreak', () => {
  it('starts at 1 on first touch', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-06T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-06T11:00:00'))).toBe(1)
  })

  it('same-day touches don’t increment', async () => {
    const d1 = new Date('2026-06-06T08:00:00')
    const d2 = new Date('2026-06-06T20:00:00')
    await touchReadingStreak('book/a', d1)
    await touchReadingStreak('book/a', d2)
    expect(getReadingStreak('book/a', d2)).toBe(1)
  })

  it('consecutive days increment', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-05T10:00:00'))
    await touchReadingStreak('book/a', new Date('2026-06-06T10:00:00'))
    await touchReadingStreak('book/a', new Date('2026-06-07T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-07T11:00:00'))).toBe(3)
  })

  it('a one-day gap resets the streak', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-05T10:00:00'))
    // skip 2026-06-06
    await touchReadingStreak('book/a', new Date('2026-06-07T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-07T11:00:00'))).toBe(1)
  })

  it('getReadingStreak returns 0 when the last touch is older than yesterday', async () => {
    await touchReadingStreak('book/a', new Date('2026-06-01T10:00:00'))
    expect(getReadingStreak('book/a', new Date('2026-06-06T10:00:00'))).toBe(0)
  })
})
