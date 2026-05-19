import type { ReadingReference } from '@ember/liturgical'
import type {
  BilingualText,
  FlowSection,
  LocalizedText,
  RenderedSection,
  RepeatEntry,
} from '../types'
import { resolveLanguageCandidates } from './book-language'
import {
  bilingualEmpty,
  bilingualOf,
  composeVars,
  type EngineContext,
  type FlowContext,
  getContextValue,
  type ResolutionLevel,
  resolveEntryVars,
  resolvePath,
} from './context'
import {
  CYCLE_LABEL_RE,
  LITURGICAL_COLOR_LABELS,
  RANK_LABELS,
  type RenderedLiturgicalColor,
} from './labels'
import { type ChoiceRichTextSection, resolveChoiceRichText } from './sections/choice-rich-text'
import { getCycleIndex } from './sections/cycle'
import { resolveCanticleRef, resolveInlinePrayer, resolvePrayerRef } from './sections/prayer'
import { resolveRepeat } from './sections/repeat'
import { computeSelectedId, resolveSelectFromData } from './sections/select'
import { substituteInFlowSection, substituteTemplateVars } from './vars'

const REVIEW_TARGETS: Record<string, { kind: 'active' | 'pending'; level: ResolutionLevel }> = {
  'active-daily': { kind: 'active', level: 'daily' },
  'pending-daily': { kind: 'pending', level: 'daily' },
}

// Lectio's parsed ReadingReference becomes an `include` of a content source.
// The source IDs come from EngineContext.contentSources — engine doesn't
// hardcode 'producer/bible-chapter' etc.
export function includeForReading(
  ref: ReadingReference,
  ec: EngineContext,
  trackId?: string,
): RenderedSection {
  if (ref.type === 'bible') {
    return {
      type: 'include',
      ref: ec.contentSources.bibleChapter,
      params: {
        book: ref.book,
        bookName: ref.bookName,
        chapter: ref.chapter,
        startVerse: ref.startVerse,
        endVerse: ref.endVerse,
        toEnd: ref.toEnd,
      },
      trackId,
    }
  }
  return {
    type: 'include',
    ref: ec.contentSources.cccChapter,
    params: { start: ref.startParagraph, count: ref.count },
    trackId,
  }
}

/**
 * Card-style excerpt for an `options` widget option: prefer the first
 * `prayer` (the actual liturgical text), fall back to the first `rubric`
 * (explanatory text). Headings/subheadings are skipped since they
 * mirror the option label.
 */
function deriveOptionExcerpt(sections: RenderedSection[]): BilingualText | undefined {
  for (const s of sections) {
    if (s.type === 'prayer' && s.text.primary) return s.text
  }
  for (const s of sections) {
    if (s.type === 'rubric' && s.label.primary) return s.label
  }
  return undefined
}

export function resolveSection(
  section: FlowSection,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  if (section.lang && section.lang !== ec.contentLanguage) return []

  switch (section.type) {
    case 'rubric':
      return [{ type: 'rubric', label: ec.localize(section.text) }]

    case 'divider':
      return [{ type: 'divider' }]

    case 'heading': {
      // `from` reads a LocalizedText from the FlowContext (e.g. the
      // celebration title); falls back to `text`. Skip emission if neither
      // resolves to anything renderable.
      let source: string | LocalizedText | undefined = section.text
      if (section.from) {
        const resolved = resolvePath(context, section.from)
        if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
          source = resolved as LocalizedText
        } else if (typeof resolved === 'string') {
          source = resolved
        }
      }
      if (!source) return []
      return [{ type: 'heading', text: ec.localize(source) }]
    }

    case 'image':
      return [
        {
          type: 'image',
          src: section.src,
          caption: section.caption ? ec.localize(section.caption) : undefined,
          attribution: section.attribution ? ec.localize(section.attribution) : undefined,
        },
      ]

    case 'prayer':
      if ('ref' in section) return resolvePrayerRef(section.ref, context, ec, resolveSection)
      if ('inline' in section) return [resolveInlinePrayer(section.inline, ec, section.speaker)]
      if ('title' in section && 'sections' in section) {
        const resolved = section.sections.flatMap((s) => resolveSection(s, context, ec))
        return [
          {
            type: 'prayer',
            title: ec.localize(section.title),
            text: bilingualEmpty,
            sections: resolved,
          },
        ]
      }
      return []

    case 'hymn':
      if ('ref' in section) {
        return [
          {
            type: 'hymn',
            title: bilingualOf(section.ref),
            text: bilingualOf(`[Hymn ref: ${section.ref}]`),
          },
        ]
      }
      if ('inline' in section) {
        return [
          {
            type: 'hymn',
            title: bilingualEmpty,
            text: ec.localize(section.inline),
          },
        ]
      }
      return []

    case 'canticle':
      if ('ref' in section) return resolveCanticleRef(section.ref, context, ec, resolveSection)
      if ('inline' in section) {
        return [
          {
            type: 'canticle',
            title: ec.localize(section.inline.title),
            subtitle: section.inline.subtitle
              ? ec.localize(section.inline.subtitle)
              : bilingualEmpty,
            source: bilingualEmpty,
            text: ec.localize(section.inline.text),
          },
        ]
      }
      return []

    case 'meditation':
      return [{ type: 'meditation', text: ec.localize(section.text) }]

    case 'response':
      return [
        {
          type: 'response',
          verses: section.verses.map((v) => ({
            v: ec.localize(v.v),
            r: ec.localize(v.r),
          })),
        },
      ]

    case 'repeat':
      return resolveRepeat(section, context, ec, resolveSection)

    case 'cycle': {
      const cycleData = context.cycleData?.[section.data]
      if (!cycleData) return []

      const contextValue = cycleData.contextKey
        ? getContextValue(context, cycleData.contextKey)
        : undefined
      const entries = (
        contextValue
          ? (cycleData.entries[contextValue] ?? Object.values(cycleData.entries)[0])
          : Object.values(cycleData.entries)[0]
      ) as unknown[]
      if (!entries?.length) return []

      const index = getCycleIndex(cycleData.indexBy, context.date, entries.length, context)
      const entry = entries[index] as Record<string, unknown>

      const entryVars = resolveEntryVars(entry, ec)
      const substVars = composeVars(context, entryVars)
      return section.sections.flatMap((s) => {
        const substituted = substituteInFlowSection(s, substVars)
        return resolveSection(substituted, context, ec)
      })
    }

    case 'include':
      return [{ type: 'include', ref: section.ref, params: section.params }]

    case 'lectio': {
      const resolveBookName = (slug: string) => ec.t(`bookName.${slug}`, { defaultValue: slug })
      if ('reference' in section) {
        const refs = ec.parseTrackEntry('bible', section.reference, resolveBookName)
        return refs.map((ref) => includeForReading(ref, ec))
      }
      const def = context.trackDefs?.[section.track]
      const state = context.trackState?.[section.track]
      if (!def || !state)
        return [{ type: 'rubric', label: bilingualOf('[Reading track not loaded]') }]
      const entry = def.entries[state.current_index % def.entries.length]
      if (entry === undefined)
        return [{ type: 'rubric', label: bilingualOf('[Reading track not loaded]') }]
      const refs = ec.parseTrackEntry(def.source, entry, resolveBookName)
      return refs.map((ref) => includeForReading(ref, ec, section.track))
    }

    case 'subheading':
      return [{ type: 'subheading', text: ec.localize(section.text) }]

    case 'proper':
      return [
        {
          type: 'proper',
          slot: section.slot,
          form: section.form,
          description: ec.localize(section.description),
        },
      ]

    case 'options': {
      if ('from' in section) {
        const fromPath = substituteTemplateVars(section.from, composeVars(context))
        const value = resolvePath(context, fromPath)
        const entries = (Array.isArray(value) ? value : []) as RepeatEntry[]
        if (!entries.length) return []

        const resolved = entries
          .map((entry, i) => {
            const vars = resolveEntryVars(entry, ec)
            const labelText = typeof vars.label === 'string' ? vars.label : undefined
            if (!labelText) return undefined
            const entryId = typeof vars.id === 'string' ? vars.id : String(i)
            const overlay = { ...vars, index: String(i) }
            const substVars = composeVars(context, overlay)
            return {
              id: entryId,
              label: ec.localize({ 'pt-BR': labelText, 'en-US': labelText }),
              sections: section.sections.flatMap((s) => {
                const substituted = substituteInFlowSection(s, substVars)
                return resolveSection(substituted, context, ec)
              }),
            }
          })
          .filter(
            (opt): opt is NonNullable<typeof opt> => opt !== undefined && opt.sections.length > 0,
          )

        if (resolved.length === 0) return []
        if (resolved.length === 1 && resolved[0]) return resolved[0].sections
        return [{ type: 'options' as const, label: ec.localize(section.label), options: resolved }]
      }
      const resolved = section.options
        .filter((opt) => !opt.lang || opt.lang === ec.contentLanguage)
        .map((opt) => {
          const sections = opt.sections.flatMap((s) => resolveSection(s, context, ec))
          return {
            id: opt.id,
            label: ec.localize(opt.label),
            sections,
            ...(section.pickerStyle === 'cards' ? { excerpt: deriveOptionExcerpt(sections) } : {}),
          }
        })
        .filter((opt) => opt.sections.length > 0)
      if (resolved.length === 0) return []
      if (resolved.length === 1 && resolved[0]) return resolved[0].sections
      return [
        {
          type: 'options',
          label: ec.localize(section.label),
          ...(section.pickerStyle ? { pickerStyle: section.pickerStyle } : {}),
          options: resolved,
        },
      ]
    }

    case 'prose': {
      // Dynamic prose: load chapter from book
      if ('book' in section) {
        const chapter = section.chapter
        if (!chapter) return []
        if (!ec.loadBookChapterText) return []
        const policy = section.langPolicy ?? 'active-language'
        const languageCandidates = resolveLanguageCandidates(ec, section.book, policy)
        for (const language of languageCandidates) {
          const text = ec.loadBookChapterText(section.book, chapter, language)
          if (text) return [{ type: 'prose', text: ec.localize(text) }]
        }
        return []
      }
      const proseText = context.resolvedProse?.[section.file] ?? ec.prose[section.file]
      if (!proseText) {
        if (context.resolvedProse) return []
        return [{ type: 'prose', text: bilingualOf(`[Prose not found: ${section.file}]`) }]
      }
      return [{ type: 'prose', text: ec.localize(proseText) }]
    }

    case 'gallery':
      return [
        {
          type: 'gallery',
          items: section.items.map((item) => ({
            src: item.src,
            title: item.title ? ec.localize(item.title) : undefined,
            attribution: item.attribution ? ec.localize(item.attribution) : undefined,
            caption: item.caption ? ec.localize(item.caption) : undefined,
          })),
        },
      ]

    case 'holy-card':
      return [
        {
          type: 'holy-card',
          image: section.image,
          title: section.title ? ec.localize(section.title) : undefined,
          attribution: section.attribution ? ec.localize(section.attribution) : undefined,
          prayer: section.prayer ? ec.localize(section.prayer) : undefined,
        },
      ]

    case 'select': {
      // From-data variant: dynamic options driven by an array path.
      // Used for the celebration picker (e.g. Holy Thursday → 2 celebrations,
      // Christmas → 4, an OT day with multiple optional memorials → 1 + N).
      if ('from' in section) {
        return resolveSelectFromData(section, context, ec, resolveSection)
      }

      const { selectedId, overrideKey } = computeSelectedId(section, context)

      const downstreamContext = section.as
        ? { ...context, templateVars: { ...context.templateVars, [section.as]: selectedId } }
        : context

      if (section.label) {
        // Visible picker: resolve only selected option sections for responsiveness.
        return [
          {
            type: 'select' as const,
            label: ec.localize(section.label),
            overrideKey: overrideKey ?? '',
            selectedId: selectedId ?? '',
            options: section.options.map((opt) => ({
              id: opt.id,
              label: ec.localize(opt.label),
              sections:
                opt.id === selectedId
                  ? (opt.sections ?? []).flatMap((s) => resolveSection(s, downstreamContext, ec))
                  : [],
            })),
          },
        ]
      }
      // Silent: resolve only the selected option
      const selected = section.options.find((o) => o.id === selectedId) ?? section.options[0]
      if (!selected?.sections?.length) return []
      return selected.sections.flatMap((s) => resolveSection(s, downstreamContext, ec))
    }

    case 'fragment': {
      const frag = context.fragments?.[section.ref]
      if (!frag) return []
      const vars = composeVars(context)
      return frag.flatMap((s) => {
        const substituted = Object.keys(vars).length > 0 ? substituteInFlowSection(s, vars) : s
        return resolveSection(substituted, context, ec)
      })
    }

    case 'group': {
      const resolved = section.sections.flatMap((s) => resolveSection(s, context, ec))
      if (section.skipIfEmpty) {
        // "Empty" means no substantive content — only structural chrome
        // (subheading / divider / heading) is present. A group built just to
        // frame a single conditional block (e.g. Verificatio wrapping a
        // `review-resolution skip_if_none`) collapses entirely when the
        // conditional skipped emission.
        const hasContent = resolved.some(
          (r) => r.type !== 'divider' && r.type !== 'subheading' && r.type !== 'heading',
        )
        if (!hasContent) return []
      }
      return resolved
    }

    case 'call': {
      // Parameterized macro/fragment invocation.
      // Looks up section.ref in FlowContext.fragments (same registry as fragment),
      // substitutes the macro body with composeVars(context) ∪ args, and
      // resolves the result. Args take precedence over flowData/templateVars
      // so a macro can shadow outer names with its own params.
      const frag = context.fragments?.[section.ref]
      if (!frag) return []
      const args = section.args ?? {}
      const vars = composeVars(context, args)
      return frag.flatMap((s) => {
        const substituted = substituteInFlowSection(s, vars)
        return resolveSection(substituted, context, ec)
      })
    }

    case 'choice-rich-text':
      return resolveChoiceRichText(section as ChoiceRichTextSection, context, ec)

    case 'collapsible': {
      const sections = section.sections.flatMap((s) => resolveSection(s, context, ec))
      if (sections.length === 0) return []
      const dynamic = section.defaultOpenFrom
        ? resolvePath(context, section.defaultOpenFrom)
        : undefined
      const defaultOpen = typeof dynamic === 'boolean' ? dynamic : (section.defaultOpen ?? false)
      return [
        {
          type: 'collapsible',
          title: ec.localize(section.title),
          defaultOpen,
          sections,
        },
      ]
    }

    case 'liturgical-color': {
      const raw = resolvePath(context, section.from)
      const color = typeof raw === 'string' ? raw.toLowerCase() : undefined
      if (!color || !LITURGICAL_COLOR_LABELS[color]) return []
      return [
        {
          type: 'liturgical-color',
          color: color as RenderedLiturgicalColor,
          label: ec.localize(LITURGICAL_COLOR_LABELS[color]),
        },
      ]
    }

    case 'liturgical-color-scope': {
      const raw = resolvePath(context, section.from)
      const lc = typeof raw === 'string' ? raw.toLowerCase() : undefined
      const color = lc && LITURGICAL_COLOR_LABELS[lc] ? (lc as RenderedLiturgicalColor) : undefined
      const inner = section.sections.flatMap((s) => resolveSection(s, context, ec))
      if (inner.length === 0) return []
      // No color resolved — pass children through, no scope wrapping.
      if (!color) return inner
      return [{ type: 'liturgical-color-scope', color, sections: inner }]
    }

    case 'section-marker': {
      const raw = section.colorFrom
        ? (resolvePath(context, section.colorFrom) as string | undefined)
        : undefined
      const lc = typeof raw === 'string' ? raw.toLowerCase() : undefined
      const color = lc && LITURGICAL_COLOR_LABELS[lc] ? (lc as RenderedLiturgicalColor) : undefined
      return [
        {
          type: 'section-marker',
          title: ec.localize(section.title),
          ...(color ? { color } : {}),
        },
      ]
    }

    case 'celebration-banner': {
      const obj = resolvePath(context, section.from)
      if (!obj || typeof obj !== 'object') return []
      const o = obj as {
        title?: LocalizedText
        liturgicalColor?: string
        rank?: string
        season?: string
      }
      if (!o.title) return []
      const titleForRender = o.title
      const color =
        typeof o.liturgicalColor === 'string' ? o.liturgicalColor.toLowerCase() : undefined
      const validColor =
        color && LITURGICAL_COLOR_LABELS[color] ? (color as RenderedLiturgicalColor) : undefined
      const rankEntry = o.rank ? RANK_LABELS[o.rank] : undefined
      const rankLabel = rankEntry ? ec.localize(rankEntry) : undefined
      const cycleId = section.cycleFrom
        ? (resolvePath(context, section.cycleFrom) as string | undefined)
        : undefined
      const cycleLabel =
        cycleId && CYCLE_LABEL_RE.test(cycleId)
          ? ec.localize({
              'en-US': `Year ${cycleId}`,
              'pt-BR': `Ano ${cycleId}`,
            })
          : undefined
      return [
        {
          type: 'celebration-banner',
          title: ec.localize(titleForRender),
          ...(validColor ? { color: validColor } : {}),
          ...(rankLabel ? { rank: rankLabel } : {}),
          ...(cycleLabel ? { cycle: cycleLabel } : {}),
        },
      ]
    }

    case 'offering': {
      if (!ec.supportsMovements) return []
      return [
        {
          type: 'rendered-offering',
          mode: section.mode,
          default: section.default ?? 'pinned',
          show: section.show ?? 'list',
          ...(section.label ? { label: ec.localize(section.label) } : {}),
        },
      ]
    }

    case 'capture-movement': {
      if (!ec.supportsMovements) return []
      return [
        {
          type: 'rendered-capture-movement',
          kind: section.kind,
          prompt: ec.localize(section.prompt),
          multi: section.multi ?? false,
          ...(section.kind === 'intention'
            ? { defaultCadence: section.defaults?.cadence ?? 'perpetual' }
            : {}),
        },
      ]
    }

    case 'capture-resolution': {
      if (!ec.resolutions || !ec.windowFor) return []
      const forward = section.for ?? 'next'
      const window = ec.windowFor(section.level, forward)
      const existing = ec.resolutions.inWindow(section.level, window.starts_at)
      return [
        {
          type: 'rendered-capture-resolution',
          level: section.level,
          forward,
          prompt: ec.localize(section.prompt),
          window,
          ...(existing ? { prefill: { resolution_id: existing.id, text: existing.text } } : {}),
        },
      ]
    }

    case 'review-resolution': {
      if (!ec.resolutions) return []
      const mode = section.mode ?? 'review'
      const parsed = REVIEW_TARGETS[section.target]
      const resolution =
        parsed.kind === 'active'
          ? ec.resolutions.active(parsed.level)
          : ec.resolutions.pending(parsed.level)
      if (!resolution && section.skip_if_none) return []
      return [
        {
          type: 'rendered-review-resolution',
          mode,
          target: section.target,
          ...(resolution
            ? { resolution: { id: resolution.id, text: resolution.text, level: resolution.level } }
            : {}),
          ...(section.prompt ? { prompt: ec.localize(section.prompt) } : {}),
          outcomes: section.outcomes ?? ['kept', 'partial', 'broken'],
          allow_notes: section.allow_notes ?? true,
        },
      ]
    }

    default:
      return []
  }
}
