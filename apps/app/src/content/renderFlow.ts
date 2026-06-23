// The shared engine→preprocess core: resolve a flow into RenderedSection[],
// then preprocess producer-fetched data into a static Primitive[] tree. Callers
// build the FlowContext (where date/track/cycle sourcing legitimately differs —
// React hooks vs. headless) and pass the language/translation deps; this owns
// the engine wiring so it stays identical across call sites.
//
// Used by usePracticeContent (live render) and reader-sync's headless pipeline.

import {
  type ContentLanguage,
  type FlowContext,
  type FlowDefinition,
  resolveFlowAsync,
} from '@ember/content-engine'
import type { QueryClient } from '@tanstack/react-query'
import { createEngineContext, withSpiritualThreads } from './engineContext'
import { preprocessFlow } from './preprocessFlow'
import type { Primitive } from './primitives'
import type { RenderedSection } from './types'

export type RenderFlowDeps = {
  contentLanguage: ContentLanguage
  secondaryLanguage?: ContentLanguage
  translation: string
  doVersion: string
  queryClient: QueryClient
}

export async function renderFlow(
  flow: FlowDefinition,
  context: FlowContext,
  deps: RenderFlowDeps,
): Promise<{ renderedSections: RenderedSection[]; primitives: Primitive[] }> {
  const ec = withSpiritualThreads(
    createEngineContext(undefined, {
      contentLanguage: deps.contentLanguage,
      secondaryLanguage: deps.secondaryLanguage,
    }),
  )
  const renderedSections = await resolveFlowAsync(flow, context, ec)
  const primitives = await preprocessFlow(renderedSections, {
    queryClient: deps.queryClient,
    prefs: { lang: deps.contentLanguage, translation: deps.translation, doVersion: deps.doVersion },
    date: context.date,
    programDay: context.programDay,
  })
  return { renderedSections, primitives }
}
