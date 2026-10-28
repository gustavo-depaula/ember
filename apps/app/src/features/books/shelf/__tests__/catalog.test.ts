import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/content/manifestTypes'
import { ageOf, ageRange, arrivals, type ShelfBook, shelfBook, shortReads } from '../catalog'

const localize = (text: Record<string, string>) => text['pt-BR'] ?? text['en-US'] ?? ''

function book(id: string, entry: Partial<CatalogEntry>): ShelfBook {
  return shelfBook(
    `book/${id}`,
    { kind: 'book', hash: id, size: 0, name: { 'pt-BR': id }, ...entry },
    'pt-BR',
    localize,
  )
}

describe('arrivals', () => {
  const job = book('super-iob', {
    langs: ['en-US', 'la', 'pt-BR'],
    arrived: { 'en-US': '2026-06-04', la: '2026-06-04', 'pt-BR': '2026-10-26' },
  })
  const frost = book('frost', {
    langs: ['en-US', 'pt-BR'],
    arrived: { 'en-US': '2026-10-23', 'pt-BR': '2026-10-25' },
  })
  const denis = book('denis', { langs: ['la'], arrived: { la: '2026-10-21' } })

  it('lists an old book that has just become readable in the reader’s language', () => {
    expect(arrivals([job], 'pt-BR', '2026-09-01')).toEqual([
      { date: '2026-10-26', kind: 'language', book: job },
    ])
  })

  it('is silent about a translation into a language the reader does not read', () => {
    expect(arrivals([job], 'en-US', '2026-09-01')).toEqual([])
  })

  it('lists a new book once, and again when its reader’s language follows days later', () => {
    expect(arrivals([frost], 'pt-BR', '2026-09-01')).toEqual([
      { date: '2026-10-25', kind: 'language', book: frost },
      { date: '2026-10-23', kind: 'new', book: frost },
    ])
  })

  it('counts a new book in any language, latest day first', () => {
    expect(arrivals([denis, job], 'pt-BR', '2026-09-01').map((a) => a.date)).toEqual([
      '2026-10-26',
      '2026-10-21',
    ])
  })

  it('leaves out what came before the window', () => {
    expect(arrivals([job, frost, denis], 'pt-BR', '2026-10-24').map((a) => a.book)).toEqual([
      job,
      frost,
    ])
  })
})

describe('reading time', () => {
  it('reads a book’s length in the reader’s language, else the next one they read', () => {
    expect(book('a', { minutes: { 'en-US': 30, 'pt-BR': 40 } }).minutes).toBe(40)
    expect(book('b', { minutes: { la: 20, 'en-US': 30 } }).minutes).toBe(30)
    expect(book('c', { minutes: { la: 20 } }).minutes).toBe(20)
  })

  it('offers only books under an hour, the shortest first', () => {
    const books = [
      book('long', { minutes: { 'pt-BR': 61 } }),
      book('short', { minutes: { 'pt-BR': 2 } }),
      book('unmeasured', {}),
      book('middle', { minutes: { 'pt-BR': 40 } }),
    ]
    expect(shortReads(books).map((b) => b.bareId)).toEqual(['short', 'middle'])
  })
})

describe('ages', () => {
  const rangeOf = (century: number) => {
    const age = ageOf(century)
    if (!age) throw new Error(`no age holds century ${century}`)
    return ageRange(age)
  }

  it('names an age by its centuries', () => {
    expect(rangeOf(4)).toBe('IV–V')
    expect(rangeOf(3)).toBe('III')
    expect(rangeOf(13)).toBe('XIII–XV')
    expect(rangeOf(19)).toBe('XIX–XX')
  })
})
