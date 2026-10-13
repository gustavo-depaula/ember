import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import {
  type BlockState,
  type DayPart,
  dayPartStates,
  enrichSlot,
  getActiveDayParts,
  getBlockCompletion,
  useRestartNeededPractices,
  useSetSlotDone,
} from '@/features/plan-of-life'
import { useCurrentHour } from '@/hooks/useCurrentHour'
import type { TodayPlan } from '../useTodayPlan'
import { TierLegend, TimeBlockSection } from './TimeBlockSection'

/** The day's plan of life as a checklist, one section per part of the day, the current one open. */
export function TodayChecklist({
  plan: { selectedDate, isFutureDate, slots, todaySlots, completedIds, onPressItem },
  onLeave,
}: {
  plan: TodayPlan
  /** Called before the list navigates away — the sheet closes, or the next screen opens beneath it. */
  onLeave: () => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const hour = useCurrentHour()
  const setSlotDone = useSetSlotDone()
  const restartNeededIds = useRestartNeededPractices()

  const [overrides, setOverrides] = useState<Partial<Record<DayPart, BlockState>>>({})

  // Overrides also hold a block open once its last practice is ticked, so the
  // list never folds up under the user's finger. The sheet mounts the list
  // afresh on each opening, and they clear when the day changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when the day changes
  useEffect(() => setOverrides({}), [selectedDate])

  const parts = useMemo(() => getActiveDayParts(todaySlots), [todaySlots])
  const states = dayPartStates(parts, hour, completedIds)
  const shownBlocks = parts.map(({ part, slots }) => ({
    block: part,
    def: { slots },
    state: overrides[part] ?? states.get(part) ?? 'preview',
  }))

  if (todaySlots.length === 0)
    return (
      <Pressable
        onPress={() => {
          onLeave()
          router.navigate('/(tabs)/(you)/you')
        }}
        accessibilityRole="link"
        accessibilityLabel={t('home.emptyPlanAction')}
      >
        <YStack alignItems="center" paddingHorizontal="$lg" gap="$sm" marginTop="$md">
          <Typography tone="muted" fontSize="$2" textAlign="center">
            {t(slots.length > 0 ? 'home.planNothingToday' : 'home.emptyPlan')}
          </Typography>
          <Typography fontSize="$2" fontWeight="500" color="$accent">
            {t('home.emptyPlanAction')}
          </Typography>
        </YStack>
      </Pressable>
    )

  return (
    <YStack gap="$md">
      {shownBlocks.map(({ block, def, state }) => {
        const { completed, total } = getBlockCompletion(
          def.slots.map((s) => s.id),
          completedIds,
        )
        return (
          <TimeBlockSection
            key={block}
            label={t(`dayPart.${block}`)}
            items={def.slots.map((s) => enrichSlot(s, t))}
            completedIds={completedIds}
            restartNeededIds={restartNeededIds}
            state={state}
            completed={completed}
            total={total}
            readOnly={isFutureDate}
            onToggle={(item, done) => {
              if (!overrides[block]) setOverrides((prev) => ({ ...prev, [block]: state }))
              setSlotDone.mutate({ slotKey: item.id, date: selectedDate, done })
            }}
            onToggleCollapse={() =>
              setOverrides((prev) => ({
                ...prev,
                [block]: state === 'expanded' ? 'collapsed' : 'expanded',
              }))
            }
            onPressItem={(item) => {
              onLeave()
              onPressItem(item)
            }}
          />
        )
      })}
      <TierLegend
        tiers={shownBlocks
          .filter(({ state }) => state === 'expanded')
          .flatMap(({ def }) => def.slots)
          .filter((s) => !completedIds.has(s.id))
          .map((s) => s.tier)}
      />
    </YStack>
  )
}
