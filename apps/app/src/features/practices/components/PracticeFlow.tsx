// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import { type FlowContext, resolveFlowAsync } from '@ember/content-engine'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'
import {
  AnimatedPressable,
  BibleReadingBlock,
  CccReadingBlock,
  confirm,
  IncludeBlock,
  InlineRetry,
  ManuscriptFrame,
  ProperSlot,
  PsalmodyBlock,
  type PsalmSlot,
  ScreenLayout,
  Threshold,
} from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import { SectionBlock } from '@/components/SectionBlock'
import { createEngineContext, withSpiritualThreads } from '@/content/engineContext'
import {
  getManifest,
  loadFlow,
  loadPerDayFlow,
  loadPracticeData,
  loadPracticeTracks,
} from '@/content/resolver'
import type { RenderedSection } from '@/content/types'
import {
  ensurePracticeCursors,
  useAdvanceCursor,
  useCursorsForPractice,
} from '@/features/divine-office'
import { RenderedCaptureMovementBlock, RenderedOfferingBlock } from '@/features/movements'
import {
  useHandleProgramCompletion,
  useLogCompletion,
  useProgramProgress,
  useRestartProgram,
  useSlots,
} from '@/features/plan-of-life'
import { ProgramCompleteModal } from '@/features/practices/components/ProgramCompleteModal'
import {
  RenderedCaptureResolutionBlock,
  RenderedReviewResolutionBlock,
} from '@/features/resolutions'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { useToday } from '@/hooks/useToday'
import { getPsalmNumbering } from '@/lib/bolls'
import type { CccParagraph } from '@/lib/catechism'
import type { ChapterResult } from '@/lib/content'
import { successBuzz } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { PsalmRef, ReadingReference } from '@/lib/liturgical'
import { parseSlotKey } from '@/lib/slotKey'
import { type ResourceMap, useResourceQueries } from '@/lib/useResourceQueries'
import type { CachedProducerResult } from '@/producers'
import { getProducer, includeKeyFor, runCachedProducer } from '@/producers'
import type { PsalmodySlot } from '@/producers/psalmody'
import { usePreferencesStore } from '@/stores/preferencesStore'

// Descends through container sections so dynamic content (readings, psalmody)
// nested inside a select/options/collapsible/liturgical-color-scope/prayer is
// still collected for prefetch — otherwise its query never fires and the block
// renders blank.
function* walkRenderedSections(sections: RenderedSection[]): Generator<RenderedSection> {
  for (const s of sections) {
    yield s
    switch (s.type) {
      case 'select':
      case 'options':
        for (const opt of s.options) yield* walkRenderedSections(opt.sections)
        break
      case 'collapsible':
      case 'liturgical-color-scope':
        yield* walkRenderedSections(s.sections)
        break
      case 'prayer':
        if (s.sections) yield* walkRenderedSections(s.sections)
        break
    }
  }
}

type DynamicResources = ResourceMap<CachedProducerResult>

// A producer call has two keys that are deliberately distinct:
// - `id`  identifies the flow section in the renderer ("which bible chapter,
//         which psalmody slot list"). Translation-free, because the renderer
//         only knows the section data — not user preferences.
// - `ref` + `params` define the fetch. Translation lives in `params`, which
//         feeds the producer's cacheKey + React Query's queryKey — so
//         changing translation triggers a refetch without translation
//         leaking into the renderer's lookup path.
type ProducerCall = { id: string; ref: string; params: Record<string, unknown> }

function readingId(ref: ReadingReference): string {
  return ref.type === 'bible'
    ? `reading:bible:${ref.book}:${ref.chapter}`
    : `reading:ccc:${ref.startParagraph}:${ref.count}`
}

function psalmodyId(psalms: PsalmRef[]): string {
  const tokens = psalms.map((r) =>
    r.verseRange ? `${r.psalm}:${r.verseRange[0]}-${r.verseRange[1]}` : String(r.psalm),
  )
  return `psalmody:${tokens.join(',')}`
}

function collectProducerCalls(
  sections: RenderedSection[],
  translation: string,
): ProducerCall[] {
  const seen = new Map<string, ProducerCall>()
  const add = (call: ProducerCall) => {
    if (!seen.has(call.id)) seen.set(call.id, call)
  }
  for (const s of walkRenderedSections(sections)) {
    if (s.type === 'include') {
      add({ id: includeKeyFor(s.ref, s.params), ref: s.ref, params: s.params ?? {} })
    } else if (s.type === 'reading') {
      const ref = s.reference
      if (ref.type === 'bible')
        add({
          id: readingId(ref),
          ref: 'producer/bible-chapter',
          params: { translation, book: ref.book, chapter: ref.chapter },
        })
      else
        add({
          id: readingId(ref),
          ref: 'producer/ccc-chapter',
          params: { start: ref.startParagraph, count: ref.count },
        })
    } else if (s.type === 'psalmody' && s.psalms.length > 0) {
      add({
        id: psalmodyId(s.psalms),
        ref: 'producer/psalmody',
        params: { translation, psalms: s.psalms },
      })
    }
  }
  return Array.from(seen.values())
}

function findTrackIds(sections: RenderedSection[]): string[] {
  const ids = new Set<string>()
  for (const s of walkRenderedSections(sections)) {
    if (s.type === 'reading' && s.trackId) ids.add(s.trackId)
  }
  return Array.from(ids)
}

export function PracticeFlow({
  practiceId,
  programDay: programDayProp,
}: {
  practiceId: string
  programDay?: number
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const readingMargin = useReadingMargin()
  const logCompletionMutation = useLogCompletion()
  const advanceCursor = useAdvanceCursor()
  const handleProgramCompletion = useHandleProgramCompletion()
  const restartProgramMutation = useRestartProgram()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectOverrides, setSelectOverrides] = useState<Record<string, string>>({})
  const [sections, setSections] = useState<RenderedSection[]>([])
  const [isResolvingFlow, setIsResolvingFlow] = useState(false)
  const [thresholdElapsed, setThresholdElapsed] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setThresholdElapsed(true), 900)
    return () => clearTimeout(id)
  }, [])

  const manifest = getManifest(practiceId)
  const programProgress = useProgramProgress(practiceId, manifest?.program)
  const programDay = programDayProp ?? programProgress?.programDay

  const slots = useSlots()
  const currentSlot = slots.find((s) => s.practice_id === practiceId)

  const flowQuery = useQuery({
    queryKey: ['flow', practiceId, programDay ?? null],
    queryFn: async () => {
      if (!manifest) return null
      if (manifest.program?.perDayFlows && programDay !== undefined) {
        const dayFlow = await loadPerDayFlow(practiceId, programDay)
        if (dayFlow) return dayFlow
      }
      return (await loadFlow(practiceId)) ?? null
    },
    enabled: !!manifest,
    staleTime: Infinity,
  })
  const flow = flowQuery.data ?? undefined

  const selectOverrideResetKey = `${practiceId}:${programDay ?? 'default'}:${flow ? 'loaded' : 'missing'}`

  useEffect(() => {
    if (selectOverrideResetKey) {
      setSelectOverrides({})
    }
  }, [selectOverrideResetKey])

  const now = useToday()
  const todayKey = now.getTime()

  // Dynamic context for cycle/lectio sections
  const translation = usePreferencesStore((s) => s.translation)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const numbering = getPsalmNumbering(translation)
  const cycleDataQuery = useQuery({
    queryKey: ['practice-data', practiceId],
    queryFn: async () => (await loadPracticeData(practiceId)) ?? null,
    staleTime: Infinity,
  })
  const trackDefsQuery = useQuery({
    queryKey: ['practice-tracks', practiceId],
    queryFn: async () => (await loadPracticeTracks(practiceId)) ?? null,
    staleTime: Infinity,
  })
  const cycleData = cycleDataQuery.data ?? undefined
  const trackDefs = trackDefsQuery.data ?? undefined
  const cursorRows = useCursorsForPractice(trackDefs ? practiceId : undefined)

  useEffect(() => {
    if (trackDefs) {
      ensurePracticeCursors(practiceId, Object.keys(trackDefs))
    }
  }, [practiceId, trackDefs])

  // Transform cursors to trackState format expected by engine
  const trackState = useMemo(() => {
    if (!cursorRows) return undefined
    const state: Record<string, { current_index: number }> = {}
    for (const cursor of cursorRows) {
      // cursor.id is like "practiceId/trackName"
      const trackName = cursor.id.split('/').pop()
      if (trackName) {
        const position = JSON.parse(cursor.position)
        state[trackName] = { current_index: position.index ?? 0 }
      }
    }
    return state
  }, [cursorRows])

  const handleSelectOverride = useCallback((overrideKey: string, nextId: string) => {
    setSelectOverrides((current) =>
      current[overrideKey] === nextId ? current : { ...current, [overrideKey]: nextId },
    )
  }, [])

  // `withSpiritualThreads` snapshots store state at call time, so each
  // resolveSections() pass sees one consistent view of resolutions /
  // movements / clock. We don't depend on the store inside this effect
  // — captures during the running flow surface inline via their own
  // hooks, but the resolved sections themselves stay fixed.
  useEffect(() => {
    let cancelled = false

    const resolveSections = async () => {
      if (!flow) {
        if (!cancelled) {
          setSections([])
          setIsResolvingFlow(false)
        }
        return
      }

      setIsResolvingFlow(true)
      try {
        const context: FlowContext = {
          date: new Date(todayKey),
          numbering,
          liturgicalCalendar,
          trackDefs,
          trackState,
          cycleData,
          programDay,
          selectOverrides,
        }
        const ec = withSpiritualThreads(
          createEngineContext(undefined, { contentLanguage, secondaryLanguage }),
        )
        const resolved = await resolveFlowAsync(flow, context, ec)
        if (!cancelled) {
          setSections(resolved)
        }
      } finally {
        if (!cancelled) {
          setIsResolvingFlow(false)
        }
      }
    }

    resolveSections()
    return () => {
      cancelled = true
    }
  }, [
    flow,
    todayKey,
    numbering,
    liturgicalCalendar,
    trackDefs,
    trackState,
    cycleData,
    programDay,
    contentLanguage,
    secondaryLanguage,
    selectOverrides,
  ])

  // Load dynamic content. Readings (Bible/CCC), psalmody, and explicit
  // `include` blocks all flow through one producer pipeline → one fetch
  // surface, one ResourceMap.
  const producerCalls = useMemo(
    () => collectProducerCalls(sections, translation),
    [sections, translation],
  )

  const dynamic = useResourceQueries(
    producerCalls,
    (c) => c.id,
    (c) => {
      const producer = getProducer(c.ref)
      const ctx = { date: now, lang: contentLanguage, programDay, params: c.params }
      return {
        queryKey: [
          'producer',
          c.ref,
          producer?.version ?? '?',
          contentLanguage,
          producer?.cacheKey(ctx) ?? '',
          c.id,
        ] as const,
        queryFn: async () => {
          if (!producer) throw new Error(`Unknown producer: ${c.ref}`)
          return runCachedProducer(producer, ctx)
        },
        staleTime: Number.POSITIVE_INFINITY,
      }
    },
  )

  const isInitialResolve = isResolvingFlow && sections.length === 0
  const isDynamicLoading =
    isInitialResolve || (producerCalls.length > 0 && dynamic.isLoading)

  const practiceName = manifest ? localizeContent(manifest.name) : practiceId
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')

  // Network-fetch phase: flow blobs are still being downloaded for the first time.
  // Show the threshold word with a small "Loading…" subtitle so the user knows
  // content is on the way (vs. a silent "Oremus" that looks like nothing's happening).
  if (manifest && flowQuery.isLoading) {
    return <Threshold word={t('practice.threshold')} subtitle={t('practice.loadingContent')} />
  }

  if (!manifest || !flow) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
            {t('practice.noContent')}
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </Pressable>
        </YStack>
      </ScreenLayout>
    )
  }

  // Resolution phase: flow loaded, engine is processing dynamic sections (Bible/CCC
  // readings, mass-of-day, liturgical-day). This is local + fast — no subtitle needed.
  if (isDynamicLoading || !thresholdElapsed) {
    return <Threshold word={t('practice.threshold')} />
  }

  function handleComplete() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const subId = parseSlotKey(currentSlot?.id ?? `${practiceId}::default`).slotId

    logCompletionMutation.mutate(
      { practiceId, date: today, subId },
      {
        onSuccess: async () => {
          successBuzz()
          try {
            if (trackDefs) {
              const trackIds = findTrackIds(sections)
              await Promise.all(
                trackIds.map((id) =>
                  advanceCursor.mutateAsync({
                    cursorId: `${practiceId}/${id}`,
                    entryCount: trackDefs[id].entries.length,
                  }),
                ),
              )
            }
            if (manifest?.program) {
              const isFinalDay =
                programProgress && programProgress.completionCount + 1 >= manifest.program.totalDays
              if (isFinalDay) {
                await handleProgramCompletion.mutateAsync({
                  practiceId,
                  completionBehavior: manifest.program.completionBehavior,
                })
                setShowCompleteModal(true)
                return
              }
            }
            router.back()
          } catch (err) {
            console.error('[practice] post-completion sync failed', err)
            confirm({
              title: t('practice.completionSyncFailed'),
              description: t('practice.completionSyncFailedDesc'),
              singleAction: true,
            })
          }
        },
      },
    )
  }

  return (
    <ImageViewerProvider>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <ManuscriptFrame>
            <YStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$md"
              paddingHorizontal={readingMargin}
            >
              {manifest.theme !== 'office' && (
                <Text fontFamily="$display" fontSize="$5" color="$accent">
                  ✠
                </Text>
              )}
              <Text fontFamily="$display" fontSize="$5" color="$colorBurgundy">
                {practiceName}
              </Text>
              <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" letterSpacing={1}>
                {formattedDate}
              </Text>
            </YStack>

            <YStack gap="$md">
              {sections.map((section, index) => (
                <PracticeSectionBlock
                  key={`${section.type}-${index}`}
                  section={section}
                  dynamic={dynamic}
                  practiceId={practiceId}
                  onSelectOverride={handleSelectOverride}
                />
              ))}
            </YStack>

            {manifest.completion !== 'manual' && (
              <YStack paddingHorizontal={readingMargin} paddingTop="$lg">
                <AnimatedPressable
                  onPress={handleComplete}
                  disabled={logCompletionMutation.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={t('office.amen')}
                >
                  <YStack
                    backgroundColor="$accent"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$accentSubtle"
                    paddingVertical="$md"
                    alignItems="center"
                    opacity={logCompletionMutation.isPending ? 0.6 : 1}
                  >
                    <Text fontFamily="$heading" fontSize="$3" color="$background">
                      {logCompletionMutation.isPending ? t('office.completing') : t('office.amen')}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              </YStack>
            )}

            <YStack paddingBottom="$lg" />
          </ManuscriptFrame>
        </YStack>

        {showCompleteModal && manifest?.program && (
          <ProgramCompleteModal
            practiceName={localizeContent(manifest.name)}
            showRestart={manifest.program.completionBehavior === 'offer-restart'}
            onRestart={() => {
              restartProgramMutation.mutate({ practiceId }, { onSuccess: () => router.back() })
            }}
            onDone={() => router.back()}
          />
        )}
      </ScreenLayout>
    </ImageViewerProvider>
  )
}

function PracticeSectionBlock({
  section,
  dynamic,
  practiceId,
  onSelectOverride,
}: {
  section: RenderedSection
  dynamic: DynamicResources
  practiceId: string
  onSelectOverride: (overrideKey: string, nextId: string) => void
}) {
  // Practice-specific section types
  switch (section.type) {
    case 'rendered-offering':
      return (
        <RenderedOfferingBlock
          practiceId={practiceId}
          mode={section.mode}
          show={section.show}
          default={section.default}
          label={section.label?.primary}
        />
      )

    case 'rendered-capture-movement':
      return (
        <RenderedCaptureMovementBlock
          kind={section.kind}
          prompt={section.prompt.primary}
          multi={section.multi}
          defaultCadence={section.defaultCadence}
        />
      )

    case 'rendered-capture-resolution':
      return (
        <RenderedCaptureResolutionBlock
          forward={section.forward}
          prompt={section.prompt.primary}
          window={section.window}
          prefill={section.prefill}
        />
      )

    case 'rendered-review-resolution':
      return (
        <RenderedReviewResolutionBlock
          mode={section.mode}
          resolution={section.resolution}
          prompt={section.prompt?.primary}
          outcomes={section.outcomes}
          allowNotes={section.allow_notes}
        />
      )

    case 'psalmody': {
      if (section.psalms.length === 0) return undefined
      const id = psalmodyId(section.psalms)
      const cached = dynamic.data.get(id)
      const retry = dynamic.retry.get(id)
      if (!cached && retry) return <InlineRetry onRetry={retry} />
      const result = cached?.payload as { data: PsalmodySlot[] } | undefined
      const slots: PsalmSlot[] = result?.data
        ? result.data.map(({ ref, verses }) => ({ ref, verses }))
        : section.psalms.map((ref) => ({ ref }))
      return <PsalmodyBlock slots={slots} />
    }

    case 'reading': {
      const ref = section.reference
      const id = readingId(ref)
      const cached = dynamic.data.get(id)
      const retry = dynamic.retry.get(id)
      if (!cached && retry) return <InlineRetry onRetry={retry} />
      if (ref.type === 'bible') {
        const result = cached?.payload as { data: ChapterResult } | undefined
        return (
          <BibleReadingBlock
            reference={ref}
            verses={result?.data.verses}
            fallback={result?.data.fallback}
          />
        )
      }
      const result = cached?.payload as { data: CccParagraph[] } | undefined
      return <CccReadingBlock reference={ref} paragraphs={result?.data} />
    }

    case 'include': {
      const id = includeKeyFor(section.ref, section.params)
      const cached = dynamic.data.get(id)
      return (
        <IncludeBlock
          ref={section.ref}
          data={cached?.payload}
          retry={dynamic.retry.get(id)}
          renderSection={(s, i) => (
            <PracticeSectionBlock
              key={`${s.type}-${i}`}
              section={s}
              dynamic={dynamic}
              practiceId={practiceId}
              onSelectOverride={onSelectOverride}
            />
          )}
        />
      )
    }

    case 'proper':
      return (
        <ProperSlot slot={section.slot} form={section.form} description={section.description} />
      )

    default:
      return (
        <SectionBlock
          section={section}
          renderSection={(s, i) => (
            <PracticeSectionBlock
              key={`${s.type}-${i}`}
              section={s}
              dynamic={dynamic}
              practiceId={practiceId}
              onSelectOverride={onSelectOverride}
            />
          )}
          onSelectOverride={onSelectOverride}
        />
      )
  }
}
