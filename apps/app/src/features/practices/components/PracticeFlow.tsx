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
  confirm,
  IncludeBlock,
  ManuscriptFrame,
  ProperSlot,
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
import { successBuzz } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { parseSlotKey } from '@/lib/slotKey'
import { PracticeProducerProvider } from '@/producers'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { PsalmodySlot } from './slots/PsalmodySlot'
import { ReadingSlot } from './slots/ReadingSlot'

// Descends through container sections so findTrackIds can reach reading
// sections nested inside select/options/collapsible/etc.
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

  const isDynamicLoading = isResolvingFlow && sections.length === 0

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
      <PracticeProducerProvider programDay={programDay}>
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
      </PracticeProducerProvider>
    </ImageViewerProvider>
  )
}

function PracticeSectionBlock({
  section,
  practiceId,
  onSelectOverride,
}: {
  section: RenderedSection
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

    case 'psalmody':
      return <PsalmodySlot psalms={section.psalms} />

    case 'reading':
      return <ReadingSlot reference={section.reference} />

    case 'include':
      return (
        <IncludeBlock
          ref={section.ref}
          params={section.params}
          renderSection={(s, i) => (
            <PracticeSectionBlock
              key={`${s.type}-${i}`}
              section={s}
              practiceId={practiceId}
              onSelectOverride={onSelectOverride}
            />
          )}
        />
      )

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
              practiceId={practiceId}
              onSelectOverride={onSelectOverride}
            />
          )}
          onSelectOverride={onSelectOverride}
        />
      )
  }
}
