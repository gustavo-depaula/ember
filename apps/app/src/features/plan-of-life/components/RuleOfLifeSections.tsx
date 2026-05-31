import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronRight, CloudDownload, Plus, Sparkles } from 'lucide-react-native'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  ManuscriptFrame,
  SectionDivider,
  Typography,
  VotiveWall,
} from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { calmSpring } from '@/config/animation'
import { getManifest } from '@/content/resolver'
import type { UserPractice } from '@/db/schema'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { useArchivedPractices, useCompletionRange, useSlots } from '../hooks'
import {
  buildTieredWallData,
  type DayCompletion,
  getCompletionRate,
  getCurrentStreak,
} from '../utils'
import { PlanOfflineSheet } from './PlanOfflineSheet'
import { RuleTree } from './RuleTree'

function getPracticeDisplayName(practiceId: string, practice: UserPractice | undefined): string {
  const manifest = getManifest(practiceId)
  if (manifest) return localizeContent(manifest.name)
  return practice?.custom_name ?? practiceId
}

// A doorway card — a quiet illuminated surface with the gold mark to the left of
// a tracked-caps title and a muted subtitle, not a bordered box. Used for the
// interior-life pair (Altar / Custody) and the rule pair (Traditions / Add).
export function PlanCard({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: ReactNode
  label: string
  subtitle?: string
  onPress: () => void
}) {
  return (
    <YStack flex={1}>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onPress()
        }}
        style={{ flex: 1 }}
        accessibilityRole="link"
        accessibilityLabel={label}
      >
        <XStack
          flex={1}
          alignItems="center"
          gap="$md"
          paddingVertical="$lg"
          paddingHorizontal="$md"
          minHeight={100}
          borderRadius="$lg"
          backgroundColor="$backgroundSurface"
        >
          {icon}
          <YStack flex={1} gap="$xs">
            <Typography variant="label" numberOfLines={2}>
              {label}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" tone="muted" numberOfLines={2}>
                {subtitle}
              </Typography>
            ) : undefined}
          </YStack>
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}

/**
 * The rule-of-life management body — resolutions, the long-arc (20-week) tiered
 * fidelity wall, streak/completion stats, add-practice entries, the tiered
 * practice list, and the archived collapsible. Extracted from the old `/plan`
 * screen so both `/plan` and the You tab can render it; each caller supplies its
 * own `ScreenLayout`/`PageHeader` and outer `YStack gap="$lg"`. (Pre-Typography
 * code kept verbatim.)
 */
export function RuleOfLifeSections({ belowWall }: { belowWall?: ReactNode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const slots = useSlots()
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

  // Distinct corpus/custom practice ids in the plan — drives the offline-pin button.
  const practiceIds = useMemo(() => [...new Set(slots.map((s) => s.practice_id))], [slots])

  const archivedPractices = useArchivedPractices()
  const [archivedExpanded, setArchivedExpanded] = useState(false)
  const [offlineOpen, setOfflineOpen] = useState(false)
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
    <>
      <ManuscriptFrame light>
        <YStack gap="$md" alignItems="center">
          <Typography variant="marker">{t('plan.fidelityLabel')}</Typography>
          <VotiveWall data={wallData} tiered />
          {stats.streak === 0 && stats.rate === 0 ? (
            <Typography tone="muted" fontSize="$2" textAlign="center">
              {t('plan.emptyWall')}
            </Typography>
          ) : (
            <Typography tone="muted" fontSize="$2" textAlign="center">
              <Typography color="$accent">
                {t('plan.dayStreakCount', { count: stats.streak })}
              </Typography>
              {' · '}
              <Typography color="$accent">{Math.round(stats.rate * 100)}%</Typography>{' '}
              {t('plan.thisMonth')}
            </Typography>
          )}
        </YStack>
      </ManuscriptFrame>

      {belowWall}

      <PlanOfflineSheet
        practiceIds={practiceIds}
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
      />

      <SectionDivider />

      <YStack gap="$md">
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$xs">
          <Typography variant="screen-title">{t('plan.title')}</Typography>
          {practiceIds.length > 0 ? (
            <AnimatedPressable
              onPress={() => {
                lightTap()
                setOfflineOpen(true)
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('plan.offlineTitle')}
            >
              <CloudDownload size={26} color={theme.accent.val} />
            </AnimatedPressable>
          ) : undefined}
        </XStack>
        <XStack gap="$md">
          <PlanCard
            icon={<Sparkles size={28} color={theme.accent.val} />}
            label={t('templates.title')}
            subtitle={t('templates.subtitle')}
            onPress={() => router.push('/templates' as never)}
          />
          <PlanCard
            icon={<Plus size={28} color={theme.accent.val} />}
            label={t('plan.addCustom')}
            subtitle={t('plan.addCustomHint')}
            onPress={() => router.push('/practices')}
          />
        </XStack>
      </YStack>

      {slots.length === 0 ? (
        <AnimatedPressable
          onPress={() => router.push('/practices')}
          accessibilityRole="button"
          accessibilityLabel={t('plan.emptyStateAction')}
        >
          <YStack alignItems="center" gap="$sm" paddingVertical="$xl" paddingHorizontal="$lg">
            <Typography variant="sacred-title" fontSize="$3">
              {t('plan.emptyState')}
            </Typography>
            <Typography tone="muted" fontSize="$2" textAlign="center" fontStyle="italic">
              {t('plan.emptyStateDescription')}
            </Typography>
            <Typography variant="label" color="$accent">
              {t('plan.emptyStateAction')}
            </Typography>
          </YStack>
        </AnimatedPressable>
      ) : (
        <RuleTree slots={slots} />
      )}

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
                  const name = getPracticeDisplayName(p.practice_id, p)
                  const iconKey = p.custom_icon ?? 'prayer'

                  return (
                    <Animated.View
                      key={p.practice_id}
                      entering={FadeIn.duration(200).delay(index * 50)}
                      exiting={FadeOut.duration(150)}
                    >
                      <AnimatedPressable
                        onPress={() =>
                          router.push({
                            pathname: '/plan/[practiceId]',
                            params: { practiceId: p.practice_id },
                          })
                        }
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
    </>
  )
}
