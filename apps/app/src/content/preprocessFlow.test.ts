// Preprocessor variant mapping — every passthrough RenderedSection should
// produce its expected primitive without touching the network or registry.

import type { RenderedSection } from '@ember/content-engine'
import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { type PreprocessContext, preprocessFlow } from './preprocessFlow'

function ctx(): PreprocessContext {
  return {
    queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    prefs: { lang: 'en-US', translation: 'RSV2CE' },
    date: new Date('2026-01-01'),
  }
}

const text = { primary: 'a' }

describe('preprocessFlow — primitive mapping', () => {
  it('passthrough text-like nodes', async () => {
    const sections: RenderedSection[] = [
      { type: 'rubric', label: text },
      { type: 'divider' },
      { type: 'heading', text },
      { type: 'subheading', text },
      { type: 'meditation', text },
      { type: 'prose', text },
    ]
    expect(await preprocessFlow(sections, ctx())).toEqual([
      { type: 'rubric', text },
      { type: 'divider' },
      { type: 'heading', text, size: 'h1' },
      { type: 'heading', text, size: 'h2' },
      { type: 'text', text, style: 'italic' },
      { type: 'prose', text },
    ])
  })

  it('hymn maps to verses with per-line items', async () => {
    const sections: RenderedSection[] = [
      { type: 'hymn', title: { primary: 'Te Deum' }, text: { primary: 'Line 1\nLine 2' } },
    ]
    const result = await preprocessFlow(sections, ctx())
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      type: 'verses',
      header: { primary: 'Te Deum' },
      items: [{ text: { primary: 'Line 1' } }, { text: { primary: 'Line 2' } }],
    })
  })

  it('response maps to vr-styled verses with role tags', async () => {
    const sections: RenderedSection[] = [
      {
        type: 'response',
        verses: [
          { v: { primary: 'The Lord be with you' }, r: { primary: 'And with your spirit' } },
        ],
      },
    ]
    const [primitive] = await preprocessFlow(sections, ctx())
    expect(primitive).toMatchObject({
      type: 'verses',
      style: 'vr',
      items: [
        { role: 'v', text: { primary: 'The Lord be with you' } },
        { role: 'r', text: { primary: 'And with your spirit' } },
      ],
    })
  })

  it('callout absorbs section-marker / celebration-banner / liturgical-color', async () => {
    const sections: RenderedSection[] = [
      { type: 'section-marker', title: text, color: 'gold' },
      { type: 'celebration-banner', title: text, color: 'red', rank: text, cycle: text },
      { type: 'liturgical-color', color: 'white', label: text },
    ]
    const result = await preprocessFlow(sections, ctx())
    expect(result.map((p) => (p as { variant: string }).variant)).toEqual([
      'section-marker',
      'celebration-banner',
      'liturgical-color',
    ])
    expect(result.every((p) => p.type === 'callout')).toBe(true)
  })

  it('container behaviors carry their kind', async () => {
    const sections: RenderedSection[] = [
      { type: 'collapsible', title: text, defaultOpen: false, sections: [{ type: 'divider' }] },
      { type: 'liturgical-color-scope', color: 'violet', sections: [{ type: 'divider' }] },
      {
        type: 'options',
        label: text,
        options: [{ id: 'a', label: text, sections: [{ type: 'divider' }] }],
      },
    ]
    const result = await preprocessFlow(sections, ctx())
    const behaviorKinds = result.map((p) => {
      if (p.type !== 'container') throw new Error('expected container')
      return p.behavior.kind
    })
    expect(behaviorKinds).toEqual(['collapsible', 'color-scope', 'options'])
  })

  describe('gallery', () => {
    it('emits a single gallery primitive (no flattening)', async () => {
      const sections: RenderedSection[] = [
        {
          type: 'gallery',
          items: [
            {
              src: 'a.jpg',
              title: { primary: 'A' },
              attribution: { primary: 'Author A' },
              caption: { primary: 'Caption A' },
            },
            { src: 'b.jpg' },
          ],
        },
      ]
      const result = await preprocessFlow(sections, ctx())
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'gallery',
        display: 'carousel',
        weights: undefined,
        caption: undefined,
        items: [
          {
            src: 'a.jpg',
            alt: undefined,
            title: { primary: 'A' },
            attribution: { primary: 'Author A' },
            caption: { primary: 'Caption A' },
          },
          {
            src: 'b.jpg',
            alt: undefined,
            title: undefined,
            attribution: undefined,
            caption: undefined,
          },
        ],
      })
    })

    it('passes through display, weights, caption, and alt', async () => {
      const sections: RenderedSection[] = [
        {
          type: 'gallery',
          display: 'row',
          weights: [2, 1],
          caption: { primary: 'Two views' },
          items: [
            { src: 'a.jpg', alt: { primary: 'before' } },
            { src: 'b.jpg', alt: { primary: 'after' } },
          ],
        },
      ]
      const [primitive] = await preprocessFlow(sections, ctx())
      expect(primitive).toMatchObject({
        type: 'gallery',
        display: 'row',
        weights: [2, 1],
        caption: { primary: 'Two views' },
        items: [
          { src: 'a.jpg', alt: { primary: 'before' } },
          { src: 'b.jpg', alt: { primary: 'after' } },
        ],
      })
    })

    it('defaults missing display to carousel', async () => {
      const [primitive] = await preprocessFlow(
        [{ type: 'gallery', items: [{ src: 'a.jpg' }] }],
        ctx(),
      )
      expect(primitive).toMatchObject({ type: 'gallery', display: 'carousel' })
    })
  })

  it('interaction kinds map by their engine type', async () => {
    const sections: RenderedSection[] = [
      { type: 'proper', slot: 'collect', form: 'of', description: text },
      { type: 'rendered-offering', mode: 'both', default: 'pinned', show: 'list' },
      {
        type: 'rendered-capture-movement',
        kind: 'intention',
        prompt: text,
        multi: false,
      },
    ]
    const result = await preprocessFlow(sections, ctx())
    expect(result.every((p) => p.type === 'interaction')).toBe(true)
    const kinds = result.map((p) => (p as { kind: string }).kind)
    expect(kinds).toEqual(['proper', 'offering', 'capture-movement'])
  })
})
