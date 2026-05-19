// ResolvedSection mirrors RenderedSection but with:
// - content nodes (reading / psalmody / include) carrying their fetched `data` inline
// - container nodes (prayer / collapsible / liturgical-color-scope / options / select)
//   recursing into ResolvedSection[] instead of RenderedSection[]
// - everything else passing through unchanged
//
// preprocessFlow turns RenderedSection[] → ResolvedSection[]; the renderer
// walks the result synchronously, no hooks for fetching.

import type { BilingualText, RenderedSection } from '@ember/content-engine'
import type { CccParagraph } from '@/lib/catechism'
import type { ChapterResult } from '@/lib/content'
import type { CachedProducerResult } from '@/producers'
import type { PsalmodySlot } from '@/producers/psalmody'

export type ReadingData = ChapterResult | CccParagraph[]

export type ResolvedSection =
  // Passthroughs — leaf or self-contained variants unchanged from the engine.
  | Extract<RenderedSection, { type: 'rubric' }>
  | Extract<RenderedSection, { type: 'divider' }>
  | Extract<RenderedSection, { type: 'heading' }>
  | Extract<RenderedSection, { type: 'image' }>
  | Extract<RenderedSection, { type: 'hymn' }>
  | Extract<RenderedSection, { type: 'canticle' }>
  | Extract<RenderedSection, { type: 'meditation' }>
  | Extract<RenderedSection, { type: 'section-marker' }>
  | Extract<RenderedSection, { type: 'liturgical-color' }>
  | Extract<RenderedSection, { type: 'celebration-banner' }>
  | Extract<RenderedSection, { type: 'response' }>
  | Extract<RenderedSection, { type: 'subheading' }>
  | Extract<RenderedSection, { type: 'proper' }>
  | Extract<RenderedSection, { type: 'prose' }>
  | Extract<RenderedSection, { type: 'gallery' }>
  | Extract<RenderedSection, { type: 'holy-card' }>
  | Extract<RenderedSection, { type: 'rendered-offering' }>
  | Extract<RenderedSection, { type: 'rendered-capture-movement' }>
  | Extract<RenderedSection, { type: 'rendered-capture-resolution' }>
  | Extract<RenderedSection, { type: 'rendered-review-resolution' }>
  | Extract<RenderedSection, { type: 'choice-rich-text' }>
  // Containers — recurse into ResolvedSection[].
  | (Omit<Extract<RenderedSection, { type: 'prayer' }>, 'sections'> & {
      sections?: ResolvedSection[]
    })
  | (Omit<Extract<RenderedSection, { type: 'collapsible' }>, 'sections'> & {
      sections: ResolvedSection[]
    })
  | (Omit<Extract<RenderedSection, { type: 'liturgical-color-scope' }>, 'sections'> & {
      sections: ResolvedSection[]
    })
  | (Omit<Extract<RenderedSection, { type: 'options' }>, 'options'> & {
      options: Array<{
        id: string
        label: BilingualText
        sections: ResolvedSection[]
        excerpt?: BilingualText
      }>
    })
  | (Omit<Extract<RenderedSection, { type: 'select' }>, 'options'> & {
      options: Array<{ id: string; label: BilingualText; sections: ResolvedSection[] }>
    })
  // Content nodes — data inlined; the renderer never fetches.
  | (Extract<RenderedSection, { type: 'reading' }> & { data: ReadingData })
  | (Extract<RenderedSection, { type: 'psalmody' }> & { data: PsalmodySlot[] })
  | (Extract<RenderedSection, { type: 'include' }> & {
      data: CachedProducerResult
      resolvedSections?: ResolvedSection[] // flow-kind producers ship sections
    })
