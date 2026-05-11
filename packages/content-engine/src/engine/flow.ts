import {
  getLiturgicalDayName,
  type LiturgicalDayMap,
  resolveLiturgicalDay,
} from '@ember/liturgical'
import { getDataSource, type SourceContext } from '../data-sources'
import type {
  FlowDefinition,
  FlowSection,
  LocalizedContent,
  RenderedSection,
  RepeatEntry,
  ResolveStep,
} from '../types'
import { resolveLanguageCandidates } from './book-language'
import { composeVars, type EngineContext, type FlowContext, resolvePath } from './context'
import { resolveSection } from './resolve'
import { computeSelectedId, selectedItemAndId } from './sections/select'
import { substituteInFlowSection, substituteTemplateVars } from './vars'

type ResolveExecutionResult = {
  context: FlowContext
  dynamicBookChapters: { book: string; chapterId: string }[]
}

function isLiturgicalDayMap(value: unknown): value is LiturgicalDayMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Partial<LiturgicalDayMap>
  return (
    typeof map.temporal === 'object' &&
    map.temporal !== null &&
    typeof map.fixedDates === 'object' &&
    map.fixedDates !== null &&
    typeof map.feasts === 'object' &&
    map.feasts !== null &&
    typeof map.novenas === 'object' &&
    map.novenas !== null &&
    (map.weekdaysOfMonths === undefined ||
      (typeof map.weekdaysOfMonths === 'object' && map.weekdaysOfMonths !== null)) &&
    Array.isArray(map.reserves)
  )
}

function runResolveStrategy(
  step: ResolveStep,
  context: FlowContext,
  ec: EngineContext,
): { entries: RepeatEntry[]; templateVars?: Record<string, string> } {
  if (step.source && step.source !== 'liturgical') return { entries: [] }
  if (
    step.dataType &&
    step.dataType !== 'liturgical-meditation-map' &&
    step.dataType !== 'liturgical-lectionary-map'
  )
    return { entries: [] }
  if (step.strategy !== 'liturgical-day') return { entries: [] }

  const map = context.cycleData?.[step.data]
  if (!isLiturgicalDayMap(map)) return { entries: [] }

  const entries: RepeatEntry[] = resolveLiturgicalDay(context.date, map).map((e) => ({
    chapterId: e.id,
    category: e.category,
  }))

  // FIXME: fix at the root cause in FlowContext
  const form = step.calendar || (context.liturgicalCalendar as 'ef' | 'of') || ('ef' as const)
  const liturgicalLabel = getLiturgicalDayName(context.date, form, { t: ec.t })

  return { entries, templateVars: { liturgicalLabel } }
}

function executeResolveSteps(
  flow: FlowDefinition,
  context: FlowContext,
  ec: EngineContext,
): ResolveExecutionResult {
  if (!flow.resolve?.length) return { context, dynamicBookChapters: [] }

  let ctx = context
  const dynamicBookChapters: { book: string; chapterId: string }[] = []

  for (const step of flow.resolve) {
    const strategyResult = runResolveStrategy(step, ctx, ec)
    let entries = strategyResult.entries.map((entry) => ({ ...entry }))

    const dynamicBook = step.book
    if (dynamicBook) {
      entries = entries.map((entry) => {
        const chapterId = typeof entry.chapterId === 'string' ? entry.chapterId : undefined
        if (!chapterId) return entry
        dynamicBookChapters.push({ book: dynamicBook, chapterId })
        if (typeof entry.label === 'string' && entry.label.length > 0) return entry
        const title = ec.getBookChapterTitle?.(dynamicBook, chapterId, ec.language)
        return { ...entry, label: title ?? chapterId }
      })
    }

    const firstLabel = entries[0]?.label
    const strategyVars = strategyResult.templateVars ?? {}
    const mergedVars: Record<string, string> = {
      ...strategyVars,
      meditationTitle:
        typeof firstLabel === 'string'
          ? firstLabel
          : (strategyVars.liturgicalLabel ?? ctx.templateVars?.meditationTitle ?? ''),
    }

    const firstRef = entries[0]?.chapterId
    if (typeof firstRef === 'string') {
      mergedVars[`${step.as}Ref`] = firstRef
    }

    ctx = {
      ...ctx,
      flowData: { ...ctx.flowData, [step.as]: entries },
      templateVars: { ...ctx.templateVars, ...mergedVars },
    }
  }

  return { context: ctx, dynamicBookChapters }
}

function buildSourceContext(context: FlowContext, ec: EngineContext): SourceContext {
  return {
    fetchOwnAsset:
      ec.fetchOwnAsset ??
      // Default: when no host-supplied reader, fall back to the practice's
      // pre-loaded data declarations (cycleData).
      (async (path: string) => context.cycleData?.[path] as unknown),
    localize: ec.localize,
    t: ec.t,
    now: () => context.date,
  }
}

async function executeLoadSteps(
  flow: FlowDefinition,
  context: FlowContext,
  ec: EngineContext,
): Promise<FlowContext> {
  if (!flow.load?.length) return context

  let ctx = context
  const sourceCtx = buildSourceContext(context, ec)

  for (const step of flow.load) {
    const source = getDataSource(step.source)
    if (!source) {
      // Unknown source — skip. Validation should catch this at the schema layer.
      continue
    }

    const args: Record<string, unknown> = { ...step }
    delete args.as
    delete args.source

    const result = await source.load(args, sourceCtx)
    ctx = {
      ...ctx,
      flowData: { ...ctx.flowData, [step.as]: result },
    }
  }
  return ctx
}

function chapterCacheKey(book: string, chapter: string): string {
  return `${book}::${chapter}`
}

function assertSupportedFlowVersion(flow: FlowDefinition): void {
  if (!flow.flowVersion || flow.flowVersion === '1') return
  throw new Error(`Unsupported flowVersion: ${flow.flowVersion}`)
}

function collectBookChapterRefs(
  flow: FlowDefinition,
  context: FlowContext,
): { book: string; chapterId: string }[] {
  const refs: { book: string; chapterId: string }[] = []

  function walkSection(section: FlowSection): void {
    switch (section.type) {
      case 'prose':
        if ('book' in section && section.book && section.chapter) {
          if (!section.chapter.includes('{{')) {
            refs.push({ book: section.book, chapterId: section.chapter })
          }
        }
        break
      case 'cycle':
        if (section.as === 'template' && section.sections) {
          const cycleData = context.cycleData?.[section.data]
          if (cycleData) {
            const allEntries = Object.values(cycleData.entries).flat()
            for (const entry of allEntries) {
              const vars: Record<string, string | undefined> = {}
              for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
                if (typeof v === 'string') vars[k] = v
              }
              for (const s of section.sections) {
                const substituted = substituteInFlowSection(s, vars)
                walkSection(substituted)
              }
            }
          } else {
            for (const s of section.sections) walkSection(s)
          }
        }
        break
      case 'repeat':
        for (const s of section.sections) walkSection(s)
        break
      case 'options':
        if ('from' in section) {
          for (const s of section.sections) walkSection(s)
        } else {
          for (const opt of section.options) {
            for (const s of opt.sections) walkSection(s)
          }
        }
        break
      case 'prayer':
        if ('sections' in section && section.sections) {
          for (const s of section.sections) walkSection(s)
        }
        break
      case 'select':
        if ('from' in section) {
          for (const s of section.body) walkSection(s)
        } else {
          for (const opt of section.options) {
            if (opt.sections) for (const s of opt.sections) walkSection(s)
          }
        }
        break
    }
  }

  for (const section of flow.sections) walkSection(section)
  if (flow.fragments) {
    for (const fragmentSections of Object.values(flow.fragments)) {
      for (const section of fragmentSections) walkSection(section)
    }
  }

  return refs
}

function resolveFlowWithContext(
  flow: FlowDefinition,
  ctx: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  const vars = composeVars(ctx)
  const hasVars = Object.keys(vars).length > 0
  const sections = hasVars
    ? flow.sections.map((s) => substituteInFlowSection(s, vars))
    : flow.sections

  // Process sequentially so select `as` variables propagate to subsequent sections
  const result: RenderedSection[] = []
  for (const section of sections) {
    if (section.type === 'select' && section.as) {
      if ('from' in section) {
        // From-data select: resolve the array, pick the selected item, bind it
        // (the whole object) under flowData[as] so subsequent siblings can
        // path-access it as `{{celebration.title}}` etc. Do NOT also bind the
        // selected id into templateVars[as] — that would shadow the object via
        // composeVars's templateVars-wins precedence and break path access.
        const fromPath = substituteTemplateVars(section.from, composeVars(ctx))
        const value = resolvePath(ctx, fromPath)
        const items = Array.isArray(value) ? value : []
        if (items.length > 0) {
          const { item } = selectedItemAndId(section, items, ctx)
          ctx = {
            ...ctx,
            flowData: { ...ctx.flowData, [section.as]: item },
          }
        }
      } else {
        const { selectedId } = computeSelectedId(section, ctx)
        ctx = { ...ctx, templateVars: { ...ctx.templateVars, [section.as]: selectedId } }
      }
    }
    result.push(...resolveSection(section, ctx, engineContext))
  }
  return result
}

export function resolveFlow(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  assertSupportedFlowVersion(flow)

  // Inject flow.data into flowData (flow.data is lower priority than context.flowData)
  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }
  if (flow.fragments) {
    ctx = { ...ctx, fragments: flow.fragments }
  }
  ctx = executeResolveSteps(flow, ctx, engineContext).context
  return resolveFlowWithContext(flow, ctx, engineContext)
}

export async function resolveFlowAsync(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): Promise<RenderedSection[]> {
  assertSupportedFlowVersion(flow)

  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }
  if (flow.fragments) {
    ctx = { ...ctx, fragments: flow.fragments }
  }

  const { context: resolvedContext, dynamicBookChapters } = executeResolveSteps(
    flow,
    ctx,
    engineContext,
  )
  ctx = resolvedContext

  // Registry-based load steps run after resolve steps. They can read values
  // bound by resolve steps and write into flowData under their own `as` keys.
  ctx = await executeLoadSteps(flow, ctx, engineContext)

  const sectionBookChapterRefs = collectBookChapterRefs(flow, ctx)
  const allBookChapterRefs = [...dynamicBookChapters, ...sectionBookChapterRefs]

  if (allBookChapterRefs.length === 0) {
    return resolveFlowWithContext(flow, ctx, engineContext)
  }

  const chapterCache = new Map<string, LocalizedContent>()
  const uniqueRequests = Array.from(
    new Map(
      allBookChapterRefs.map((item) => [chapterCacheKey(item.book, item.chapterId), item]),
    ).values(),
  )

  for (const request of uniqueRequests) {
    const cached: LocalizedContent = {}
    const preloadLanguages = resolveLanguageCandidates(engineContext, request.book, 'book-default')

    for (const preloadLanguage of preloadLanguages) {
      const loaded = engineContext.loadBookChapterTextAsync
        ? await engineContext.loadBookChapterTextAsync(
            request.book,
            request.chapterId,
            preloadLanguage,
          )
        : engineContext.loadBookChapterText?.(request.book, request.chapterId, preloadLanguage)
      if (!loaded) continue
      for (const [lang, text] of Object.entries(loaded)) {
        if (text) (cached as Record<string, string>)[lang] = text
      }
    }

    if (Object.keys(cached).length > 0) {
      chapterCache.set(chapterCacheKey(request.book, request.chapterId), cached)
    }
  }

  const hydratedEngineContext: EngineContext = {
    ...engineContext,
    loadBookChapterText: (book, chapter) => chapterCache.get(chapterCacheKey(book, chapter)),
  }

  return resolveFlowWithContext(flow, ctx, hydratedEngineContext)
}
