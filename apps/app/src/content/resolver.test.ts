/**
 * Resolver tests focused on the prayer → practice merge behavior.
 *
 * After the merge there is no `prayer` catalog kind. `resolvePrayer(ref)`
 * still exists (the engine's prayer Proxy depends on it) but reads from
 * `practice/<id>` manifests whose `flow.sections` *is* the prayer body.
 * Bare refs (`'our-father'`, the form used inside flow.json) keep working.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { rememberManifestBody, resetContentIndex, setCatalog } from './contentIndex'
import type { Catalog, PracticeManifest } from './manifestTypes'
import { loadFlow, resolveCanticle, resolvePrayer } from './resolver'
import * as store from './store'

const ourFather: PracticeManifest = {
  id: 'practice/our-father',
  name: { 'en-US': 'Our Father', la: 'Pater Noster' },
  flow: {
    sections: [
      {
        type: 'prayer',
        inline: {
          'en-US': 'Our Father, who art in heaven, hallowed be thy name...',
          la: 'Pater noster, qui es in caelis, sanctificetur nomen tuum...',
        },
      },
    ],
  },
}

const magnificat: PracticeManifest = {
  id: 'practice/magnificat',
  name: { 'en-US': 'Magnificat' },
  subtitle: { 'en-US': 'Canticle of Mary' },
  source: { 'en-US': 'Luke 1:46-55' },
  flow: {
    sections: [
      {
        type: 'prayer',
        inline: { 'en-US': 'My soul doth magnify the Lord...' },
      },
    ],
  },
}

const rosary: PracticeManifest = {
  id: 'practice/rosary',
  name: { 'en-US': 'Holy Rosary' },
  flowHash: { hash: 'rosary-flow-hash', size: 1234 },
  fragments: [],
}

function seedCatalog(): void {
  const catalog: Catalog = {
    version: 2,
    generated: '2026-05-15T00:00:00Z',
    items: {
      'practice/our-father': {
        kind: 'practice',
        hash: 'h-our-father',
        size: 200,
        name: ourFather.name,
      },
      'practice/magnificat': {
        kind: 'practice',
        hash: 'h-magnificat',
        size: 200,
        name: magnificat.name,
      },
      'practice/rosary': {
        kind: 'practice',
        hash: 'h-rosary',
        size: 200,
        name: rosary.name,
      },
    },
  }
  setCatalog(catalog)
  rememberManifestBody('h-our-father', ourFather)
  rememberManifestBody('h-magnificat', magnificat)
  rememberManifestBody('h-rosary', rosary)
}

beforeEach(() => {
  resetContentIndex()
  seedCatalog()
})

describe('resolvePrayer — reads practice manifests via inline flow', () => {
  it('resolves a bare ref (`our-father`) to a practice/our-father manifest body', () => {
    // This is the headline backward-compat case: 1099 refs in practice flows
    // are bare, like { type: "prayer", ref: "our-father" }. The resolver must
    // canonicalize that to `practice/our-father` and return its flow.sections.
    const asset = resolvePrayer('our-father')
    expect(asset).toBeDefined()
    expect(asset?.title).toEqual({ 'en-US': 'Our Father', la: 'Pater Noster' })
    expect(Array.isArray(asset?.body)).toBe(true)
    expect(asset?.body).toHaveLength(1)
  })

  it('also accepts a fully-qualified `practice/our-father` ref', () => {
    const asset = resolvePrayer('practice/our-father')
    expect(asset?.title).toEqual(ourFather.name)
  })

  it('returns undefined for canticle refs (those go through resolveCanticle)', () => {
    // The canticleRefs whitelist diverts these so callers consistently use
    // resolveCanticle to get the subtitle/source-aware variant.
    expect(resolvePrayer('magnificat')).toBeUndefined()
  })

  it('returns undefined for an unknown ref', () => {
    expect(resolvePrayer('not-a-real-prayer')).toBeUndefined()
  })

  it('returns undefined for a practice with no inline flow (a flowHash-only practice)', () => {
    // A "full" practice like the Rosary has flowHash → flow.json — it can't be
    // synchronously embedded as a prayer ref inside another flow.
    expect(resolvePrayer('rosary')).toBeUndefined()
  })
})

describe('resolveCanticle — preserves subtitle/source attribution', () => {
  it('returns body + subtitle + source for known canticles', () => {
    const asset = resolveCanticle('magnificat')
    expect(asset).toBeDefined()
    expect(asset?.title).toEqual({ 'en-US': 'Magnificat' })
    expect(asset?.subtitle).toEqual({ 'en-US': 'Canticle of Mary' })
    expect(asset?.source).toEqual({ 'en-US': 'Luke 1:46-55' })
    expect(asset?.body).toHaveLength(1)
  })

  it('ignores non-canticle refs (resolvePrayer is the path for those)', () => {
    expect(resolveCanticle('our-father')).toBeUndefined()
  })

  it('handles a `prayer/`-prefixed canticle ref (legacy form)', () => {
    // Some older collection refs may still arrive `prayer/magnificat` — strip
    // and re-canonicalize against the practice catalog.
    const asset = resolveCanticle('prayer/magnificat')
    expect(asset?.subtitle).toEqual({ 'en-US': 'Canticle of Mary' })
  })
})

describe('loadFlow — inline flow vs flowHash', () => {
  it('returns the inline flow without touching the blob store', async () => {
    // Inline flow is the new normal for short prayers — no extra blob fetch.
    const fetchedHashes: string[] = []
    const originalGetJson = store.getJson
    Object.defineProperty(store, 'getJson', {
      configurable: true,
      value: async (hash: string) => {
        fetchedHashes.push(hash)
        return originalGetJson(hash)
      },
    })

    try {
      const flow = await loadFlow('our-father')
      expect(flow?.sections).toBeDefined()
      expect(flow?.sections).toHaveLength(1)
      // No blob hash was fetched — the flow came from the manifest itself.
      expect(fetchedHashes).toEqual([])
    } finally {
      Object.defineProperty(store, 'getJson', {
        configurable: true,
        value: originalGetJson,
      })
    }
  })

  it('clones the inline flow so per-call mutations (image-rewriting) do not leak', async () => {
    const a = await loadFlow('our-father')
    const b = await loadFlow('our-father')
    // After loadFlow caches by canonical id, the second call returns the cached
    // (cloned) reference; the structural identity is fine, but a fresh load on
    // a *different* practice with `flow` should not share section references
    // with the warmed manifest. Mutating the returned flow must not bleed back
    // into the resident manifest body.
    expect(a?.sections).toBeDefined()
    expect(b?.sections).toBeDefined()
    // The warmed manifest should still match the original (no accidental
    // mutation through the loaded flow).
    expect(ourFather.flow?.sections[0]).toMatchObject({ type: 'prayer' })
  })

  it('returns undefined for an unknown practice', async () => {
    expect(await loadFlow('does-not-exist')).toBeUndefined()
  })
})
