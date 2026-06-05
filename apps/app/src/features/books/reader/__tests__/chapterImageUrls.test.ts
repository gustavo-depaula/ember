import { describe, expect, test, vi } from 'vitest'

vi.mock('@/lib/hearth', () => ({
  hearthUrl: (path: string) => `https://example.test/${path}`,
}))

vi.mock('@/content/store', () => ({
  blobPath: (hash: string) => `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`,
}))

import type { BookEntry } from '@/content/manifestTypes'
import { chapterImageUrls } from '../chapterImageUrls'

function book(images: BookEntry['images']): BookEntry {
  return {
    id: 'book/x',
    name: { 'en-US': 'X' },
    chapters: {},
    images,
  }
}

describe('chapterImageUrls', () => {
  test('returns empty map when manifest has no images', () => {
    expect(chapterImageUrls(book(undefined)).size).toBe(0)
    expect(chapterImageUrls(book([])).size).toBe(0)
  })

  test('emits both images/ and ../images/ keys per image, pointing at Hearth blob URL', () => {
    const map = chapterImageUrls(
      book([{ rel: 'sacred-heart.webp', hash: 'abcd1234', size: 1, mime: 'image/webp' }]),
    )
    expect(map.size).toBe(2)
    expect(map.get('images/sacred-heart.webp')).toBe('https://example.test/blobs/ab/cd/abcd1234')
    expect(map.get('../images/sacred-heart.webp')).toBe('https://example.test/blobs/ab/cd/abcd1234')
  })

  test('handles multiple images', () => {
    const map = chapterImageUrls(
      book([
        { rel: 'a.webp', hash: '11112222', size: 1, mime: 'image/webp' },
        { rel: 'b.jpg', hash: '33334444', size: 1, mime: 'image/jpeg' },
      ]),
    )
    expect(map.size).toBe(4)
    expect(map.get('images/a.webp')).toBe('https://example.test/blobs/11/11/11112222')
    expect(map.get('../images/b.jpg')).toBe('https://example.test/blobs/33/33/33334444')
  })
})
