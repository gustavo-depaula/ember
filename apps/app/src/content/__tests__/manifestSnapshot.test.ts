/**
 * The boot warm restores manifest bodies from one snapshot file instead of
 * reading each blob, and only touches the store for what the snapshot lacks.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Catalog } from '../manifestTypes'

vi.mock('../store', () => ({
  getJson: vi.fn(),
  getText: vi.fn(),
}))

vi.mock('../manifestSnapshot', () => ({
  readManifestSnapshot: vi.fn(),
  writeManifestSnapshot: vi.fn(async () => {}),
}))

const catalog: Catalog = {
  version: 2,
  generated: '2026-09-28T00:00:00Z',
  items: {
    'practice/our-father': { kind: 'practice', hash: 'h-of', size: 100 },
    'practice/hail-mary': { kind: 'practice', hash: 'h-hm', size: 100 },
    'collection/marian': { kind: 'collection', hash: 'h-marian', size: 50 },
    'book/imitation': { kind: 'book', hash: 'h-book', size: 5000 },
  },
}

// The restore runs once per session (module state), so each test gets fresh modules.
async function load() {
  vi.resetModules()
  const index = await import('../contentIndex')
  const resolver = await import('../resolver')
  const store = await import('../store')
  const snapshot = await import('../manifestSnapshot')
  index.setCatalog(structuredClone(catalog))
  vi.mocked(store.getJson).mockImplementation(async (hash: string) => ({ id: hash }))
  return { index, resolver, getJson: vi.mocked(store.getJson), snapshot }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('manifest snapshot', () => {
  it('restores bodies from the snapshot and reads only what it lacks', async () => {
    const { index, resolver, getJson, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue({ 'h-of': { id: 'snap-of' } })

    await resolver.warmCriticalManifests()

    expect(index.getRememberedManifest('h-of')).toEqual({ id: 'snap-of' })
    expect(getJson).toHaveBeenCalledTimes(1)
    expect(getJson).toHaveBeenCalledWith('h-hm')
  })

  it('rewrites the snapshot with every warmed Hearth body after loading something new', async () => {
    const { resolver, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue(undefined)

    await resolver.warmCriticalManifests()
    await resolver.warmDeferredManifests()

    expect(vi.mocked(snapshot.writeManifestSnapshot).mock.lastCall?.[0]).toEqual({
      'h-of': { id: 'h-of' },
      'h-hm': { id: 'h-hm' },
      'h-marian': { id: 'h-marian' },
    })
  })

  it('does not rewrite the snapshot when it already had everything', async () => {
    const { resolver, getJson, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue({
      'h-of': {},
      'h-hm': {},
      'h-marian': {},
    })

    await resolver.warmCriticalManifests()
    await resolver.warmDeferredManifests()

    expect(getJson).not.toHaveBeenCalled()
    expect(snapshot.writeManifestSnapshot).not.toHaveBeenCalled()
  })

  it('never warms book manifests', async () => {
    const { resolver, getJson, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue(undefined)

    await resolver.warmDeferredManifests()

    expect(getJson).not.toHaveBeenCalledWith('h-book')
  })

  it('overlapping warms share one read per blob', async () => {
    const { resolver, getJson, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue(undefined)

    await Promise.all([resolver.warmCriticalManifests(), resolver.warmCriticalManifests()])

    expect(getJson).toHaveBeenCalledTimes(2)
  })

  it('reports the restore as new only once, so a later no-op refresh stays quiet', async () => {
    const { index, resolver, snapshot } = await load()
    vi.mocked(snapshot.readManifestSnapshot).mockResolvedValue({
      'h-of': {},
      'h-hm': {},
      'h-marian': {},
    })

    const v0 = index.getCatalogVersion()
    await resolver.warmCriticalManifests()
    expect(index.getCatalogVersion()).toBe(v0 + 1)
    await resolver.warmCriticalManifests()
    await resolver.warmDeferredManifests()
    expect(index.getCatalogVersion()).toBe(v0 + 1)
  })
})
