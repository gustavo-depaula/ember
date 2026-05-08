import { useRouter } from 'expo-router'
import { Check, Cloud } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { computePlanCoverage } from '@/features/pinning/coverage'
import { usePinnedItems } from '@/features/pinning/hooks'
import { useAllSlots } from '@/features/plan-of-life'

/**
 * Subtle one-line "X of Y available offline" indicator. Hidden until at least
 * one plan practice is covered — the status is informational, not a CTA, and
 * we don't want to nag users who have never pinned anything.
 */
export function OfflineCoverageLine() {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()

  const slots = useAllSlots()
  const { data: pinned } = usePinnedItems()

  const planPracticeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const slot of slots) {
      if (slot.enabled === 1) ids.add(slot.practice_id)
    }
    return ids
  }, [slots])

  const { covered, total } = useMemo(
    () => computePlanCoverage(planPracticeIds, pinned ?? []),
    [planPracticeIds, pinned],
  )

  if (total === 0 || covered === 0) return null

  const allCovered = covered === total
  const Icon = allCovered ? Check : Cloud
  const label = allCovered ? t('home.offlineReady') : t('home.offlineCoverage', { covered, total })

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      hitSlop={6}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <XStack alignItems="center" justifyContent="center" gap="$xs" paddingVertical="$xs">
        <Icon size={12} color={theme.colorSecondary?.val} />
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" opacity={0.75}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
