import { differenceInCalendarDays } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  GreenWall,
  PrayButton,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getManifest, loadPracticeTracks } from '@/content/registry'
import { useCursorsForPractice } from '@/features/divine-office'
import {
  enrichSlot,
  getLongestPracticeStreak,
  getPracticeIconKey,
  useAddSlot,
  useArchivePractice,
  useDeleteSlot,
  usePracticeCompletionStats,
  useProgramProgress,
  useSlotsForPractice,
  useUnarchivePractice,
  useUpdateSlot,
} from '@/features/plan-of-life'
import { SlotConfigurator } from '@/features/plan-of-life/components/SlotConfigurator'
import { PracticeTeachingContent, TrackPicker } from '@/features/practices/components'

export default function PracticeDetailScreen() {
  const { t } = useTranslation()
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const { data: slots = [] } = useSlotsForPractice(practiceId)
  const manifest = practiceId ? getManifest(practiceId) : undefined
  const isProgram = !!manifest?.program
  const hasFlow = !!manifest?.flow
  const updateSlot = useUpdateSlot()
  const addSlot = useAddSlot()
  const archivePractice = useArchivePractice()
  const unarchivePractice = useUnarchivePractice()
  const { data: programProgress } = useProgramProgress(practiceId ?? '', manifest?.program)
  const deleteSlot = useDeleteSlot()

  const firstSlot = slots[0]
  const isArchived = firstSlot?.archived === 1

  const { data: practiceStats } = usePracticeCompletionStats(practiceId ?? '')
  const trackDefs = useMemo(
    () => (practiceId ? loadPracticeTracks(practiceId) : undefined),
    [practiceId],
  )
  const { data: cursorRows = [] } = useCursorsForPractice(trackDefs ? practiceId : undefined)

  const wallData = useMemo(() => {
    if (!practiceStats?.completedDates) return []
    return practiceStats.completedDates.map((date) => ({ date, value: 4 }))
  }, [practiceStats?.completedDates])

  const stats = useMemo(() => {
    if (!practiceStats) return { streak: 0, longest: 0, total: 0, rate: 0 }

    const { completedDates, currentStreak, totalDays } = practiceStats
    const longest = getLongestPracticeStreak(completedDates)

    const rate = (() => {
      if (completedDates.length === 0) return 0
      const sorted = [...completedDates].sort()
      const firstDay = new Date(sorted[0])
      const daysSinceStart = differenceInCalendarDays(new Date(), firstDay) + 1
      return totalDays / daysSinceStart
    })()

    return { streak: currentStreak, longest, total: totalDays, rate }
  }, [practiceStats])

  if (!practiceId || !firstSlot) {
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

  const iconKey = getPracticeIconKey(firstSlot)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <PracticeIcon name={iconKey} size={24} />
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            {enrichSlot(firstSlot, t).name}
          </Text>
        </XStack>

        {isProgram && practiceId ? (
          <AnimatedPressable
            onPress={() =>
              router.push({
                pathname: '/practices/[manifestId]/program',
                params: { manifestId: practiceId },
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
                {programProgress
                  ? t('program.dayOf', {
                      day: programProgress.programDay + 1,
                      total: programProgress.totalDays,
                    })
                  : t('program.begin')}
              </Text>
            </YStack>
          </AnimatedPressable>
        ) : hasFlow && practiceId ? (
          <PrayButton practiceId={practiceId} />
        ) : null}

        <YStack alignItems="center">
          <GreenWall data={wallData} />
        </YStack>

        <SectionDivider />

        <XStack justifyContent="space-around" paddingVertical="$sm">
          {[
            { value: stats.streak, label: t('plan.currentStreak') },
            { value: stats.longest, label: t('plan.longestStreak') },
            { value: stats.total, label: t('plan.totalDays') },
            {
              value: `${Math.round(stats.rate * 100)}%`,
              label: t('plan.completionRate'),
            },
          ].map((item) => (
            <YStack key={item.label} alignItems="center" gap="$xs">
              <Text fontFamily="$heading" fontSize="$5" color="$accent">
                {item.value}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {item.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        <SectionDivider />

        <SlotConfigurator
          slots={slots}
          onUpdateSlot={(slotId, data) => updateSlot.mutate({ id: slotId, data })}
          onAddSlot={() =>
            addSlot.mutate({
              practiceId: practiceId,
              data: { tier: firstSlot.tier, slotId: 'default' },
            })
          }
          onDeleteSlot={(slotId) => deleteSlot.mutate(slotId)}
        />

        {trackDefs && cursorRows.length > 0 && (
          <>
            <SectionDivider />
            <YStack gap="$md">
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('plan.readingTracks')}
              </Text>
              {Object.entries(trackDefs).map(([trackName, def]) => {
                const cursor = cursorRows.find((r) => r.id === `${practiceId}/${trackName}`)
                if (!cursor) return null
                const position = JSON.parse(cursor.position)
                return (
                  <TrackPicker
                    key={trackName}
                    practiceId={practiceId}
                    trackDef={def}
                    trackState={{ track: trackName, current_index: position.index ?? 0 }}
                  />
                )
              })}
            </YStack>
          </>
        )}

        {manifest && (
          <>
            <SectionDivider />
            <PracticeTeachingContent manifest={manifest} />
          </>
        )}

        {isArchived ? (
          <>
            <SectionDivider />
            <AnimatedPressable onPress={() => unarchivePractice.mutate(practiceId)}>
              <YStack
                borderWidth={1}
                borderColor="$accent"
                borderRadius="$md"
                paddingVertical="$sm"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="$accent">
                  {t('plan.unarchive')}
                </Text>
              </YStack>
            </AnimatedPressable>
          </>
        ) : (
          <>
            <SectionDivider />
            <AnimatedPressable
              onPress={() =>
                Alert.alert(t('plan.archive'), t('plan.archiveConfirm'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('plan.archive'),
                    style: 'destructive',
                    onPress: () => {
                      archivePractice.mutate(practiceId)
                      router.back()
                    },
                  },
                ])
              }
            >
              <YStack
                borderWidth={1}
                borderColor="$colorSecondary"
                borderRadius="$md"
                paddingVertical="$sm"
                alignItems="center"
                opacity={0.7}
              >
                <Text fontFamily="$heading" fontSize="$3" color="$colorSecondary">
                  {t('plan.archive')}
                </Text>
              </YStack>
            </AnimatedPressable>
          </>
        )}
      </YStack>
    </ScreenLayout>
  )
}
