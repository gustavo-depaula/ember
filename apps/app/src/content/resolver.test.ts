import { beforeEach, describe, expect, it } from 'vitest'

import { rememberManifestBody, resetContentIndex, setCatalog } from './contentIndex'
import type { Catalog, PracticeManifest } from './manifestTypes'
import { loadFlow, resolveCanticle, resolvePrayer } from './resolver'

const ourFather: PracticeManifest = {
  id: 'practice/our-father',
  name: { 'en-US': 'Our Father', 'pt-BR': 'Pai Nosso' },
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
    // Refs inside flow.json are bare, like { type: "prayer", ref: "our-father" }.
    const asset = resolvePrayer('our-father')
    expect(asset?.title).toEqual({ 'en-US': 'Our Father', 'pt-BR': 'Pai Nosso' })
    expect(asset?.body).toHaveLength(1)
  })

  it('also accepts a fully-qualified `practice/our-father` ref', () => {
    const asset = resolvePrayer('practice/our-father')
    expect(asset?.title).toEqual(ourFather.name)
  })

  it('returns undefined for canticle refs (those go through resolveCanticle)', () => {
    expect(resolvePrayer('magnificat')).toBeUndefined()
  })

  it('returns undefined for an unknown ref', () => {
    expect(resolvePrayer('not-a-real-prayer')).toBeUndefined()
  })

  it('returns undefined for a practice with no inline flow (a flowHash-only practice)', () => {
    // A flowHash practice can't be embedded synchronously inside another flow.
    expect(resolvePrayer('rosary')).toBeUndefined()
  })
})

describe('resolveCanticle — preserves subtitle/source attribution', () => {
  it('returns body + subtitle + source for known canticles', () => {
    const asset = resolveCanticle('magnificat')
    expect(asset?.title).toEqual({ 'en-US': 'Magnificat' })
    expect(asset?.subtitle).toEqual({ 'en-US': 'Canticle of Mary' })
    expect(asset?.source).toEqual({ 'en-US': 'Luke 1:46-55' })
    expect(asset?.body).toHaveLength(1)
  })

  it('ignores non-canticle refs (resolvePrayer is the path for those)', () => {
    expect(resolveCanticle('our-father')).toBeUndefined()
  })

  it('handles a `prayer/`-prefixed canticle ref', () => {
    const asset = resolveCanticle('prayer/magnificat')
    expect(asset?.subtitle).toEqual({ 'en-US': 'Canticle of Mary' })
  })
})

describe('loadFlow — inline flow vs flowHash', () => {
  it('returns the inline flow from the manifest itself', async () => {
    const flow = await loadFlow('our-father')
    expect(flow?.sections).toHaveLength(1)
  })

  it('returns undefined for an unknown practice', async () => {
    expect(await loadFlow('does-not-exist')).toBeUndefined()
  })
})
