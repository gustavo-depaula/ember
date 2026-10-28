import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { resolveCompletions, type SlotState, useEventStore } from '@/db/events'
import { useTodayCelebration } from '@/features/calendar/hooks'
import { useSlotFlows } from '@/features/plan-of-life'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import { useToday } from '@/hooks/useToday'
import { type PrayNowPick, prayNowFor } from './prayNow'

export type { PrayNowItem } from './prayNow'
export type PrayNow = PrayNowPick & { onPray: () => void }

/**
 * What the "Pray now" card shows, or undefined when there is nothing to pray:
 * the card never rests on "all done" — it just isn't there, and the carousel
 * starts with its next card.
 */
export function usePrayNow({
  slots,
  completedIds,
  onPray,
}: {
  slots: SlotState[]
  completedIds: Set<string>
  onPray: (item: ChecklistItem) => void
}): PrayNow | undefined {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const date = format(today, 'yyyy-MM-dd')
  const holyDay = useTodayCelebration()?.principal?.entry.holyDayOfObligation === true
  const prayedToday = useEventStore(
    useShallow((st) =>
      resolveCompletions(st.completionsByDate.get(date), st.completions).map((c) => c.practice_id),
    ),
  )
  // Offices are known by their flows, and hour titles read from them.
  useSlotFlows(slots)
  // Re-pick as deferred manifests warm in.
  useCatalogVersion()
  const pick = prayNowFor({ slots, completedIds, prayedToday, today, holyDay, wall: new Date(), t })
  if (!pick) return undefined
  return {
    ...pick,
    // A backbone slot isn't the user's: open the practice without a slot, so
    // praying it never logs against a slot that isn't there.
    onPray: () =>
      pick.suggestion
        ? router.push({
            pathname: '/pray/[practiceId]',
            params: { practiceId: pick.next.practice_id },
          })
        : onPray(pick.next),
  }
}
