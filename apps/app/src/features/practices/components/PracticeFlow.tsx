// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import { type FlowContext, resolveFlow } from '@ember/content-engine'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, XStack, YStack } from 'tamagui'
import {
  AnimatedPressable,
  BibleReadingBlock,
  CccReadingBlock,
  HeaderFlourish,
  ManuscriptFrame,
  ProperSlot,
  type PsalmData,
  PsalmodyBlock,
  ScreenLayout,
} from '@/components'
import { SectionBlock } from '@/components/SectionBlock'
import { createEngineContext } from '@/content/engineContext'
import {
  getDefaultVariant,
  getLibraryIdForPractice,
  getManifest,
  loadFlowForSlot,
  loadPerDayFlow,
  loadPracticeData,
  loadPracticeTracks,
  loadVariant,
} from '@/content/registry'
import type { RenderedSection } from '@/content/types'
import {
  ensurePracticeCursors,
  useAdvanceCursor,
  useCursorsForPractice,
  usePsalmsForHour,
} from '@/features/divine-office'
import {
  useHandleProgramCompletion,
  useLogCompletion,
  useProgramProgress,
  useRestartProgram,
  useSlots,
} from '@/features/plan-of-life'
import { ProgramCompleteModal } from '@/features/practices/components/ProgramCompleteModal'
import { ViewModeSelector } from '@/features/practices/components/ViewModeSelector'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { getPsalmNumbering } from '@/lib/bolls'
import { getCccParagraphs } from '@/lib/catechism'
import { getChapter, type Verse } from '@/lib/content'
import { successBuzz } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { PsalmRef } from '@/lib/liturgical'
import { parseSlotKey } from '@/lib/slotKey'
import { usePreferencesStore } from '@/stores/preferencesStore'

function findPsalmRefs(sections: RenderedSection[]): PsalmRef[] {
  for (const s of sections) {
    if (s.type === 'psalmody') return s.psalms
  }
  return []
}

type BibleKey = { book: string; chapter: number }
type CccKey = { start: number; count: number }

const bibleKeyStr = (k: BibleKey) => `${k.book}/${k.chapter}`
const cccKeyStr = (k: CccKey) => `${k.start}/${k.count}`

function collectReadingKeys(sections: RenderedSection[]): {
  bibleKeys: BibleKey[]
  cccKeys: CccKey[]
} {
  const bibleSet = new Map<string, BibleKey>()
  const cccSet = new Map<string, CccKey>()
  for (const s of sections) {
    if (s.type !== 'reading') continue
    if (s.reference.type === 'bible') {
      const key = { book: s.reference.book, chapter: s.reference.chapter }
      const k = bibleKeyStr(key)
      if (!bibleSet.has(k)) bibleSet.set(k, key)
    } else {
      const key = { start: s.reference.startParagraph, count: s.reference.count }
      const k = cccKeyStr(key)
      if (!cccSet.has(k)) cccSet.set(k, key)
    }
  }
  return { bibleKeys: Array.from(bibleSet.values()), cccKeys: Array.from(cccSet.values()) }
}

function findTrackIds(sections: RenderedSection[]): string[] {
  const ids = new Set<string>()
  for (const s of sections) {
    if (s.type === 'reading' && s.trackId) ids.add(s.trackId)
  }
  return Array.from(ids)
}

export function PracticeFlow({
  practiceId,
  flowId: flowIdProp,
  programDay: programDayProp,
}: {
  practiceId: string
  flowId?: string
  programDay?: number
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const readingMargin = useReadingMargin()
  const queryClient = useQueryClient()
  const logCompletionMutation = useLogCompletion()
  const advanceCursor = useAdvanceCursor()
  const handleProgramCompletion = useHandleProgramCompletion()
  const restartProgramMutation = useRestartProgram()
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  const manifest = getManifest(practiceId)
  const { data: programProgress } = useProgramProgress(practiceId, manifest?.program)
  const programDay = programDayProp ?? programProgress?.programDay

  const { data: slots = [] } = useSlots()
  const currentSlot = slots.find((s) => s.practice_id === practiceId)
  const flowId = flowIdProp ?? currentSlot?.slot_id ?? 'default'

  const [activeFlowId, setActiveFlowId] = useState(flowId)
  useEffect(() => setActiveFlowId(flowId), [flowId])

  const viewModes = useMemo(() => {
    if (!manifest) return []
    const siblings = manifest.flows.filter((f) => f.group === flowId)
    if (siblings.length === 0) return []
    return [
      { id: flowId, label: localizeContent({ 'en-US': 'Full', 'pt-BR': 'Completo' }) },
      ...siblings.map((f) => ({ id: f.id, label: localizeContent(f.name) })),
    ]
  }, [manifest, flowId])

  const flow = useMemo(() => {
    if (!manifest) return undefined
    if (manifest.program?.perDayFlows && programDay !== undefined) {
      const dayFlow = loadPerDayFlow(practiceId, programDay)
      if (dayFlow) return dayFlow
    }
    return loadFlowForSlot(practiceId, activeFlowId)
  }, [manifest, practiceId, activeFlowId, programDay])

  const selectedVariantId = currentSlot?.variant

  const variant = useMemo(() => {
    if (!manifest?.variants?.length) return undefined
    if (selectedVariantId) return loadVariant(practiceId, selectedVariantId)
    return getDefaultVariant(practiceId)
  }, [practiceId, manifest, selectedVariantId])

  const now = useMemo(() => new Date(), [])

  // Dynamic context for cycle/lectio sections
  const translation = usePreferencesStore((s) => s.translation)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const numbering = getPsalmNumbering(translation)
  const cycleData = useMemo(() => loadPracticeData(practiceId), [practiceId])
  const trackDefs = useMemo(() => loadPracticeTracks(practiceId), [practiceId])
  const { data: cursorRows } = useCursorsForPractice(trackDefs ? practiceId : undefined)

  useEffect(() => {
    if (trackDefs) {
      ensurePracticeCursors(practiceId, Object.keys(trackDefs)).then(() =>
        queryClient.invalidateQueries({ queryKey: ['cursors', practiceId] }),
      )
    }
  }, [practiceId, trackDefs, queryClient])

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: contentLanguage and secondaryLanguage are read inside createEngineContext() — listed here to trigger recomputation
  const sections = useMemo(() => {
    if (!flow) return []
    const context: FlowContext = {
      date: now,
      variant,
      numbering,
      liturgicalCalendar,
      trackDefs,
      trackState,
      cycleData,
      setKeyOverride: activeFlowId,
      programDay,
    }
    return resolveFlow(flow, context, createEngineContext(getLibraryIdForPractice(practiceId)))
  }, [
    flow,
    now,
    variant,
    numbering,
    liturgicalCalendar,
    trackDefs,
    trackState,
    cycleData,
    activeFlowId,
    programDay,
    contentLanguage,
    secondaryLanguage,
  ])

  // Load dynamic content (psalms, Bible readings, CCC)
  const psalmRefs = useMemo(() => findPsalmRefs(sections), [sections])
  const { bibleKeys, cccKeys } = useMemo(() => collectReadingKeys(sections), [sections])

  const psalmResult = usePsalmsForHour(psalmRefs, translation)

  const bibleQueries = useQueries({
    queries: bibleKeys.map((k) => ({
      queryKey: ['chapter', translation, k.book, k.chapter] as const,
      queryFn: () => getChapter(translation, k.book, k.chapter),
    })),
  })

  const cccQueries = useQueries({
    queries: cccKeys.map((k) => ({
      queryKey: ['ccc', k.start, k.count] as const,
      queryFn: () => getCccParagraphs(k.start, k.count),
    })),
  })

  const bibleMap = useMemo(() => {
    const map = new Map<string, { verses: Verse[]; fallback?: boolean }>()
    for (let i = 0; i < bibleKeys.length; i++) {
      const data = bibleQueries[i]?.data
      if (data) map.set(bibleKeyStr(bibleKeys[i]), data)
    }
    return map
  }, [bibleKeys, bibleQueries])

  const cccMap = useMemo(() => {
    const map = new Map<string, Array<{ number: number; text: string; section: string }>>()
    for (let i = 0; i < cccKeys.length; i++) {
      const data = cccQueries[i]?.data
      if (data) map.set(cccKeyStr(cccKeys[i]), data)
    }
    return map
  }, [cccKeys, cccQueries])

  const bibleLoading = bibleQueries.some((r) => r.isLoading)
  const cccLoading = cccQueries.some((r) => r.isLoading)

  const hasDynamicContent = psalmRefs.length > 0 || bibleKeys.length > 0 || cccKeys.length > 0
  const isDynamicLoading =
    hasDynamicContent && (psalmResult.isLoading || bibleLoading || cccLoading)

  const practiceName = manifest ? localizeContent(manifest.name) : practiceId
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')

  if (!manifest || !flow) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
            {t('practice.noContent')}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </Pressable>
        </YStack>
      </ScreenLayout>
    )
  }

  if (isDynamicLoading) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$accent" />
        </YStack>
      </ScreenLayout>
    )
  }

  function handleComplete() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const subId = parseSlotKey(currentSlot?.id ?? `${practiceId}::${flowId}`).slotId

    logCompletionMutation.mutate(
      { practiceId, date: today, subId },
      {
        onSuccess: async () => {
          successBuzz()
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
              programProgress && programProgress.programDay + 1 >= manifest.program.totalDays
            if (isFinalDay) {
              await handleProgramCompletion.mutateAsync({
                practiceId,
                completionBehavior: manifest.program.completionBehavior,
              })
              setShowCompleteModal(true)
              return
            }
            queryClient.invalidateQueries({ queryKey: ['programProgress', practiceId] })
          }
          router.back()
        },
      },
    )
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable onPress={() => router.back()}>
          <XStack alignItems="center" gap="$sm">
            <ChevronLeft size={20} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </XStack>
        </Pressable>

        <ManuscriptFrame>
          <YStack
            alignItems="center"
            gap="$xs"
            paddingVertical="$md"
            paddingHorizontal={readingMargin}
          >
            {manifest.theme === 'office' ? (
              <HeaderFlourish />
            ) : (
              <Text fontFamily="$display" fontSize="$5" color="$accent">
                ✠
              </Text>
            )}
            <Text fontFamily="$display" fontSize="$5" color="$colorBurgundy">
              {practiceName}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
              {formattedDate}
            </Text>
          </YStack>

          {viewModes.length > 0 && (
            <YStack paddingHorizontal={readingMargin} paddingBottom="$md">
              <ViewModeSelector
                modes={viewModes}
                activeId={activeFlowId}
                onSelect={setActiveFlowId}
              />
            </YStack>
          )}

          <YStack gap="$md">
            {(() => {
              return sections.map((section, index) => (
                <PracticeSectionBlock
                  key={`${section.type}-${index}`}
                  section={section}
                  psalmData={psalmResult.data}
                  bibleMap={bibleMap}
                  cccMap={cccMap}
                  officeTheme={manifest.theme === 'office'}
                />
              ))
            })()}
          </YStack>

          <YStack paddingBottom="$lg" />
        </ManuscriptFrame>

        {manifest.completion !== 'manual' && (
          <YStack paddingHorizontal={readingMargin}>
            <AnimatedPressable onPress={handleComplete} disabled={logCompletionMutation.isPending}>
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
                  {logCompletionMutation.isPending
                    ? t('office.completing')
                    : t('office.markComplete')}
                </Text>
              </YStack>
            </AnimatedPressable>
          </YStack>
        )}
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
  )
}

function PracticeSectionBlock({
  section,
  psalmData,
  bibleMap,
  cccMap,
  officeTheme = false,
}: {
  section: RenderedSection
  psalmData: PsalmData[]
  bibleMap: Map<string, { verses: Verse[]; fallback?: boolean }>
  cccMap: Map<string, Array<{ number: number; text: string; section: string }>>
  officeTheme?: boolean
}) {
  // Practice-specific section types
  switch (section.type) {
    case 'psalmody':
      return <PsalmodyBlock psalmData={psalmData} />

    case 'reading': {
      const ref = section.reference
      const bibleData = ref.type === 'bible' ? bibleMap.get(bibleKeyStr(ref)) : undefined
      const block =
        ref.type === 'bible' ? (
          <BibleReadingBlock
            reference={ref}
            verses={bibleData?.verses}
            fallback={bibleData?.fallback}
          />
        ) : (
          <CccReadingBlock
            reference={ref}
            paragraphs={cccMap.get(cccKeyStr({ start: ref.startParagraph, count: ref.count }))}
          />
        )
      return block
    }

    case 'proper':
      return (
        <ProperSlot slot={section.slot} form={section.form} description={section.description} />
      )

    default:
      // Delegate common section types (rubric, prayer, hymn, canticle, heading, etc.)
      return (
        <SectionBlock
          section={section}
          officeTheme={officeTheme}
          renderSection={(s, i) => (
            <PracticeSectionBlock
              key={`${s.type}-${i}`}
              section={s}
              psalmData={psalmData}
              bibleMap={bibleMap}
              cccMap={cccMap}
              officeTheme={officeTheme}
            />
          )}
        />
      )
  }
}
