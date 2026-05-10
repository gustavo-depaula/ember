import { describe, expect, it } from 'vitest'

import { useEventStore } from './state'

const NOW = Date.UTC(2026, 4, 9, 12)

function reset() {
  useEventStore.getState().reset()
}

describe('memorization projection', () => {
  it('MemorizationOptedIn creates a card with mastery 0 and dueAt today', () => {
    reset()
    useEventStore.getState().apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      createdAt: NOW,
    })
    const cards = [...useEventStore.getState().memorizationCards.values()]
    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      mastery: 0,
      ease: 2.5,
      intervalDays: 0,
      dueAt: '2026-05-09',
    })
  })

  it('MemorizationOptedIn is idempotent — does not reset existing card progress', () => {
    reset()
    const store = useEventStore.getState()
    store.apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      createdAt: NOW,
    })
    store.apply({
      type: 'MemorizationReviewed',
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      reviewedAt: NOW,
      today: '2026-05-09',
      outcome: { mode: 'cued', kind: 'cued', result: 'got-it' },
    })
    // Re-opt-in should not wipe the card.
    store.apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
      totalLines: 5,
      createdAt: NOW + 1000,
    })
    const card = useEventStore.getState().memorizationCards.get('prayer/our-father|en-US|0')
    expect(card?.mastery).toBe(1)
  })

  it('MemorizationOptedOut removes every portion of (prayerId, language)', () => {
    reset()
    const store = useEventStore.getState()
    for (let i = 1; i <= 3; i++) {
      store.apply({
        type: 'MemorizationOptedIn',
        prayerId: 'prayer/psalm-50',
        language: 'la',
        portionIndex: i,
        totalLines: 4,
        createdAt: NOW,
      })
    }
    // Different language stays.
    store.apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/psalm-50',
      language: 'en-US',
      portionIndex: 1,
      totalLines: 4,
      createdAt: NOW,
    })
    expect(useEventStore.getState().memorizationCards.size).toBe(4)

    store.apply({ type: 'MemorizationOptedOut', prayerId: 'prayer/psalm-50', language: 'la' })

    const remaining = [...useEventStore.getState().memorizationCards.values()]
    expect(remaining).toHaveLength(1)
    expect(remaining[0].language).toBe('en-US')
  })

  it('MemorizationReviewed updates the existing card via SM-2', () => {
    reset()
    const store = useEventStore.getState()
    store.apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/ave-maria',
      language: 'la',
      portionIndex: 0,
      totalLines: 4,
      createdAt: NOW,
    })
    store.apply({
      type: 'MemorizationReviewed',
      prayerId: 'prayer/ave-maria',
      language: 'la',
      portionIndex: 0,
      reviewedAt: NOW,
      today: '2026-05-09',
      outcome: { mode: 'cued', kind: 'cued', result: 'got-it' },
    })
    const card = useEventStore.getState().memorizationCards.get('prayer/ave-maria|la|0')
    expect(card?.mastery).toBe(1)
    expect(card?.intervalDays).toBe(1)
    expect(card?.dueAt).toBe('2026-05-10')
    expect(card?.lastMode).toBe('cued')
  })

  it('MemorizationReviewed with no matching card is a no-op', () => {
    reset()
    useEventStore.getState().apply({
      type: 'MemorizationReviewed',
      prayerId: 'prayer/unknown',
      language: 'en-US',
      portionIndex: 0,
      reviewedAt: NOW,
      today: '2026-05-09',
      outcome: { mode: 'cued', kind: 'cued', result: 'got-it' },
    })
    expect(useEventStore.getState().memorizationCards.size).toBe(0)
  })

  it('reset clears memorizationCards', () => {
    useEventStore.getState().apply({
      type: 'MemorizationOptedIn',
      prayerId: 'prayer/sub-tuum',
      language: 'la',
      portionIndex: 0,
      totalLines: 4,
      createdAt: NOW,
    })
    expect(useEventStore.getState().memorizationCards.size).toBeGreaterThan(0)
    useEventStore.getState().reset()
    expect(useEventStore.getState().memorizationCards.size).toBe(0)
  })
})
