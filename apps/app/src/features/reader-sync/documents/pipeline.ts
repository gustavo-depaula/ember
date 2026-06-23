// Headless practice → Primitive[]. This is usePracticeContent's queryFn lifted
// out of React: same resolve → preprocess sequence, but driven by an explicit
// date and a caller-supplied QueryClient so source caching still works. Reader
// Sync renders documents off the render thread, so it can't use the hooks.

import type { FlowContext } from '@ember/content-engine'
import type { QueryClient } from '@tanstack/react-query'
import type { Primitive } from '@/content/primitives'
import { renderFlow } from '@/content/renderFlow'
import {
  getManifest,
  loadFlow,
  loadPerDayFlow,
  loadPracticeData,
  loadPracticeTracks,
} from '@/content/resolver'
import { getCursorsWithPrefix } from '@/db/repositories'
import { ensurePracticeCursors } from '@/features/divine-office'
import { getPsalmNumbering } from '@/lib/bolls'
import { usePreferencesStore } from '@/stores/preferencesStore'

function trackStateFor(practiceId: string): Record<string, { current_index: number }> | undefined {
  const cursors = getCursorsWithPrefix(`${practiceId}/`)
  if (cursors.length === 0) return undefined
  const state: Record<string, { current_index: number }> = {}
  for (const cursor of cursors) {
    const trackName = cursor.id.split('/').pop()
    if (!trackName) continue
    const position = JSON.parse(cursor.position)
    state[trackName] = { current_index: position.index ?? 0 }
  }
  return state
}

export async function practiceToPrimitives(opts: {
  practiceId: string
  date: Date
  queryClient: QueryClient
  programDay?: number
}): Promise<Primitive[]> {
  const { practiceId, date, queryClient, programDay } = opts
  const manifest = getManifest(practiceId)
  if (!manifest) throw new Error(`Unknown practice: ${practiceId}`)

  const flow =
    manifest.program?.perDayFlows && programDay !== undefined
      ? ((await loadPerDayFlow(practiceId, programDay)) ?? (await loadFlow(practiceId)))
      : await loadFlow(practiceId)
  if (!flow) throw new Error(`No flow for practice: ${practiceId}`)

  const [cycleData, trackDefs] = await Promise.all([
    loadPracticeData(practiceId),
    loadPracticeTracks(practiceId),
  ])
  if (trackDefs) await ensurePracticeCursors(practiceId, Object.keys(trackDefs))
  const trackState = trackDefs ? trackStateFor(practiceId) : undefined

  const prefs = usePreferencesStore.getState()
  const numbering = getPsalmNumbering(prefs.translation)

  const context: FlowContext = {
    date,
    now: new Date(),
    numbering,
    liturgicalCalendar: prefs.liturgicalCalendar,
    trackDefs: trackDefs ?? undefined,
    trackState,
    cycleData: cycleData ?? undefined,
    programDay,
    selectOverrides: {},
  }
  const { primitives } = await renderFlow(flow, context, {
    contentLanguage: prefs.contentLanguage,
    secondaryLanguage: prefs.secondaryLanguage,
    translation: prefs.translation,
    doVersion: prefs.doVersion,
    queryClient,
  })
  return primitives
}
