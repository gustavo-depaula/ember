import { beforeEach, describe, expect, test, vi } from 'vitest'

const blobs = new Map<string, string>()

vi.mock('@/content/store', () => ({
  getText: async (hash: string) => {
    const text = blobs.get(hash)
    if (text === undefined) throw new Error(`missing blob ${hash}`)
    return text
  },
}))

import type { BookEntry } from '@/content/manifestTypes'
import { loadChapterHtml } from '../loadChapterHtml'

function book(chapters: BookEntry['chapters']): BookEntry {
  return { id: 'book/x', name: { 'en-US': 'X' }, chapters }
}

beforeEach(() => {
  blobs.clear()
})

describe('loadChapterHtml', () => {
  test('renders markdown chapter to body HTML', async () => {
    blobs.set('h1', '# Hello\n\nWorld.')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h1', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result?.html).toContain('<h1')
    expect(result?.html).toContain('Hello')
    expect(result?.html).toContain('<p>World.</p>')
  })

  test('returns html-format chapter as-is, extracting <body> if present', async () => {
    blobs.set('h2', '<html><head></head><body><p>Direct.</p></body></html>')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h2', size: 1, format: 'html' } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result?.html).toBe('<p>Direct.</p>')
  })

  test('rewrites <img src> with both images/ and ../images/ keys', async () => {
    blobs.set('h3', '![](images/alpha.webp)\n\n![](../images/beta.jpg)')
    const urls = new Map([
      ['images/alpha.webp', 'https://e/alpha'],
      ['../images/alpha.webp', 'https://e/alpha'],
      ['images/beta.jpg', 'https://e/beta'],
      ['../images/beta.jpg', 'https://e/beta'],
    ])
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h3', size: 1 } } }),
      'ch1',
      'en-US',
      urls,
    )
    expect(result?.html).toContain('src="https://e/alpha"')
    expect(result?.html).toContain('src="https://e/beta"')
    expect(result?.html).not.toContain('images/alpha.webp')
    expect(result?.html).not.toContain('../images/beta.jpg')
  })

  test('leaves <img src> alone when no matching url', async () => {
    blobs.set('h4', '![](unknown.png)')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h4', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result?.html).toContain('src="unknown.png"')
  })

  test('renders footnotes via marked-footnote', async () => {
    blobs.set('h5', 'A ref[^x].\n\n[^x]: A footnote.')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h5', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result?.html).toContain('footnote-x')
  })

  test('renders gallery directive via galleryExtension', async () => {
    blobs.set('h6', ':::gallery\n![Alpha](a.jpg)\n:::')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h6', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result?.html).toContain('class="ember-gallery"')
    expect(result?.html).toContain('data-display="carousel"')
  })

  test('prepends chapter-title heading when title is provided', async () => {
    blobs.set('h7', 'Body text.')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h7', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
      'Chapter One',
    )
    expect(result?.html).toMatch(/^<h2 class="chapter-title">Chapter One<\/h2><p>Body text\.<\/p>/)
  })

  test('escapes HTML special chars in title', async () => {
    blobs.set('h8', 'Body.')
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h8', size: 1 } } }),
      'ch1',
      'en-US',
      new Map(),
      '<script>alert(1)</script>',
    )
    expect(result?.html).not.toContain('<script>')
    expect(result?.html).toContain('&lt;script&gt;')
  })

  test('returns undefined for unknown chapter id', async () => {
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h1', size: 1 } } }),
      'ch-missing',
      'en-US',
      new Map(),
    )
    expect(result).toBeUndefined()
  })

  test('returns undefined for unsupported language', async () => {
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { hash: 'h1', size: 1 } } }),
      'ch1',
      'fr-FR',
      new Map(),
    )
    expect(result).toBeUndefined()
  })

  test('returns undefined for external chapter ref', async () => {
    const result = await loadChapterHtml(
      book({ ch1: { 'en-US': { type: 'external', url: 'https://e/x' } } }),
      'ch1',
      'en-US',
      new Map(),
    )
    expect(result).toBeUndefined()
  })
})
