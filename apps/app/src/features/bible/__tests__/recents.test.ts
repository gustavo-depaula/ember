import { describe, expect, it } from 'vitest'

import { type BiblePlace, recordPlace } from '../recents'

const books = [
  { id: 'genesis', chapters: 50 },
  { id: 'psalms', chapters: 150 },
  { id: 'mark', chapters: 16 },
  { id: 'luke', chapters: 24 },
  { id: 'john', chapters: 21 },
]

function read(steps: [string, number][], from: BiblePlace[] = []): BiblePlace[] {
  return steps.reduce(
    (places, [bookId, chapter], i) => recordPlace(places, books, bookId, chapter, 1000 + i),
    from,
  )
}

const summary = (places: BiblePlace[]) => places.map((p) => `${p.bookId} ${p.chapter}`)

describe('recordPlace', () => {
  it('keeps one place per book, at its latest chapter, most recent first', () => {
    const places = read([
      ['john', 1],
      ['psalms', 22],
      ['john', 2],
    ])

    expect(summary(places)).toEqual(['john 2', 'psalms 22'])
  })

  it('drops the oldest place when a fourth book is read', () => {
    const places = read([
      ['john', 1],
      ['psalms', 22],
      ['genesis', 12],
      ['mark', 3],
    ])

    expect(summary(places)).toEqual(['mark 3', 'genesis 12', 'psalms 22'])
  })

  it('carries a place into the next book instead of adding one', () => {
    const places = read([
      ['psalms', 22],
      ['genesis', 12],
      ['mark', 16],
      ['luke', 1],
    ])

    expect(summary(places)).toEqual(['luke 1', 'genesis 12', 'psalms 22'])
  })

  it('carries a place back into the book before when reading backwards', () => {
    const places = read([
      ['luke', 1],
      ['mark', 16],
    ])

    expect(summary(places)).toEqual(['mark 16'])
  })

  it('opens a new place when the book before was left unfinished', () => {
    const places = read([
      ['mark', 9],
      ['luke', 1],
    ])

    expect(summary(places)).toEqual(['luke 1', 'mark 9'])
  })

  it('keeps a ribbon with its place, and hands a freed ribbon to the newcomer', () => {
    const three = read([
      ['john', 1],
      ['psalms', 22],
      ['mark', 16],
    ])
    const ribbonOf = (places: BiblePlace[], bookId: string) =>
      places.find((p) => p.bookId === bookId)?.ribbon

    const carried = read([['luke', 1]], three)
    expect(ribbonOf(carried, 'luke')).toBe(ribbonOf(three, 'mark'))

    const replaced = read([['genesis', 1]], three)
    expect(ribbonOf(replaced, 'genesis')).toBe(ribbonOf(three, 'john'))
    expect(new Set(replaced.map((p) => p.ribbon)).size).toBe(3)
  })
})
