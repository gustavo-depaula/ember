import type { RenderedSection } from '@ember/content-engine'
import type { QueryClient } from '@tanstack/react-query'
import type { CccParagraph } from '@/lib/catechism'
import type { ChapterResult } from '@/lib/content'
import type { CachedProducerResult, ProducerContext, ProducerPrefs } from '@/producers'
import { getProducer } from '@/producers'
import { bibleChapterProducer } from '@/producers/bible-chapter'
import { cccChapterProducer } from '@/producers/ccc-chapter'
import { type PsalmodySlot, psalmodyProducer } from '@/producers/psalmody'
import { runCachedProducer } from '@/producers/runCachedProducer'
import type { ResolvedSection } from './resolvedTypes'

export type PreprocessContext = {
  queryClient: QueryClient
  prefs: ProducerPrefs
  date: Date
  programDay?: number
}

// One async tree map. Content nodes (reading / psalmody / include) fan out
// to producers via queryClient.fetchQuery, riding React Query's in-memory
// dedup + SQLite-backed runCachedProducer for cold-start. Siblings resolve
// in parallel via Promise.all.
export async function preprocessFlow(
  sections: RenderedSection[],
  ctx: PreprocessContext,
): Promise<ResolvedSection[]> {
  return Promise.all(sections.map((s) => preprocessSection(s, ctx)))
}

async function preprocessSection(
  section: RenderedSection,
  ctx: PreprocessContext,
): Promise<ResolvedSection> {
  switch (section.type) {
    case 'reading':
      return { ...section, data: await fetchReading(section.reference, ctx) }

    case 'psalmody': {
      if (section.psalms.length === 0) return { ...section, data: [] }
      const result = await runProducer(psalmodyProducer.id, { psalms: section.psalms }, ctx)
      return { ...section, data: (result.payload as { data: PsalmodySlot[] }).data }
    }

    case 'include': {
      const producer = getProducer(section.ref)
      if (!producer) throw new Error(`preprocessFlow: unknown producer ${section.ref}`)
      const data = await runProducer(section.ref, section.params, ctx)
      if (producer.kind === 'flow' && 'sections' in data.payload) {
        const resolvedSections = await preprocessFlow(data.payload.sections, ctx)
        return { ...section, data, resolvedSections }
      }
      return { ...section, data }
    }

    case 'prayer':
      return {
        ...section,
        sections: section.sections ? await preprocessFlow(section.sections, ctx) : undefined,
      }

    case 'collapsible':
    case 'liturgical-color-scope':
      return { ...section, sections: await preprocessFlow(section.sections, ctx) }

    case 'options':
    case 'select':
      return {
        ...section,
        options: await Promise.all(
          section.options.map(async (o) => ({
            ...o,
            sections: await preprocessFlow(o.sections, ctx),
          })),
        ),
      }

    default:
      return section
  }
}

async function fetchReading(
  reference: Extract<RenderedSection, { type: 'reading' }>['reference'],
  ctx: PreprocessContext,
): Promise<ChapterResult | CccParagraph[]> {
  if (reference.type === 'bible') {
    const result = await runProducer(
      bibleChapterProducer.id,
      { book: reference.book, chapter: reference.chapter },
      ctx,
    )
    return (result.payload as { data: ChapterResult }).data
  }
  const result = await runProducer(
    cccChapterProducer.id,
    { start: reference.startParagraph, count: reference.count },
    ctx,
  )
  return (result.payload as { data: CccParagraph[] }).data
}

async function runProducer(
  ref: string,
  params: Record<string, unknown> | undefined,
  ctx: PreprocessContext,
): Promise<CachedProducerResult> {
  const producer = getProducer(ref)
  if (!producer) throw new Error(`preprocessFlow: unknown producer ${ref}`)

  const producerCtx: ProducerContext = {
    date: ctx.date,
    prefs: ctx.prefs,
    programDay: ctx.programDay,
    params,
  }

  return ctx.queryClient.fetchQuery({
    queryKey: ['producer', ref, producer.version, producer.cacheKey(producerCtx)] as const,
    queryFn: () => runCachedProducer(producer, producerCtx),
    staleTime: Number.POSITIVE_INFINITY,
  })
}
