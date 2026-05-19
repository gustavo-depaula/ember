import type { RenderedSection } from '@ember/content-engine'
import type { QueryClient } from '@tanstack/react-query'
import type { PsalmRef } from '@/lib/liturgical'
import type {
  ContentSource,
  ProducerPrefs,
  SourceAccessor,
  SourceFetchContext,
} from '@/producers'
import { cacheKeyFor, getSource, runCachedSource } from '@/producers'
import type {
  ContainerOption,
  ContainerPrimitive,
  Primitive,
} from './primitives'

export type PreprocessContext = {
  queryClient: QueryClient
  prefs: ProducerPrefs
  date: Date
  programDay?: number
}

// Walks the engine's RenderedSection[] output and produces a Primitive[]
// tree. Every variant maps to one or more primitives; reading/psalmody/
// include nodes call the source registry to fetch their data, splice the
// fetched primitives in place, and return.
export async function preprocessFlow(
  sections: RenderedSection[],
  ctx: PreprocessContext,
): Promise<Primitive[]> {
  const resolved = await Promise.all(sections.map((s) => preprocessSection(s, ctx)))
  // Flatten — sources can return Primitive[] (psalmody fans out per-psalm).
  return resolved.flat()
}

async function preprocessSection(
  section: RenderedSection,
  ctx: PreprocessContext,
): Promise<Primitive | Primitive[]> {
  switch (section.type) {
    // — Content fetches —

    case 'reading':
      return section.reference.type === 'bible'
        ? fetchPrimitive('producer/bible-chapter', { book: section.reference.book, chapter: section.reference.chapter }, ctx)
        : fetchPrimitive('producer/ccc-chapter', { start: section.reference.startParagraph, count: section.reference.count }, ctx)

    case 'producer/psalmody':
      if (section.psalms.length === 0) return []
      return fetchPrimitive('producer/psalmody', { psalms: section.psalms as PsalmRef[] }, ctx)

    case 'include':
      return fetchPrimitive(section.ref, section.params ?? {}, ctx)

    // — Leaf primitives —

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
        items: splitTextIntoLines(section.text),
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
          items: splitTextIntoLines(section.text),
        },
      ]

    case 'response':
      return {
        type: 'verses',
        items: section.verses.flatMap((vr) => [
          { num: 'V', text: vr.v },
          { num: 'R', text: vr.r },
        ]),
        style: 'vr',
      }

    case 'gallery':
      return section.items.map((item): Primitive => ({
        type: 'image',
        src: item.src,
        caption: item.caption,
        attribution: item.attribution,
      }))

    case 'holy-card':
      return {
        type: 'image',
        src: section.image,
        caption: section.title,
        attribution: section.attribution,
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

    // — Containers (children themselves go through preprocessFlow) —

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
      // No title, no speaker — falls back to a plain text block.
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
      const container: ContainerPrimitive = {
        type: 'container',
        behavior: {
          kind: 'options',
          label: section.label,
          pickerStyle: section.pickerStyle,
          options,
        },
      }
      return container
    }

    case 'select': {
      const options: ContainerOption[] = await Promise.all(
        section.options.map(async (o) => ({
          id: o.id,
          label: o.label,
          children: await preprocessFlow(o.sections, ctx),
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

    // — Interactions —

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
  }
}

// Splits a BilingualText "Line one\nLine two" into per-line items for the
// verses primitive — hymns and canticles author their text as a single block.
function splitTextIntoLines(
  text: import('@ember/content-engine').BilingualText,
): { text: import('@ember/content-engine').BilingualText }[] {
  const lines = text.primary.split('\n').filter((l) => l.length > 0)
  return lines.map((line, i) => ({
    text: {
      primary: line,
      secondary: text.secondary?.split('\n').filter((l) => l.length > 0)[i],
    },
  }))
}

// Fan-out: build the SourceFetchContext, dispatch via React Query + SQLite.
async function fetchPrimitive(
  ref: string,
  params: Record<string, unknown>,
  ctx: PreprocessContext,
): Promise<Primitive | Primitive[]> {
  const source = getSource(ref)
  if (!source) throw new Error(`preprocessFlow: unknown source ${ref}`)

  const accessor: SourceAccessor = {
    fetch: async (otherSource, otherParams) => {
      const otherCtx: SourceFetchContext = {
        params: otherParams ?? {},
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
          cacheKeyFor(otherSource as ContentSource, otherParams ?? {}, ctx.prefs),
        ] as const,
        queryFn: () => runCachedSource(otherSource as ContentSource, otherCtx),
        staleTime: Number.POSITIVE_INFINITY,
      })
      // Type the cached payload to match the source's declared output.
      return cached.payload as ReturnType<typeof otherSource.fetch> extends Promise<infer R> ? R : never
    },
  }

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
