// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, View, XStack, YStack } from 'tamagui'
import {
  AnimatedPressable,
  BibleReadingBlock,
  CanticleBlock,
  CccReadingBlock,
  CollapsiblePrayer,
  HeaderFlourish,
  HymnBlock,
  LiturgicalPrayerBlock,
  ManuscriptFrame,
  OptionsBlock,
  OrnamentalRule,
  PageBreakOrnament,
  PrayerTextBlock,
  ProperSlot,
  type PsalmData,
  PsalmodyBlock,
  ResponseBlock,
  RubricLabel,
  ScreenLayout,
} from '@/components'
import { type FlowContext, resolveFlow } from '@/content/engine'
import {
  getDefaultVariant,
  getManifest,
  loadFlow,
  loadFormFlow,
  loadHourFlow,
  loadPracticeData,
  loadPracticeTracks,
  loadVariant,
} from '@/content/practices'
import type { RenderedSection } from '@/content/types'
import {
  ensurePracticeCursors,
  useAdvanceCursor,
  useBibleReading,
  useCccReading,
  useCursorsForPractice,
  usePsalmsForHour,
} from '@/features/divine-office'
import { useLogCompletion, useSlots } from '@/features/plan-of-life'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { getPsalmNumbering } from '@/lib/bolls'
import type { Verse } from '@/lib/content'
import { successBuzz } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { PsalmRef, ReadingReference } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

function findPsalmRefs(sections: RenderedSection[]): PsalmRef[] {
  for (const s of sections) {
    if (s.type === 'psalmody') return s.psalms
  }
  return []
}

function findReadingRef(sections: RenderedSection[]): { reference: ReadingReference } | undefined {
  for (const s of sections) {
    if (s.type === 'reading') return { reference: s.reference }
  }
  return undefined
}

function findTrackIds(sections: RenderedSection[]): string[] {
  const ids = new Set<string>()
  for (const s of sections) {
    if (s.type === 'reading' && s.trackId) ids.add(s.trackId)
  }
  return Array.from(ids)
}

export function PracticeFlow({ practiceId, hourId }: { practiceId: string; hourId?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const readingMargin = useReadingMargin()
  const queryClient = useQueryClient()
  const logCompletionMutation = useLogCompletion()
  const advanceCursor = useAdvanceCursor()

  const manifest = getManifest(practiceId)
  const formPreferences = usePreferencesStore((s) => s.formPreferences)
  const setFormPreference = usePreferencesStore((s) => s.setFormPreference)
  const selectedFormId = manifest?.forms?.length
    ? (formPreferences[practiceId] ?? manifest.forms[0].id)
    : undefined

  const flow = useMemo(() => {
    if (!manifest) return undefined
    if (hourId && manifest.hours) return loadHourFlow(practiceId, hourId)
    if (selectedFormId && manifest.forms) return loadFormFlow(practiceId, selectedFormId)
    return loadFlow(practiceId)
  }, [manifest, practiceId, hourId, selectedFormId])

  const { data: slots = [] } = useSlots()
  const selectedVariantId = slots.find((s) => s.practice_id === practiceId)?.variant

  const variant = useMemo(() => {
    if (!manifest?.variants?.length) return undefined
    if (selectedVariantId) return loadVariant(practiceId, selectedVariantId)
    return getDefaultVariant(practiceId)
  }, [practiceId, manifest, selectedVariantId])

  const now = useMemo(() => new Date(), [])
  const [selectedSetKey, setSelectedSetKey] = useState<string | undefined>(undefined)

  // Dynamic context for cycle/lectio sections
  const translation = usePreferencesStore((s) => s.translation)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
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
      setKeyOverride: selectedSetKey,
    }
    return resolveFlow(flow, context)
  }, [
    flow,
    now,
    variant,
    numbering,
    liturgicalCalendar,
    trackDefs,
    trackState,
    cycleData,
    selectedSetKey,
  ])

  // Load dynamic content (psalms, Bible readings, CCC)
  const psalmRefs = useMemo(() => findPsalmRefs(sections), [sections])
  const readingInfo = useMemo(() => findReadingRef(sections), [sections])
  const readingRef = readingInfo?.reference
  const bibleRef = readingRef?.type === 'bible' ? readingRef : undefined
  const cccRef = readingRef?.type === 'catechism' ? readingRef : undefined

  const psalmResult = usePsalmsForHour(psalmRefs, translation)
  const bibleResult = useBibleReading(bibleRef?.book, bibleRef?.chapter, translation)
  const cccResult = useCccReading(cccRef?.startParagraph, cccRef?.count)

  const hasDynamicContent = psalmRefs.length > 0 || readingRef !== undefined
  const isDynamicLoading =
    hasDynamicContent && (psalmResult.isLoading || bibleResult.isLoading || cccResult.isLoading)

  const practiceName = t(`practice.${practiceId}`, { defaultValue: manifest?.name.en ?? practiceId })
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
    const subId = hourId ?? undefined

    logCompletionMutation.mutate(
      { practiceId, date: today, subId },
      {
        onSuccess: async () => {
          successBuzz()
          if (manifest?.completionEffects?.advanceReadings && trackDefs) {
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
            <Text fontFamily="$display" fontSize={36} lineHeight={42} color="$colorBurgundy">
              {practiceName}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
              {formattedDate}
            </Text>
          </YStack>

          {manifest?.forms && selectedFormId && (
            <PillToggle
              options={manifest.forms.map((f) => ({
                id: f.id,
                label: localizeContent(f.name),
              }))}
              selected={selectedFormId}
              onChange={(formId) => setFormPreference(practiceId, formId)}
            />
          )}

          <YStack gap="$md">
            {(() => {
              const firstReadingIdx =
                manifest.theme === 'office' ? sections.findIndex((s) => s.type === 'reading') : -1
              return sections.map((section, index) => {
                if (section.type === 'set-selector') {
                  return (
                    <PillToggle
                      key={`set-selector-${index}`}
                      options={section.options.map((o) => ({ id: o.key, label: o.label }))}
                      selected={section.selectedKey}
                      onChange={setSelectedSetKey}
                    />
                  )
                }
                return (
                  <PracticeSectionBlock
                    key={`${section.type}-${index}`}
                    section={section}
                    psalmData={psalmResult.data}
                    readingData={bibleResult.data?.verses}
                    readingFallback={bibleResult.data?.fallback}
                    cccData={cccResult.data}
                    officeTheme={manifest.theme === 'office'}
                    isFirstReading={index === firstReadingIdx}
                  />
                )
              })
            })()}
          </YStack>

          <YStack paddingBottom="$lg" />
        </ManuscriptFrame>

        {manifest?.completion !== 'manual' && (
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
    </ScreenLayout>
  )
}

function PracticeSectionBlock({
  section,
  psalmData,
  readingData,
  readingFallback,
  cccData,
  officeTheme = false,
  isFirstReading = false,
}: {
  section: RenderedSection
  psalmData: PsalmData[]
  readingData?: Verse[]
  readingFallback?: boolean
  cccData?: Array<{ number: number; text: string; section: string }>
  officeTheme?: boolean
  isFirstReading?: boolean
}) {
  switch (section.type) {
    case 'rubric':
      return <RubricLabel>{section.label}</RubricLabel>

    case 'prayer':
      if (section.speaker) {
        return (
          <LiturgicalPrayerBlock
            speaker={section.speaker}
            text={section.text}
            latin={section.latin ?? ''}
          />
        )
      }
      if (section.title) {
        return <CollapsiblePrayer title={section.title} text={section.text} count={section.count} />
      }
      return <PrayerTextBlock text={section.text} />

    case 'hymn':
      return <HymnBlock title={section.title} english={section.english} latin={section.latin} />

    case 'canticle':
      return (
        <CanticleBlock
          title={section.title}
          subtitle={section.subtitle}
          source={section.source}
          text={section.text}
        />
      )

    case 'response':
      return <ResponseBlock verses={section.verses} />

    case 'heading':
      return (
        <Text fontFamily="$heading" fontSize="$4" color="$colorBurgundy" letterSpacing={0.5}>
          {section.text}
        </Text>
      )

    case 'meditation':
      return (
        <Text fontFamily="$body" fontSize="$3" fontStyle="italic" color="$color" lineHeight={30}>
          {section.text}
        </Text>
      )

    case 'divider':
      if (officeTheme) return <OrnamentalRule />
      return (
        <YStack alignItems="center" paddingVertical="$sm">
          <View width="40%" height={0.5} backgroundColor="$accentSubtle" />
        </YStack>
      )

    case 'psalmody':
      return <PsalmodyBlock psalmData={psalmData} />

    case 'reading': {
      const illuminated = officeTheme && isFirstReading
      const block =
        section.reference.type === 'bible' ? (
          <BibleReadingBlock
            reference={section.reference}
            verses={readingData}
            fallback={readingFallback}
            illuminated={illuminated}
          />
        ) : (
          <CccReadingBlock reference={section.reference} paragraphs={cccData} />
        )
      if (illuminated) {
        return (
          <>
            <PageBreakOrnament />
            {block}
          </>
        )
      }
      return block
    }

    case 'subheading':
      return (
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$colorBurgundy"
          letterSpacing={0.5}
          paddingTop="$sm"
        >
          {section.text}
        </Text>
      )

    case 'proper':
      return <ProperSlot description={section.description} />

    case 'options':
      return (
        <OptionsBlock
          label={section.label}
          options={section.options}
          renderSection={(s, i) => (
            <PracticeSectionBlock
              key={`${s.type}-${i}`}
              section={s}
              psalmData={psalmData}
              readingData={readingData}
              readingFallback={readingFallback}
              cccData={cccData}
              officeTheme={officeTheme}
            />
          )}
        />
      )

    case 'image':
      return null

    default:
      return null
  }
}

function PillToggle({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[]
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <XStack
      gap="$xs"
      justifyContent="center"
      paddingVertical="$md"
      paddingHorizontal="$md"
      flexWrap="wrap"
    >
      {options.map((option) => (
        <AnimatedPressable key={option.id} onPress={() => onChange(option.id)}>
          <YStack
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$md"
            borderWidth={1}
            borderColor={option.id === selected ? '$accent' : '$borderColor'}
            backgroundColor={option.id === selected ? '$accent' : 'transparent'}
          >
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color={option.id === selected ? '$background' : '$colorSecondary'}
            >
              {option.label}
            </Text>
          </YStack>
        </AnimatedPressable>
      ))}
    </XStack>
  )
}
