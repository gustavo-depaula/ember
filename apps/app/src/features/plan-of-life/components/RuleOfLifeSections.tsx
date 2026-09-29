import { useRouter } from 'expo-router'
import { ChevronRight, CloudDownload } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'

import { useSlots } from '../hooks'
import { isProgramSlot } from '../ruleString'
import { InProgress } from './InProgress'
import { PlanOfflineSheet } from './PlanOfflineSheet'
import { openPlanSheet, PlanSheet } from './PlanSheet'
import { RuleString } from './RuleString'

/**
 * The rule of life on the You page: its shape as a string of beads (the whole
 * rule opens in a sheet), and the programs under way beneath it. Today's
 * progress lives on Today; this is the rule itself.
 */
export function RuleOfLifeSections() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const slots = useSlots()
  const [offlineOpen, setOfflineOpen] = useState(false)

  const { rule, programs, practiceIds } = useMemo(
    () => ({
      rule: slots.filter((s) => !isProgramSlot(s)),
      programs: slots.filter(isProgramSlot),
      // Distinct corpus/custom practice ids in the plan — drives the offline-pin button.
      practiceIds: [...new Set(slots.map((s) => s.practice_id))],
    }),
    [slots],
  )
  const practiceCount = new Set(rule.map((s) => s.practice_id)).size

  return (
    <YStack gap="$xl">
      <YStack gap="$sm">
        <XStack alignItems="center" justifyContent="space-between">
          <AnimatedPressable
            onPress={() => {
              lightTap()
              openPlanSheet()
            }}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.openPlan')}
          >
            <XStack gap="$xs" alignItems="center" minHeight={44}>
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t('plan.title')}
              </Typography>
              {/* Cinzel keeps descender room below its caps; lift the chevron to their middle. */}
              <ChevronRight
                size={24}
                strokeWidth={1.75}
                color={theme.accent?.val}
                style={{ marginTop: -2 }}
              />
            </XStack>
          </AnimatedPressable>
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
              <CloudDownload size={22} color={theme.accent.val} />
            </AnimatedPressable>
          ) : undefined}
        </XStack>

        {rule.length === 0 ? (
          <AnimatedPressable
            onPress={() => router.push('/templates' as never)}
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
          <>
            <RuleString slots={rule} onPress={openPlanSheet} />
            <Typography tone="muted" fontSize="$2" textAlign="center">
              {t('plan.practiceCount', { count: practiceCount })} ·{' '}
              {t('plan.timeCount', { count: rule.length })}
            </Typography>
          </>
        )}
      </YStack>

      <InProgress slots={programs} />

      <PlanSheet slots={rule} />
      <PlanOfflineSheet
        practiceIds={practiceIds}
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
      />
    </YStack>
  )
}
