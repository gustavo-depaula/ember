import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, SectionDivider } from '@/components'
import { Typography } from '@/components/typography'
import { getCollectionsForItem, getEntry } from '@/content/contentIndex'
import {
  findGroupMemberInSet,
  getAlternativeGroup,
  getManifest,
  getManifestIconKey,
} from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useEventStore } from '@/db/events'
import { createProgramCursor, getPractice } from '@/db/repositories'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { AddToCollectionSheet, LibraryActionRow } from '@/features/library'
import { isPinned } from '@/features/pinning/pinningManager'
import {
  useCreatePractice,
  useEnableSlotsForPractice,
  useProgramProgress,
  useRestartProgram,
  useSlotsForPractice,
  useUnarchivePractice,
  useUpdateSlot,
} from '@/features/plan-of-life'
import {
  PracticeEditSheet,
  type PracticeFormData,
} from '@/features/plan-of-life/components/PracticeEditSheet'
import { selectEnrollmentSchedule } from '@/features/plan-of-life/program'
import { PracticeHero, PracticeTeachingContent } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'
import { useNowPlayingClearance } from '@/stores/creatorsStore'

const nativeTabBarClearance = 56

export default function CatalogDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const nowPlaying = useNowPlayingClearance()
  const background = theme.background?.val ?? '#000000'

  // Drive the hero's stretch-on-pull-down off the scroll offset.
  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const slotsForManifest = useSlotsForPractice(manifestId)
  const firstSlot = slotsForManifest[0]
  const isDirectlyInPlan = slotsForManifest.some((s) => s.enabled === 1)

  // Check if any member of the same alternative group is already in the plan
  const practices = useEventStore((s) => s.practices)
  const groupMemberInPlan = useMemo(() => {
    if (!manifestId || isDirectlyInPlan) return undefined
    const activeIds = new Set<string>()
    for (const [id, p] of practices) {
      if (!p.archived) activeIds.add(id)
    }
    return findGroupMemberInSet(manifestId, activeIds)
  }, [manifestId, isDirectlyInPlan, practices])
  const isInPlan = isDirectlyInPlan || !!groupMemberInPlan
  const planPracticeId = groupMemberInPlan ?? manifestId

  const createPractice = useCreatePractice()
  const updateSlot = useUpdateSlot()
  const enableSlots = useEnableSlotsForPractice()
  const unarchivePractice = useUnarchivePractice()
  const restartProgramMutation = useRestartProgram()
  const [showEditor, setShowEditor] = useState(false)
  const [addingToCollection, setAddingToCollection] = useState(false)
  const programProgress = useProgramProgress(manifest?.id ?? '', manifest?.program)
  const group = useMemo(
    () => (manifestId ? getAlternativeGroup(manifestId) : undefined),
    [manifestId],
  )
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal — re-running the memo when it bumps is the entire point.
  const collectionLabels = useMemo(() => {
    if (!manifestId) return []
    return getCollectionsForItem(`practice/${manifestId}`)
      .map((cid) => {
        const entry = getEntry(cid)
        return entry?.name ? localizeContent(entry.name as Record<string, string>) : undefined
      })
      .filter((s): s is string => !!s)
  }, [manifestId, catalogVersion])
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const collectionPinned = useMemo(() => {
    if (!manifestId) return false
    return getCollectionsForItem(`practice/${manifestId}`).some(isPinned)
  }, [manifestId, catalogVersion])

  if (!manifestId || !manifest) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Typography variant="interface" tone="muted">
          {t('plan.practiceNotFound')}
        </Typography>
      </YStack>
    )
  }

  const iconKey = getManifestIconKey(manifest.id)
  const isProgram = !!manifest.program

  const metaParts: string[] = []
  if (isProgram) {
    if (manifest.program?.totalDays) {
      metaParts.push(t('program.durationDays', { count: manifest.program.totalDays }))
    }
  } else if ((manifest.estimatedMinutes ?? 0) > 0) {
    metaParts.push(t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes }))
  }
  for (const cat of manifest.categories ?? []) {
    metaParts.push(t(`category.${cat}`, { defaultValue: cat }))
  }
  const metadata = metaParts.join(' · ') || undefined

  function handleAddToPlan() {
    const practice = manifestId ? getPractice(manifestId) : undefined
    if (practice?.archived) {
      unarchivePractice.mutate(manifestId)
    } else if (firstSlot && !firstSlot.enabled) {
      enableSlots.mutate(manifestId)
    } else {
      setShowEditor(true)
    }
  }

  function handleBeginProgram() {
    if (!manifest?.program) return
    const { program, id: practiceId } = manifest

    if (firstSlot) {
      enableSlots.mutate(practiceId, {
        onSuccess: async () => {
          await createProgramCursor(practiceId)
          router.push({
            pathname: '/practices/[manifestId]/program',
            params: { manifestId: practiceId },
          })
        },
      })
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const slotDefaults = manifest.defaults?.slots?.[0]
    const defaultSchedule = slotDefaults?.schedule ?? { type: 'daily' as const }
    const schedule = selectEnrollmentSchedule(
      program.progressPolicy,
      defaultSchedule,
      program.totalDays,
      today,
    )
    const tier = (slotDefaults?.tier as 'essential' | 'ideal' | 'extra') ?? 'extra'
    createPractice.mutate(
      {
        id: practiceId,
        slot: {
          tier,
          schedule: JSON.stringify(schedule),
        },
      },
      {
        onSuccess: async () => {
          await createProgramCursor(practiceId)
          router.push({
            pathname: '/practices/[manifestId]/program',
            params: { manifestId: practiceId },
          })
        },
      },
    )
  }

  function handleSave(data: PracticeFormData) {
    if (firstSlot) {
      updateSlot.mutate({
        id: firstSlot.id,
        data: {
          tier: data.tier,
          schedule: JSON.stringify(data.schedule),
          enabled: 1,
        },
      })
    } else if (manifest) {
      createPractice.mutate({
        id: manifest.id,
        activeVariant: manifest.id,
        slot: {
          tier: data.tier,
          schedule: JSON.stringify(data.schedule),
        },
      })
    }
    setShowEditor(false)
  }

  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying,
        }}
        contentInsetAdjustmentBehavior="never"
      >
        <PracticeHero
          iconKey={iconKey}
          name={localizeContent(manifest.name)}
          metadata={metadata}
          tone={toneByIndex(toneIndexForId(manifest.id))}
          scrollY={scrollY}
          onPray={
            isProgram
              ? undefined
              : () =>
                  router.push({
                    pathname: '/pray/[practiceId]',
                    params: { practiceId: manifest.id },
                  })
          }
        />

        {/* Opaque column over the hero's lower bleed; paddingTop clears the
            floating Rezar capsule that straddles the seam. */}
        <YStack
          width="100%"
          maxWidth={640}
          alignSelf="center"
          paddingHorizontal="$lg"
          paddingTop={40}
          gap="$lg"
          backgroundColor="$background"
        >
          {/* manifest.id is the canonical kind-prefixed id (`practice/...`). The
              route param can arrive bare or prefixed depending on the entry
              point, so never re-prefix it — use the manifest's own id. */}
          <LibraryActionRow
            itemId={manifest.id}
            kind="practice"
            onAddToCollection={() => setAddingToCollection(true)}
          />

          {collectionLabels.length > 0 && (
            <Typography variant="caption" fontSize="$1" textAlign="center">
              {collectionLabels.join(' · ')}
              {collectionPinned ? ' · ↓ offline' : ''}
            </Typography>
          )}

          {group && (
            <XStack gap="$md" flexWrap="wrap" justifyContent="center">
              {group.members.map((member) => {
                const isActive = member.manifest.id === manifest.id
                return (
                  <Pressable
                    key={member.manifest.id}
                    onPress={() =>
                      router.push({
                        pathname: '/practices/[manifestId]',
                        params: { manifestId: member.manifest.id },
                      })
                    }
                    disabled={isActive}
                    hitSlop={8}
                    accessibilityRole="radio"
                    accessibilityLabel={member.label}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Typography
                      variant="label"
                      fontSize="$2"
                      color={isActive ? '$accent' : '$colorSecondary'}
                    >
                      {member.label}
                    </Typography>
                  </Pressable>
                )
              })}
            </XStack>
          )}

          {isProgram ? (
            isInPlan ? (
              programProgress?.isComplete ? (
                <YStack gap="$sm">
                  <PrimaryCapsule
                    label={
                      programProgress.completionBehavior === 'offer-restart'
                        ? t('program.restart')
                        : t('program.complete')
                    }
                    onPress={() =>
                      programProgress.completionBehavior === 'offer-restart'
                        ? restartProgramMutation.mutate({ practiceId: manifest.id })
                        : router.push({
                            pathname: '/practices/[manifestId]/program',
                            params: { manifestId: manifest.id },
                          })
                    }
                    accessibilityRole={
                      programProgress.completionBehavior === 'offer-restart' ? 'button' : 'link'
                    }
                  />
                  {programProgress.completionBehavior === 'offer-restart' && (
                    <TextLink
                      label={t('program.complete')}
                      onPress={() =>
                        router.push({
                          pathname: '/practices/[manifestId]/program',
                          params: { manifestId: manifest.id },
                        })
                      }
                      accessibilityRole="link"
                    />
                  )}
                </YStack>
              ) : (
                <PrimaryCapsule
                  label={
                    programProgress
                      ? t('program.dayOf', {
                          day: programProgress.programDay + 1,
                          total: programProgress.totalDays,
                        })
                      : t('catalog.alreadyInPlan')
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/practices/[manifestId]/program',
                      params: { manifestId: manifest.id },
                    })
                  }
                  accessibilityRole="link"
                />
              )
            ) : (
              <PrimaryCapsule
                label={t('program.begin')}
                onPress={handleBeginProgram}
                accessibilityRole="button"
              />
            )
          ) : isInPlan ? (
            <TextLink
              label={t('catalog.alreadyInPlan')}
              onPress={() =>
                router.push({
                  pathname: '/plan/[practiceId]',
                  params: { practiceId: planPracticeId },
                })
              }
              accessibilityRole="link"
              chevron
            />
          ) : (
            <TextLink
              label={t('catalog.addToPlan')}
              onPress={handleAddToPlan}
              accessibilityRole="button"
              testID="add-to-plan-button"
            />
          )}

          <SectionDivider />

          <PracticeTeachingContent manifest={manifest} defaultExpanded />
        </YStack>
      </Animated.ScrollView>

      <AddToCollectionSheet
        itemRef={manifest.id}
        open={addingToCollection}
        onClose={() => setAddingToCollection(false)}
      />

      <Modal
        visible={showEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditor(false)}
      >
        <YStack flex={1} justifyContent="flex-end">
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onPress={() => setShowEditor(false)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeModal')}
          />
          <PracticeEditSheet
            manifest={manifest}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </>
  )
}

/** The plan's live primary action — a filled gold capsule, centered. */
function PrimaryCapsule({
  label,
  onPress,
  accessibilityRole,
}: {
  label: string
  onPress: () => void
  accessibilityRole: 'button' | 'link'
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
    >
      <XStack
        alignSelf="center"
        backgroundColor="$accent"
        borderRadius={9999}
        paddingVertical="$sm"
        paddingHorizontal="$xl"
        justifyContent="center"
      >
        <Typography variant="label" fontSize="$3" color="$background">
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}

/** A quiet, borderless plan affordance — gold type, optional trailing chevron. */
function TextLink({
  label,
  onPress,
  accessibilityRole,
  chevron,
  testID,
}: {
  label: string
  onPress: () => void
  accessibilityRole: 'button' | 'link'
  chevron?: boolean
  testID?: string
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      testID={testID}
    >
      <XStack alignSelf="center" alignItems="center" gap="$xs" paddingVertical="$sm">
        <Typography variant="label" fontSize="$3" color="$accent">
          {label}
        </Typography>
        {chevron && <ChevronRight size={16} color={theme.accent.val} />}
      </XStack>
    </AnimatedPressable>
  )
}
