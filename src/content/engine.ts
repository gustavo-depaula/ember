// Prayer asset loading — same pattern as divine-office/engine.ts
import benedictus from '@/assets/prayers/benedictus.json'
import gloryBe from '@/assets/prayers/glory-be.json'
import hailMary from '@/assets/prayers/hail-mary.json'
import magnificat from '@/assets/prayers/magnificat.json'
import nuncDimittis from '@/assets/prayers/nunc-dimittis.json'
import openingVerse from '@/assets/prayers/opening-verse.json'
import ourFather from '@/assets/prayers/our-father.json'
import signOfCross from '@/assets/prayers/sign-of-cross.json'
import { localizeAsset, localizeContent } from '@/lib/i18n'
import type { FlowDefinition, FlowSection, LocalizedBilingualText, RenderedSection } from './types'

type PrayerAsset = { title: string; english: string; latin?: string; portuguese?: string }
type CanticleAsset = {
  title: string
  subtitle?: string
  source?: string
  english: string
  portuguese?: string
}

const prayerRefs: Record<string, PrayerAsset> = {
  'sign-of-cross': signOfCross,
  'our-father': ourFather,
  'hail-mary': hailMary,
  'glory-be': gloryBe,
  'opening-verse': openingVerse,
}

const canticleRefs: Record<string, CanticleAsset> = {
  benedictus,
  magnificat,
  'nunc-dimittis': nuncDimittis,
}

export type FlowContext = {
  date: Date
}

function resolvePrayerRef(ref: string): RenderedSection {
  const asset = prayerRefs[ref]
  if (!asset) {
    return { type: 'prayer', title: ref, text: `[Unknown prayer ref: ${ref}]` }
  }
  return { type: 'prayer', title: asset.title, text: localizeAsset(asset) }
}

function resolveCanticleRef(ref: string): RenderedSection {
  const asset = canticleRefs[ref]
  if (!asset) {
    return {
      type: 'canticle',
      title: ref,
      subtitle: '',
      source: '',
      text: `[Unknown canticle ref: ${ref}]`,
    }
  }
  return {
    type: 'canticle',
    title: asset.title,
    subtitle: asset.subtitle ?? '',
    source: asset.source ?? '',
    text: localizeAsset(asset),
  }
}

function resolveInlinePrayer(inline: LocalizedBilingualText): RenderedSection {
  return { type: 'prayer', title: '', text: localizeContent(inline) }
}

function resolveSection(section: FlowSection, _context: FlowContext): RenderedSection[] {
  switch (section.type) {
    case 'rubric':
      return [{ type: 'rubric', label: localizeContent(section.text) }]

    case 'divider':
      return [{ type: 'divider' }]

    case 'heading':
      return [{ type: 'heading', text: localizeContent(section.text) }]

    case 'image':
      return [
        {
          type: 'image',
          src: section.src,
          caption: section.caption ? localizeContent(section.caption) : undefined,
        },
      ]

    case 'prayer':
      if ('ref' in section) return [resolvePrayerRef(section.ref)]
      if ('inline' in section) return [resolveInlinePrayer(section.inline)]
      return []

    case 'hymn':
      if ('ref' in section) {
        // Phase 2+: resolve hymn refs
        return [
          { type: 'hymn', title: section.ref, latin: '', english: `[Hymn ref: ${section.ref}]` },
        ]
      }
      if ('inline' in section) {
        return [
          {
            type: 'hymn',
            title: '',
            english: localizeContent(section.inline),
            latin: section.inline.latin ?? '',
          },
        ]
      }
      return []

    case 'canticle':
      if ('ref' in section) return [resolveCanticleRef(section.ref)]
      if ('inline' in section) {
        return [
          {
            type: 'canticle',
            title: localizeContent(section.inline.title),
            subtitle: section.inline.subtitle ? localizeContent(section.inline.subtitle) : '',
            source: '',
            text: localizeContent(section.inline.text),
          },
        ]
      }
      return []

    case 'meditation':
      return [{ type: 'meditation', text: localizeContent(section.text) }]

    case 'response':
      return [
        {
          type: 'response',
          verses: section.verses.map((v) => ({ v: localizeContent(v.v), r: localizeContent(v.r) })),
        },
      ]

    case 'repeat':
    case 'psalter':
    case 'lectio':
    case 'seasonal':
      // Phase 2+: these section types are not yet supported
      return [{ type: 'rubric', label: `[${section.type}: not yet implemented]` }]

    default:
      return []
  }
}

export function resolveFlow(flow: FlowDefinition, context: FlowContext): RenderedSection[] {
  return flow.sections.flatMap((section) => resolveSection(section, context))
}
