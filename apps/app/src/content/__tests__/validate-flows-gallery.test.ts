// Unit tests for the gallery validator rules. The script that walks the
// content tree (scripts/validate-flows.ts) imports the same pure function.
import { describe, expect, test } from 'vitest'
import { validateGallery } from '../../../../../scripts/validate-flows-rules'

const FILE = 'test.json'
const PATH = '$.sections[0]'

function valid(extra: Record<string, unknown> = {}) {
  return {
    type: 'gallery',
    items: [{ src: 'a.jpg' }, { src: 'b.jpg' }],
    ...extra,
  } as Record<string, unknown>
}

describe('validateGallery', () => {
  test('accepts a minimal valid gallery', () => {
    expect(validateGallery(valid(), FILE, PATH)).toEqual([])
  })

  test('rejects an empty items array', () => {
    const issues = validateGallery({ type: 'gallery', items: [] }, FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].path).toBe(`${PATH}.items`)
    expect(issues[0].message).toMatch(/non-empty/)
  })

  test('rejects missing items', () => {
    const issues = validateGallery({ type: 'gallery' }, FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].path).toBe(`${PATH}.items`)
  })

  test('rejects items missing src', () => {
    const issues = validateGallery({ type: 'gallery', items: [{ src: 'a.jpg' }, {}] }, FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].path).toBe(`${PATH}.items[1].src`)
  })

  test('rejects unknown display values', () => {
    const issues = validateGallery(valid({ display: 'grid' }), FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].path).toBe(`${PATH}.display`)
  })

  test.each(['carousel', 'stack', 'row'])('accepts display="%s"', (display) => {
    expect(validateGallery(valid({ display }), FILE, PATH)).toEqual([])
  })

  test('rejects weights when display is not row', () => {
    const issues = validateGallery(valid({ display: 'carousel', weights: [1, 1] }), FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toMatch(/only applies when display === "row"/)
  })

  test('rejects weights of wrong length', () => {
    const issues = validateGallery(valid({ display: 'row', weights: [1, 1, 1] }), FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toMatch(/length/)
  })

  test('rejects weights with non-positive entries', () => {
    const issues = validateGallery(valid({ display: 'row', weights: [1, 0] }), FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toMatch(/positive/)
  })

  test('accepts weights matching items length in row mode', () => {
    expect(validateGallery(valid({ display: 'row', weights: [2, 1] }), FILE, PATH)).toEqual([])
  })

  test('row with >4 items warns but does not error', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ src: `${i}.jpg` }))
    const issues = validateGallery({ type: 'gallery', display: 'row', items }, FILE, PATH)
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('warning')
    expect(issues[0].message).toMatch(/5 items in row mode/)
  })

  test('carousel with many items passes silently', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ src: `${i}.jpg` }))
    expect(validateGallery({ type: 'gallery', display: 'carousel', items }, FILE, PATH)).toEqual([])
  })
})
