/**
 * Quiet-refresh behavior of the manifest warm-up: a background refresh that
 * loads nothing new must not bump the catalog version (each bump re-renders
 * every useCatalogVersion subscriber app-wide).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./store', () => ({
  getJson: vi.fn(),
  getText: vi.fn(),
}))

import { getCatalogVersion, resetContentIndex, setCatalog } from './contentIndex'
import type { Catalog } from './manifestTypes'
import { warmCriticalManifests, warmDeferredManifests } from './resolver'
import { getJson } from './store'

const catalog: Catalog = {
  version: 2,
  generated: '2026-06-12T00:00:00Z',
  items: {
    'practice/our-father': { kind: 'practice', hash: 'h-of', size: 100 },
    'collection/marian': { kind: 'collection', hash: 'h-marian', size: 50 },
  },
}

beforeEach(() => {
  resetContentIndex()
  setCatalog(structuredClone(catalog))
  vi.mocked(getJson)
    .mockReset()
    .mockImplementation(async (hash: string) => ({ id: hash }))
})

describe('warm functions — notify only when something new loaded', () => {
  it('warmCriticalManifests bumps once cold, then stays quiet', async () => {
    const v0 = getCatalogVersion()
    await warmCriticalManifests()
    expect(getCatalogVersion()).toBe(v0 + 1)

    await warmCriticalManifests()
    expect(getCatalogVersion()).toBe(v0 + 1)
  })

  it('warmDeferredManifests bumps once cold, then stays quiet', async () => {
    const v0 = getCatalogVersion()
    await warmDeferredManifests()
    expect(getCatalogVersion()).toBe(v0 + 1)

    await warmDeferredManifests()
    expect(getCatalogVersion()).toBe(v0 + 1)
  })

  it('does not bump when every fetch fails (nothing was remembered)', async () => {
    vi.mocked(getJson).mockReset().mockRejectedValue(new Error('offline'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const v0 = getCatalogVersion()
    await warmCriticalManifests()
    expect(getCatalogVersion()).toBe(v0)
    warnSpy.mockRestore()
  })
})
