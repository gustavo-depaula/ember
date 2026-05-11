import type { FlowSection, LocalizedContent, RenderedSection } from '../../types'
import { bilingualEmpty, bilingualOf, type EngineContext, type FlowContext } from '../context'

type SectionResolver = (
  section: FlowSection,
  context: FlowContext,
  ec: EngineContext,
) => RenderedSection[]

export function resolvePrayerRef(
  ref: string,
  context: FlowContext,
  ec: EngineContext,
  resolveSection: SectionResolver,
): RenderedSection[] {
  const asset = ec.prayers[ref]
  if (!asset) {
    return [
      {
        type: 'prayer',
        title: bilingualOf(ref),
        text: bilingualOf(`[Unknown prayer ref: ${ref}]`),
      },
    ]
  }
  // Legacy format: body was LocalizedContent before migration to FlowSection[]
  if (!Array.isArray(asset.body)) {
    return [
      {
        type: 'prayer',
        title: ec.localize(asset.title),
        text: ec.localize(asset.body as unknown as LocalizedContent),
      },
    ]
  }
  const resolved = asset.body.flatMap((s) => resolveSection(s, context, ec))
  // Single inline prayer: attach the asset title for collapsible rendering
  const first = resolved[0]
  if (resolved.length === 1 && first?.type === 'prayer') {
    return [{ ...first, title: ec.localize(asset.title) }]
  }
  // Multi-section prayer: wrap in a prayer section with nested sections
  return [
    {
      type: 'prayer',
      title: ec.localize(asset.title),
      text: bilingualEmpty,
      sections: resolved,
    },
  ]
}

export function resolveCanticleRef(
  ref: string,
  context: FlowContext,
  ec: EngineContext,
  resolveSection: SectionResolver,
): RenderedSection[] {
  const asset = ec.canticles[ref]
  if (!asset) {
    return [
      {
        type: 'canticle',
        title: bilingualOf(ref),
        subtitle: bilingualEmpty,
        source: bilingualEmpty,
        text: bilingualOf(`[Unknown canticle ref: ${ref}]`),
      },
    ]
  }
  // Legacy format: body was LocalizedContent before migration to FlowSection[]
  if (!Array.isArray(asset.body)) {
    return [
      {
        type: 'canticle',
        title: ec.localize(asset.title),
        subtitle: asset.subtitle ? ec.localize(asset.subtitle) : bilingualEmpty,
        source: asset.source ? ec.localize(asset.source) : bilingualEmpty,
        text: ec.localize(asset.body as unknown as LocalizedContent),
      },
    ]
  }
  // Canticles with subtitle/source render as a single canticle block
  // using the first inline prayer's text
  if (asset.subtitle || asset.source) {
    const resolved = asset.body.flatMap((s) => resolveSection(s, context, ec))
    const textSection = resolved.find((s) => s.type === 'prayer')
    return [
      {
        type: 'canticle',
        title: ec.localize(asset.title),
        subtitle: asset.subtitle ? ec.localize(asset.subtitle) : bilingualEmpty,
        source: asset.source ? ec.localize(asset.source) : bilingualEmpty,
        text: textSection && textSection.type === 'prayer' ? textSection.text : bilingualEmpty,
      },
    ]
  }
  return asset.body.flatMap((s) => resolveSection(s, context, ec))
}

export function resolveInlinePrayer(
  inline: LocalizedContent,
  ec: EngineContext,
  speaker?: 'priest' | 'people' | 'all',
): RenderedSection {
  return {
    type: 'prayer',
    title: bilingualEmpty,
    text: ec.localize(inline),
    ...(speaker && { speaker }),
  }
}
