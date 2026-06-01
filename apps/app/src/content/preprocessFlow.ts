import type { BilingualText, RenderedSection } from '@ember/content-engine'
import type { QueryClient } from '@tanstack/react-query'
import {
  type ContentSource,
  cacheKeyFor,
  getSource,
  type ProducerPrefs,
  runCachedSource,
  type SourceAccessor,
  type SourceFetchContext,
} from '@/sources'
import type { ContainerOption, Primitive } from './primitives'

export type PreprocessContext = {
  queryClient: QueryClient
  prefs: ProducerPrefs
  date: Date
  programDay?: number
}

// Local YYYY-MM-DD for the logical day. Date-scoped sources fold this into
// their cache key so each calendar day fetches fresh and past days stay cached.
function ymd(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

function scopedParams(
  source: ContentSource,
  params: Record<string, unknown>,
  date: Date,
): Record<string, unknown> {
  return source.dateScoped ? { ...params, date: ymd(date) } : params
}

function includeErrorPlaceholder(lang: string): Primitive {
  const message =
    lang === 'pt-BR'
      ? 'Não foi possível carregar esta seção. Reabra para tentar novamente.'
      : 'Couldn’t load this section. Reopen to try again.'
  return { type: 'text', text: { primary: message }, style: 'italic' }
}

export async function preprocessFlow(
  sections: RenderedSection[],
  ctx: PreprocessContext,
): Promise<Primitive[]> {
  const accessor = makeSourceAccessor(ctx)
  const resolved = await Promise.all(sections.map((s) => preprocessSection(s, ctx, accessor)))
  return resolved.flat()
}

async function preprocessSection(
  section: RenderedSection,
  ctx: PreprocessContext,
  accessor: SourceAccessor,
): Promise<Primitive | Primitive[]> {
  switch (section.type) {
    case 'include':
      // A failing external producer must not nuke the whole practice (sibling
      // sections resolve via Promise.all). Degrade just this node to a
      // placeholder; the source threw rather than caching, so reopening
      // retries. Scoped to `include` — local section types shouldn't be
      // silently swallowed.
      try {
        return await fetchFromSource(section.ref, section.params ?? {}, ctx, accessor)
      } catch {
        return includeErrorPlaceholder(ctx.prefs.lang)
      }

    case 'rubric':
      return { type: 'rubric', text: section.label }

    case 'divider':
      return { type: 'divider' }

    case 'heading':
      return { type: 'heading', text: section.text, size: 'h1' }

    case 'subheading':
      return { type: 'heading', text: section.text, size: 'h2' }

    case 'meditation':
      return { type: 'text', text: section.text, style: 'italic' }

    case 'image':
      return {
        type: 'image',
        src: section.src,
        caption: section.caption,
        attribution: section.attribution,
      }

    case 'prose':
      return { type: 'prose', text: section.text }

    case 'hymn':
      return {
        type: 'verses',
        header: section.title,
        items: bilingualLines(section.text),
      }

    case 'canticle':
      return [
        { type: 'heading', text: section.title, size: 'h2' },
        ...(section.subtitle.primary
          ? [{ type: 'text', text: section.subtitle, style: 'italic' } as Primitive]
          : []),
        {
          type: 'verses',
          header: section.source.primary ? section.source : undefined,
          items: bilingualLines(section.text),
        },
      ]

    case 'response':
      return {
        type: 'verses',
        style: 'vr',
        items: section.verses.flatMap((vr) => [
          { role: 'v' as const, text: vr.v },
          { role: 'r' as const, text: vr.r },
        ]),
      }

    case 'gallery':
      return {
        type: 'gallery',
        display: section.display ?? 'carousel',
        weights: section.weights,
        caption: section.caption,
        items: section.items.map((item) => ({
          src: item.src,
          alt: item.alt,
          title: item.title,
          attribution: item.attribution,
          caption: item.caption,
        })),
      }

    case 'holy-card':
      return {
        type: 'holy-card',
        image: section.image,
        title: section.title,
        attribution: section.attribution,
        prayer: section.prayer,
      }

    case 'section-marker':
      return {
        type: 'callout',
        variant: 'section-marker',
        title: section.title,
        color: section.color,
      }

    case 'celebration-banner':
      return {
        type: 'callout',
        variant: 'celebration-banner',
        title: section.title,
        color: section.color,
        rank: section.rank,
        cycle: section.cycle,
      }

    case 'liturgical-color':
      return {
        type: 'callout',
        variant: 'liturgical-color',
        title: section.label,
        color: section.color,
      }

    case 'prayer': {
      if (section.speaker) {
        return {
          type: 'container',
          behavior: { kind: 'liturgical-prayer', speaker: section.speaker, text: section.text },
        }
      }
      if (section.title.primary) {
        const children = section.sections ? await preprocessFlow(section.sections, ctx) : []
        return {
          type: 'container',
          behavior: {
            kind: 'prayer',
            title: section.title,
            text: section.text,
            count: section.count,
          },
          children,
        }
      }
      return { type: 'text', text: section.text }
    }

    case 'collapsible': {
      const children = await preprocessFlow(section.sections, ctx)
      return {
        type: 'container',
        behavior: {
          kind: 'collapsible',
          title: section.title,
          defaultOpen: section.defaultOpen,
        },
        children,
      }
    }

    case 'liturgical-color-scope': {
      const children = await preprocessFlow(section.sections, ctx)
      return {
        type: 'container',
        behavior: { kind: 'color-scope', color: section.color },
        children,
      }
    }

    case 'options': {
      const options: ContainerOption[] = await Promise.all(
        section.options.map(async (o) => ({
          id: o.id,
          label: o.label,
          excerpt: o.excerpt,
          children: await preprocessFlow(o.sections, ctx),
        })),
      )
      return {
        type: 'container',
        behavior: {
          kind: 'options',
          label: section.label,
          pickerStyle: section.pickerStyle,
          options,
        },
      }
    }

    case 'select': {
      // Eager-preprocess only the initially-selected branch so it paints with
      // the rest of the flow; the others carry their raw engine output and are
      // preprocessed lazily (and prefetched) when the user switches tabs — see
      // SelectBranch. This keeps a tab switch from re-resolving the whole flow.
      const options: ContainerOption[] = await Promise.all(
        section.options.map(async (o) => ({
          id: o.id,
          label: o.label,
          children: o.id === section.selectedId ? await preprocessFlow(o.sections, ctx) : [],
          rawSections: o.sections,
        })),
      )
      return {
        type: 'container',
        behavior: {
          kind: 'select',
          label: section.label,
          overrideKey: section.overrideKey,
          selectedId: section.selectedId,
          options,
        },
      }
    }

    case 'choice-rich-text':
      return {
        type: 'container',
        behavior: {
          kind: 'choice-rich-text',
          label: section.label,
          overrideKey: section.overrideKey,
          selectedId: section.selectedId,
          pickerStyle: section.pickerStyle,
          hideLabel: section.hideLabel,
          options: section.options,
        },
      }

    case 'proper':
      return {
        type: 'interaction',
        kind: 'proper',
        slot: section.slot,
        form: section.form,
        description: section.description,
      }

    case 'rendered-offering':
      return {
        type: 'interaction',
        kind: 'offering',
        mode: section.mode,
        default: section.default,
        show: section.show,
        label: section.label,
      }

    case 'rendered-capture-movement':
      return {
        type: 'interaction',
        kind: 'capture-movement',
        movement: section.kind,
        prompt: section.prompt,
        multi: section.multi,
        defaultCadence: section.defaultCadence,
      }

    case 'rendered-capture-resolution':
      return {
        type: 'interaction',
        kind: 'capture-resolution',
        level: section.level,
        forward: section.forward,
        prompt: section.prompt,
        window: section.window,
        prefill: section.prefill,
      }

    case 'rendered-review-resolution':
      return {
        type: 'interaction',
        kind: 'review-resolution',
        mode: section.mode,
        target: section.target,
        resolution: section.resolution,
        prompt: section.prompt,
        outcomes: section.outcomes,
        allowNotes: section.allow_notes,
      }

    default: {
      // Exhaustiveness: a new RenderedSection variant must add a primitive
      // mapping here or the engine will silently dead-end.
      const _exhaustive: never = section
      throw new Error(
        `preprocessFlow: unhandled section type ${(_exhaustive as { type: string }).type}`,
      )
    }
  }
}

// Splits a `\nLine-delimited` BilingualText into per-line items. Single pass
// per language — secondary's lines are zipped onto primary's by index.
function bilingualLines(text: BilingualText): { text: BilingualText }[] {
  const primary = text.primary.split('\n').filter((l) => l.length > 0)
  const secondary = text.secondary
    ? text.secondary.split('\n').filter((l) => l.length > 0)
    : undefined
  return primary.map((line, i) => ({
    text: { primary: line, secondary: secondary?.[i] },
  }))
}

function makeSourceAccessor(ctx: PreprocessContext): SourceAccessor {
  const accessor: SourceAccessor = {
    fetch: async (otherSource, otherParams) => {
      const params = scopedParams(otherSource as ContentSource, otherParams ?? {}, ctx.date)
      const otherCtx: SourceFetchContext = {
        params,
        prefs: ctx.prefs,
        date: ctx.date,
        programDay: ctx.programDay,
        sources: accessor,
      }
      const cached = await ctx.queryClient.fetchQuery({
        queryKey: [
          'source',
          otherSource.id,
          otherSource.version,
          cacheKeyFor(otherSource as ContentSource, params, ctx.prefs),
        ] as const,
        queryFn: () => runCachedSource(otherSource as ContentSource, otherCtx),
        staleTime: Number.POSITIVE_INFINITY,
      })
      return cached.payload as ReturnType<typeof otherSource.fetch> extends Promise<infer R>
        ? R
        : never
    },
  }
  return accessor
}

async function fetchFromSource(
  ref: string,
  rawParams: Record<string, unknown>,
  ctx: PreprocessContext,
  accessor: SourceAccessor,
): Promise<Primitive | Primitive[]> {
  const source = getSource(ref)
  if (!source) throw new Error(`preprocessFlow: unknown source ${ref}`)

  const params = scopedParams(source, rawParams, ctx.date)
  const fetchCtx: SourceFetchContext = {
    params,
    prefs: ctx.prefs,
    date: ctx.date,
    programDay: ctx.programDay,
    sources: accessor,
  }
  const cached = await ctx.queryClient.fetchQuery({
    queryKey: [
      'source',
      source.id,
      source.version,
      cacheKeyFor(source, params, ctx.prefs),
    ] as const,
    queryFn: () => runCachedSource(source, fetchCtx),
    staleTime: Number.POSITIVE_INFINITY,
  })
  return cached.payload
}
