import { differenceInCalendarDays } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { GreenWall, HourButtons, PrayButton, ScreenLayout, SectionDivider } from '@/components'
import { getManifest, loadPracticeTracks } from '@/content/practices'
import { useCursorsForPractice } from '@/features/divine-office'
import {
  getLongestPracticeStreak,
  getPracticeIcon,
  getPracticeIconKey,
  getPracticeName,
  usePracticeCompletionStats,
  usePractices,
  useUpdatePractice,
} from '@/features/plan-of-life'
import {
  PracticeTeachingContent,
  TrackPicker,
  VariantSelector,
} from '@/features/practices/components'

export default function PracticeDetailScreen() {
  const { t } = useTranslation()
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const { data: practices = [] } = usePractices()
  const practice = practices.find((p) => p.practice_id === practiceId)
  const manifest = practiceId ? getManifest(practiceId) : undefined
  const hasFlow = manifest?.flow !== undefined || (manifest?.forms?.length ?? 0) > 0
  const hasHours = manifest?.hours !== undefined && manifest.hours.length > 0
  const updatePractice = useUpdatePractice()

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

  if (!practice) {
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

  const iconKey = getPracticeIconKey(practice)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <Text fontSize={24}>{getPracticeIcon(iconKey)}</Text>
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            {getPracticeName(practice, t)}
          </Text>
        </XStack>

        {hasFlow && practiceId && <PrayButton practiceId={practiceId} />}
        {hasHours && practiceId && manifest?.hours && (
          <HourButtons practiceId={practiceId} hours={manifest.hours} />
        )}

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

        {manifest?.variants && manifest.variants.length > 0 && (
          <>
            <SectionDivider />
            <VariantSelector
              manifest={manifest}
              selectedVariantId={practice.variant ?? undefined}
              onSelectVariant={(variantId) =>
                updatePractice.mutate({
                  id: practice.practice_id,
                  data: { variant: variantId },
                })
              }
            />
          </>
        )}

        {trackDefs && cursorRows.length > 0 && (
          <>
            <SectionDivider />
            <YStack gap="$md">
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('plan.readingTracks', { defaultValue: 'Reading Tracks' })}
              </Text>
              {Object.entries(trackDefs).map(([trackName, def]) => {
                const cursor = cursorRows.find((r) => r.id === `${practiceId}/${trackName}`)
                if (!cursor) return null
                const position = JSON.parse(cursor.position)
                return (
                  <TrackPicker
                    key={trackName}
                    practiceId={practiceId!}
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
      </YStack>
    </ScreenLayout>
  )
}
