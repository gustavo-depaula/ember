import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { AlertTriangle, BookOpen, ChevronRight, Library } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  GreenWall,
  PageHeader,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { calmSpring } from '@/config/animation'
import { tierConfig } from '@/config/constants'
import { getManifest, parseQualifiedId } from '@/content/registry'
import type { SlotState } from '@/db/events'
import { useEventStore } from '@/db/events'
import type { Tier, UserPractice } from '@/db/schema'
import {
  buildTieredWallData,
  type DayCompletion,
  getCompletionRate,
  getCurrentStreak,
  getPracticeIconKey,
  useArchivedPractices,
  useCompletionRange,
  useRestartNeededPractices,
  useSlots,
} from '@/features/plan-of-life'
import { TierBadge } from '@/features/plan-of-life/components/TierBadge'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

type PracticeGroup = {
  practiceId: string
  name: string
  icon: string
  tier: Tier
  slotCount: number
  enabled: boolean
}

function getPracticeDisplayName(
  practiceId: string,
  practice: UserPractice | undefined,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const manifest = getManifest(practiceId)
  if (manifest) {
    const { practiceId: unqualified } = parseQualifiedId(practiceId)
    const key = `practice.${unqualified}`
    const translated = t(key)
    if (translated !== key) return translated
    return localizeContent(manifest.name)
  }
  return practice?.custom_name ?? practiceId
}

export default function PlanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const slots = useSlots()
  const practices = useEventStore((s) => s.practices)
  const restartNeededIds = useRestartNeededPractices()
  const rangeStart = useMemo(() => format(subWeeks(new Date(), 20), 'yyyy-MM-dd'), [])
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const rangeLogs = useCompletionRange(rangeStart, today)

  const { wallData, stats } = useMemo(() => {
    const wd = buildTieredWallData(rangeLogs, slots)

    const countsByDate = new Map<string, number>()
    for (const log of rangeLogs) {
      countsByDate.set(log.date, (countsByDate.get(log.date) ?? 0) + 1)
    }
    const totalSlots = slots.length || 1
    const dailyCompletions: DayCompletion[] = Array.from(countsByDate, ([date, completed]) => ({
      date,
      completed,
      total: totalSlots,
    }))

    return {
      wallData: wd,
      stats: {
        streak: getCurrentStreak(dailyCompletions),
        rate: getCompletionRate(dailyCompletions),
      },
    }
  }, [rangeLogs, slots])

  // Group slots into practices
  const practiceGroups = useMemo(() => {
    const byPractice = new Map<string, SlotState[]>()
    for (const s of slots) {
      const existing = byPractice.get(s.practice_id) ?? []
      existing.push(s)
      byPractice.set(s.practice_id, existing)
    }

    const groups: PracticeGroup[] = []
    for (const [practiceId, practiceSlots] of byPractice) {
      const first = practiceSlots[0]
      groups.push({
        practiceId,
        name: getPracticeDisplayName(practiceId, practices.get(practiceId), t),
        icon: getPracticeIconKey(first),
        tier: first.tier,
        slotCount: practiceSlots.length,
        enabled: practiceSlots.some((s) => s.enabled === 1),
      })
    }

    return groups
  }, [slots, practices, t])

  const grouped = useMemo(() => {
    const groups: Record<Tier, PracticeGroup[]> = { essential: [], ideal: [], extra: [] }
    for (const p of practiceGroups) {
      if (p.tier in groups) groups[p.tier].push(p)
    }
    return groups
  }, [practiceGroups])

  const tierSections: Tier[] = ['essential', 'ideal', 'extra']

  const archivedPractices = useArchivedPractices()
  const [archivedExpanded, setArchivedExpanded] = useState(false)
  const chevronRotation = useSharedValue(0)
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  const handleToggleArchived = useCallback(() => {
    lightTap()
    const next = !archivedExpanded
    chevronRotation.value = withSpring(next ? 90 : 0, calmSpring)
    setArchivedExpanded(next)
  }, [archivedExpanded, chevronRotation])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('plan.title')} />

        <YStack alignItems="center">
          <GreenWall data={wallData} tiered />
        </YStack>

        {stats.streak === 0 && stats.rate === 0 && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            {t('plan.emptyWall')}
          </Text>
        )}

        <XStack gap="$md">
          <YStack
            flex={1}
            alignItems="center"
            gap="$xs"
            borderWidth={0.5}
            borderColor="$accentSubtle"
            borderRadius="$md"
            padding="$md"
          >
            <Text fontFamily="$heading" fontSize="$5" color="$accent">
              {stats.streak}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t('plan.dayStreak')}
            </Text>
          </YStack>
          <YStack
            flex={1}
            alignItems="center"
            gap="$xs"
            borderWidth={0.5}
            borderColor="$accentSubtle"
            borderRadius="$md"
            padding="$md"
          >
            <Text fontFamily="$heading" fontSize="$5" color="$accent">
              {Math.round(stats.rate * 100)}%
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t('plan.completion')}
            </Text>
          </YStack>
        </XStack>

        <XStack gap="$md" justifyContent="center">
          <View style={{ flex: 1 }}>
            <AnimatedPressable
              onPress={() => router.push('/library')}
              accessibilityRole="link"
              accessibilityLabel={t('library.title')}
            >
              <YStack
                alignItems="center"
                justifyContent="center"
                gap="$sm"
                padding="$md"
                borderWidth={0.5}
                borderColor="$borderColor"
                borderRadius="$lg"
                backgroundColor="$backgroundSurface"
              >
                <Library size={22} color={theme.accent.val} />
                <Text fontFamily="$heading" fontSize="$1" color="$color" textAlign="center">
                  {t('library.title')}
                </Text>
              </YStack>
            </AnimatedPressable>
          </View>
          <View style={{ flex: 1 }}>
            <AnimatedPressable
              onPress={() => router.push('/practices')}
              accessibilityRole="link"
              accessibilityLabel={t('catalog.title')}
            >
              <YStack
                alignItems="center"
                justifyContent="center"
                gap="$sm"
                padding="$md"
                borderWidth={0.5}
                borderColor="$borderColor"
                borderRadius="$lg"
                backgroundColor="$backgroundSurface"
              >
                <BookOpen size={22} color={theme.accent.val} />
                <Text fontFamily="$heading" fontSize="$1" color="$color" textAlign="center">
                  {t('catalog.title')}
                </Text>
              </YStack>
            </AnimatedPressable>
          </View>
        </XStack>

        <SectionDivider />

        {practiceGroups.length === 0 && (
          <AnimatedPressable
            onPress={() => router.push('/practices')}
            accessibilityRole="button"
            accessibilityLabel={t('plan.emptyStateAction')}
          >
            <YStack
              alignItems="center"
              gap="$sm"
              paddingVertical="$xl"
              paddingHorizontal="$lg"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              borderStyle="dashed"
              backgroundColor="$backgroundSurface"
            >
              <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
                {t('plan.emptyState')}
              </Text>
              <Text
                fontFamily="$body"
                fontSize="$2"
                color="$colorSecondary"
                textAlign="center"
                fontStyle="italic"
              >
                {t('plan.emptyStateDescription')}
              </Text>
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('plan.emptyStateAction')}
              </Text>
            </YStack>
          </AnimatedPressable>
        )}

        {tierSections.map((tier) => {
          const practices = grouped[tier]
          if (practices.length === 0) return null

          return (
            <YStack key={tier} gap="$sm">
              <XStack alignItems="center" gap="$sm" paddingHorizontal="$xs">
                <TierBadge tier={tier} />
                <Text fontFamily="$heading" fontSize="$3" color="$color">
                  {t(`tier.${tier}`)}
                </Text>
              </XStack>

              {practices.map((group) => (
                <AnimatedPressable
                  key={group.practiceId}
                  onPress={() => router.push(`/plan/${group.practiceId}`)}
                  accessibilityRole="link"
                  accessibilityLabel={group.name}
                >
                  <XStack
                    backgroundColor="$backgroundSurface"
                    borderRadius="$lg"
                    padding="$md"
                    alignItems="center"
                    gap="$md"
                    borderLeftWidth={3}
                    borderLeftColor={tierConfig[group.tier].color}
                  >
                    <PracticeIcon name={group.icon} size={20} />
                    <YStack flex={1} gap={2}>
                      <Text fontFamily="$body" fontSize="$3" color="$color">
                        {group.name}
                      </Text>
                      {restartNeededIds.has(group.practiceId) ? (
                        <XStack alignItems="center" gap={4}>
                          <AlertTriangle size={12} color={theme.accent.val} />
                          <Text fontFamily="$body" fontSize="$1" color="$accent">
                            {t('program.restartNeeded')}
                          </Text>
                        </XStack>
                      ) : (
                        group.slotCount > 1 && (
                          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                            {group.slotCount} slots
                          </Text>
                        )
                      )}
                    </YStack>
                    {group.tier === 'essential' && (
                      <Text fontFamily="$body" fontSize={28} color="#EF4444">
                        !!
                      </Text>
                    )}
                    {group.tier === 'ideal' && (
                      <Text fontFamily="$body" fontSize={28} color="$colorMutedBlue">
                        !
                      </Text>
                    )}
                    <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                      ›
                    </Text>
                  </XStack>
                </AnimatedPressable>
              ))}
            </YStack>
          )
        })}

        {archivedPractices.length > 0 && (
          <>
            <SectionDivider />
            <Animated.View layout={LinearTransition.duration(250)}>
              <YStack gap="$sm">
                <AnimatedPressable
                  onPress={handleToggleArchived}
                  accessibilityRole="button"
                  accessibilityLabel={t('plan.archivedCount', { count: archivedPractices.length })}
                  accessibilityState={{ expanded: archivedExpanded }}
                >
                  <XStack alignItems="center" gap="$sm" paddingHorizontal="$xs">
                    <Animated.View style={chevronStyle}>
                      <ChevronRight size={16} color={theme.colorSecondary.val} />
                    </Animated.View>
                    <Text fontFamily="$heading" fontSize="$3" color="$colorSecondary">
                      {t('plan.archivedCount', { count: archivedPractices.length })}
                    </Text>
                  </XStack>
                </AnimatedPressable>

                {archivedExpanded &&
                  archivedPractices.map((p, index) => {
                    const name = getPracticeDisplayName(p.practice_id, p, t)
                    const iconKey = p.custom_icon ?? 'prayer'

                    return (
                      <Animated.View
                        key={p.practice_id}
                        entering={FadeIn.duration(200).delay(index * 50)}
                        exiting={FadeOut.duration(150)}
                      >
                        <AnimatedPressable
                          onPress={() => router.push(`/plan/${p.practice_id}`)}
                          accessibilityRole="link"
                          accessibilityLabel={name}
                        >
                          <XStack
                            backgroundColor="$backgroundSurface"
                            borderRadius="$lg"
                            padding="$md"
                            alignItems="center"
                            gap="$md"
                            opacity={0.5}
                          >
                            <PracticeIcon name={iconKey} size={20} />
                            <Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
                              {name}
                            </Text>
                            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                              ›
                            </Text>
                          </XStack>
                        </AnimatedPressable>
                      </Animated.View>
                    )
                  })}
              </YStack>
            </Animated.View>
          </>
        )}
      </YStack>
    </ScreenLayout>
  )
}
