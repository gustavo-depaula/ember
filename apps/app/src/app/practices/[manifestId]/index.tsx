import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayButton, ScreenLayout, SectionDivider } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import {
  findGroupMemberInSet,
  getAlternativeGroup,
  getManifest,
  getManifestIconKey,
} from '@/content/registry'
import { useEventStore } from '@/db/events'
import { createProgramCursor, getPractice } from '@/db/repositories'
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
import { PracticeTeachingContent } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'

export default function CatalogDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const slotsForManifest = useSlotsForPractice(manifestId)
  const firstSlot = slotsForManifest[0]
  const isDirectlyInPlan = slotsForManifest.some((s) => s.enabled === 1)

  // Check if any member of the same alternative group is already in the plan
  const practiceIds = useEventStore((s) => s.practices)
  const groupMemberInPlan = useMemo(() => {
    if (!manifestId || isDirectlyInPlan) return undefined
    return findGroupMemberInSet(manifestId, practiceIds)
  }, [manifestId, isDirectlyInPlan, practiceIds])
  const isInPlan = isDirectlyInPlan || !!groupMemberInPlan
  const planPracticeId = groupMemberInPlan ?? manifestId

  const createPractice = useCreatePractice()
  const updateSlot = useUpdateSlot()
  const enableSlots = useEnableSlotsForPractice()
  const unarchivePractice = useUnarchivePractice()
  const restartProgramMutation = useRestartProgram()
  const [showEditor, setShowEditor] = useState(false)
  const programProgress = useProgramProgress(manifest?.id ?? '', manifest?.program)
  const group = useMemo(
    () => (manifestId ? getAlternativeGroup(manifestId) : undefined),
    [manifestId],
  )

  if (!manifestId || !manifest) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
            {t('plan.practiceNotFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const iconKey = getManifestIconKey(manifest.id)
  const isProgram = !!manifest.program

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
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <PracticeIcon name={iconKey} size={28} />
          <YStack flex={1} gap={2}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {localizeContent(manifest.name)}
            </Text>
            <XStack gap="$sm">
              {isProgram ? (
                <Text fontFamily="$body" fontSize="$1" color="$accent">
                  {t('program.durationDays', { count: manifest.program?.totalDays })}
                </Text>
              ) : (
                manifest.estimatedMinutes > 0 && (
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes })}
                  </Text>
                )
              )}
              {manifest.categories.map((cat) => (
                <Text key={cat} fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t(`category.${cat}`, { defaultValue: cat })}
                </Text>
              ))}
            </XStack>
          </YStack>
        </XStack>

        {!isProgram && <PrayButton practiceId={manifest.id} />}

        {group && (
          <YStack gap="$sm">
            <XStack gap="$xs" flexWrap="wrap">
              {group.members.map((member) => {
                const isActive = member.manifest.id === manifest.id
                return (
                  <AnimatedPressable
                    key={member.manifest.id}
                    onPress={() =>
                      router.push({
                        pathname: '/practices/[manifestId]',
                        params: { manifestId: member.manifest.id },
                      })
                    }
                    disabled={isActive}
                  >
                    <XStack
                      paddingHorizontal="$sm"
                      paddingVertical="$xs"
                      borderRadius="$sm"
                      borderWidth={1}
                      borderColor={isActive ? '$accent' : '$borderColor'}
                      backgroundColor={isActive ? '$accent' : 'transparent'}
                    >
                      <Text
                        fontFamily="$heading"
                        fontSize="$1"
                        color={isActive ? '$background' : '$colorSecondary'}
                      >
                        {member.label}
                      </Text>
                    </XStack>
                  </AnimatedPressable>
                )
              })}
            </XStack>
          </YStack>
        )}

        {isProgram ? (
          isInPlan ? (
            programProgress?.isComplete ? (
              <YStack gap="$sm">
                <AnimatedPressable
                  onPress={() =>
                    router.push({
                      pathname: '/practices/[manifestId]/program',
                      params: { manifestId: manifest.id },
                    })
                  }
                >
                  <YStack
                    backgroundColor="$backgroundSurface"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$accent"
                    paddingVertical="$sm"
                    alignItems="center"
                  >
                    <Text fontFamily="$heading" fontSize="$3" color="$accent">
                      {t('program.complete')}
                    </Text>
                  </YStack>
                </AnimatedPressable>

                {programProgress.completionBehavior === 'offer-restart' && (
                  <AnimatedPressable
                    onPress={() =>
                      restartProgramMutation.mutate({
                        practiceId: manifest.id,
                      })
                    }
                  >
                    <YStack
                      backgroundColor="$accent"
                      borderRadius="$md"
                      paddingVertical="$sm"
                      alignItems="center"
                    >
                      <Text fontFamily="$heading" fontSize="$3" color="white">
                        {t('program.restart')}
                      </Text>
                    </YStack>
                  </AnimatedPressable>
                )}
              </YStack>
            ) : (
              <AnimatedPressable
                onPress={() =>
                  router.push({
                    pathname: '/practices/[manifestId]/program',
                    params: { manifestId: manifest.id },
                  })
                }
              >
                <YStack
                  backgroundColor="$accent"
                  borderRadius="$md"
                  paddingVertical="$sm"
                  alignItems="center"
                  gap={4}
                >
                  <Text fontFamily="$heading" fontSize="$3" color="white">
                    {programProgress
                      ? t('program.dayOf', {
                          day: programProgress.programDay + 1,
                          total: programProgress.totalDays,
                        })
                      : t('catalog.alreadyInPlan')}
                  </Text>
                </YStack>
              </AnimatedPressable>
            )
          ) : (
            <AnimatedPressable onPress={handleBeginProgram}>
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                paddingVertical="$sm"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {t('program.begin')}
                </Text>
              </YStack>
            </AnimatedPressable>
          )
        ) : isInPlan ? (
          <Pressable onPress={() => router.push(`/plan/${planPracticeId}`)}>
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
              paddingVertical="$sm"
              justifyContent="center"
              alignItems="center"
              gap="$sm"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$accent">
                {t('catalog.alreadyInPlan')}
              </Text>
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                ›
              </Text>
            </XStack>
          </Pressable>
        ) : (
          <AnimatedPressable onPress={handleAddToPlan}>
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
              paddingVertical="$sm"
              alignItems="center"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$accent">
                {t('catalog.addToPlan')}
              </Text>
            </YStack>
          </AnimatedPressable>
        )}

        <SectionDivider />

        <PracticeTeachingContent manifest={manifest} defaultExpanded />
      </YStack>

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
          />
          <PracticeEditSheet
            manifest={manifest}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
