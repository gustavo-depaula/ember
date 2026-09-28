import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'

import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { useYearCalendar } from '@/features/calendar'
import {
  filterSlotsForDate,
  type ScheduleContext,
  useCompletedSlots,
  useCompletionDatesBySlot,
  usePinnedFlows,
  useProgramHidesForDate,
  useSlots,
} from '@/features/plan-of-life'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import { useStableToday, useToday } from '@/hooks/useToday'
import {
  getCelebrationsForDate,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * The plan of life as it stands on the day Today shows: the slots due that day
 * (schedule, season and program hides applied), which are done, and how a tap
 * on one opens its prayer. Today derives it once and hands it to the Plan of
 * Life card and the checklist in its sheet.
 */
export function useTodayPlan() {
  const router = useRouter()
  const now = useToday()
  const selectedDate = format(now, 'yyyy-MM-dd')
  const anchorDate = format(useStableToday(), 'yyyy-MM-dd')
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const season = useMemo(
    () => getLiturgicalSeason(now, liturgicalCalendar),
    [now, liturgicalCalendar],
  )

  const slots = useSlots()
  const completedIds = useCompletedSlots(selectedDate)
  const { data: yearCalendar } = useYearCalendar(now.getFullYear())

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  const scheduleCtx: ScheduleContext | undefined = useMemo(() => {
    if (!yearCalendar) return undefined
    const dayCalendar = getCelebrationsForDate(yearCalendar, now)
    return { season, dayCalendar }
  }, [yearCalendar, season, selectedDate])

  const completionsBySlot = useCompletionDatesBySlot()
  const programHides = useProgramHidesForDate(selectedDate)
  const todaySlots = useMemo(
    () =>
      filterSlotsForDate(slots, selectedDate, scheduleCtx, completionsBySlot).filter(
        (s) => !programHides.has(s.id),
      ),
    [slots, selectedDate, scheduleCtx, completionsBySlot, programHides],
  )
  // Rows name pinned slots from their flows; the count re-derives them as
  // those flows arrive.
  const pinnedFlows = usePinnedFlows(todaySlots)

  const onPressItem = useCallback(
    (item: ChecklistItem) => {
      const practiceId = item.practice_id
      const practice = useEventStore.getState().practices.get(practiceId)
      const resolvedId = practice?.active_variant ?? practiceId
      if (!getManifest(resolvedId)) {
        router.push({ pathname: '/plan/[practiceId]', params: { practiceId } })
        return
      }
      // Pray the active variant; the tapped slot is what the prayer completes.
      router.push({
        pathname: '/pray/[practiceId]',
        params: { practiceId: resolvedId, slotKey: item.id },
      })
    },
    [router],
  )

  return {
    now,
    selectedDate,
    anchorDate,
    isFutureDate: selectedDate > anchorDate,
    season,
    slots,
    todaySlots,
    completedIds,
    pinnedFlows,
    onPressItem,
  }
}

export type TodayPlan = ReturnType<typeof useTodayPlan>
