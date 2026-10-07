import { type FlowContext, type RenderedSection, resolveFlowAsync } from '@ember/content-engine'
import { QueryClient } from '@tanstack/react-query'
import { getDayOfYear } from 'date-fns'
import { createEngineContext } from '@/content/engineContext'
import { preprocessFlow } from '@/content/preprocessFlow'
import type { Primitive } from '@/content/primitives'
import {
  getManifest,
  loadFlow,
  loadPerDayFlow,
  loadPracticeData,
  loadPracticeTracks,
} from '@/content/resolver'
import { transfersForJurisdiction } from '@/lib/missal/loaders'
import { bootCorpus } from './corpus'
import { jurisdiction, type Locale, withLocale } from './locale'

export type PracticeRender = {
  primitives: Primitive[]
}

export type PracticeRenderOptions = {
  date: Date
  programDay?: number
  /** Latin beside the vernacular, where the text has it. */
  parallelLatin?: boolean
  pins?: Record<string, string>
}

// The app preprocesses only the selected branch of a `select` and resolves the
// others when their tab is tapped. A static page has no second pass, so every
// branch is materialized up front.
async function materializeSelects(
  primitives: Primitive[],
  preprocess: (sections: NonNullable<SelectOption['rawSections']>) => Promise<Primitive[]>,
): Promise<void> {
  for (const primitive of primitives) {
    if (primitive.type !== 'container') continue
    if (primitive.children) await materializeSelects(primitive.children, preprocess)
    const behavior = primitive.behavior
    if (behavior.kind !== 'select' && behavior.kind !== 'options') continue
    for (const option of behavior.options) {
      if (option.children.length === 0 && option.rawSections?.length) {
        option.children = await preprocess(option.rawSections)
      }
      option.rawSections = undefined
      await materializeSelects(option.children, preprocess)
    }
  }
}

type SelectOption = Extract<
  Extract<Primitive, { type: 'container' }>['behavior'],
  { kind: 'select' }
>['options'][number]

/** Engine output → the renderer's primitive tree, every select branch included. */
export async function toPrimitives(
  rendered: RenderedSection[],
  locale: Locale,
  date: Date,
  programDay?: number,
): Promise<Primitive[]> {
  const context = {
    queryClient: new QueryClient(),
    // The site reads Scripture in the Douay-Rheims; an in-copyright translation
    // is fetched from its publisher and never built into a page.
    prefs: { lang: locale, translation: 'DRB', jurisdiction: jurisdiction[locale] },
    date,
    programDay,
  }
  const primitives = await preprocessFlow(rendered, context)
  await materializeSelects(primitives, (sections) => preprocessFlow(sections, context))
  return primitives
}

export async function renderPractice(
  id: string,
  locale: Locale,
  options: PracticeRenderOptions,
): Promise<PracticeRender | undefined> {
  await bootCorpus()
  return withLocale(locale, async () => {
    const manifest = getManifest(id)
    if (!manifest) return undefined
    const perDay =
      options.programDay !== undefined ? await loadPerDayFlow(id, options.programDay) : undefined
    const flow = perDay ?? (await loadFlow(id))
    if (!flow) return undefined

    const [cycleData, trackDefs] = await Promise.all([loadPracticeData(id), loadPracticeTracks(id)])
    // The app keeps a reading cursor per track; a public page has no reader
    // state, so a year-long track shows the reading of the calendar day.
    const dayIndex = getDayOfYear(options.date) - 1
    const trackState = trackDefs
      ? Object.fromEntries(Object.keys(trackDefs).map((t) => [t, { current_index: dayIndex }]))
      : undefined

    const context: FlowContext = {
      date: options.date,
      ofTransfers: transfersForJurisdiction(jurisdiction[locale]),
      // Noon keeps hour-mapped selects (the Office's hour tabs) on a stable default.
      now: new Date(
        options.date.getFullYear(),
        options.date.getMonth(),
        options.date.getDate(),
        12,
      ),
      numbering: 'lxx',
      trackDefs,
      trackState,
      cycleData,
      programDay: options.programDay,
      selectOverrides: options.pins ?? {},
      templateVars: manifest.vars,
    }
    const ec = createEngineContext(undefined, {
      contentLanguage: locale,
      secondaryLanguage: options.parallelLatin ? 'la' : undefined,
    })
    const rendered = await resolveFlowAsync(flow, context, ec)
    return { primitives: await toPrimitives(rendered, locale, options.date, options.programDay) }
  })
}
