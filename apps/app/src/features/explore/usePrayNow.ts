import { lookupMap } from '@ember/content-engine'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { bareId } from '@/content/contentIndex'
import { getHourSelect } from '@/content/pins'
import { getLoadedFlow } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { resolveCompletions, type SlotState, useEventStore } from '@/db/events'
import { getPractice } from '@/db/repositories/practices'
import type { TimeBlock } from '@/db/schema'
import {
  deriveTimeBlock,
  enrichSlot,
  getCurrentTimeBlock,
  useSlotFlows,
} from '@/features/plan-of-life'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { dayMinutes, pickByWindow, type Timed } from './prayNowOrder'

// What "Pray now" offers. Only timed practices and hour-based offices are
// picked; untimed ones (Confession, spiritual reading) have no "now". The
// timing rules live in prayNowOrder.ts. A plan with nothing timed at all falls
// back to the backbone: a few short practices across the day, as suggestions.

export type PrayNowItem = ReturnType<typeof enrichSlot> & Timed

export type PrayNow = {
  next: PrayNowItem
  /** Nothing is on time yet; `next` is the first to open. */
  comingUp: boolean
  /** Offered from the backbone, not the user's plan. */
  suggestion: boolean
  /** The part of the day it belongs to; an office's is now's. */
  block: TimeBlock
  onPray: () => void
}

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
  const date = format(useToday(), 'yyyy-MM-dd')
  const prayedToday = useEventStore(
    useShallow((st) =>
      resolveCompletions(st.completionsByDate.get(date), st.completions).map((c) => c.practice_id),
    ),
  )
  // Offices are known by their flows, and hour titles read from them.
  useSlotFlows(slots)
  // Re-pick as deferred manifests warm in.
  useCatalogVersion()
  const wall = new Date()
  const now = dayMinutes(`${wall.getHours()}:${wall.getMinutes()}`)

  const fromPlan = pickNext(slots, completedIds, now, t)
  const suggestion = fromPlan === undefined
  const pick = fromPlan ?? pickNext(backboneSlots, backboneDone(prayedToday), now, t)
  if (!pick?.next) return undefined
  const { next, comingUp } = pick
  return {
    next,
    comingUp,
    suggestion,
    block:
      next.office || next.time_block === 'flexible'
        ? getCurrentTimeBlock(wall.getHours())
        : next.time_block,
    // A backbone slot isn't the user's: open the practice without a slot, so
    // praying it never logs against a slot that isn't there.
    onPray: () =>
      suggestion
        ? router.push({ pathname: '/pray/[practiceId]', params: { practiceId: next.practice_id } })
        : onPray(next),
  }
}

/** The next practice, or undefined when the plan has nothing timed at all. */
function pickNext(
  slots: SlotState[],
  completedIds: Set<string>,
  now: number,
  t: Parameters<typeof enrichSlot>[1],
): { next?: PrayNowItem; comingUp: boolean } | undefined {
  const timed = slots.flatMap((slot) => {
    const office = !slot.pins && !!hourSelectFor(slot.practice_id)?.map
    if (!slot.time && !office) return []
    return [{ slot, tier: slot.tier, office, due: office ? now : dayMinutes(slot.time ?? '00:00') }]
  })
  if (timed.length === 0) return undefined
  const { next, comingUp } = pickByWindow(
    timed.filter((s) => !completedIds.has(s.slot.id)),
    now,
    timed.filter((s) => !s.office).map((s) => s.due),
  )
  if (!next) return { comingUp }
  const item = { ...enrichSlot(next.slot, t), office: next.office, due: next.due }
  return { next: withHourTitle(item, Math.floor(next.due / 60) % 24), comingUp }
}

// ── Backbone ────────────────────────────────────────────────────────────────
// A few short practices (each under 10 minutes) spread over the day — what
// the card offers someone whose plan has nothing timed yet.

const backbone: Array<{ ref: string; time: string }> = [
  { ref: 'morning-offering', time: '07:00' },
  { ref: 'gospel-of-the-day', time: '07:30' },
  { ref: 'angelus', time: '12:00' },
  { ref: 'three-oclock-prayer', time: '15:00' },
  { ref: 'angelus', time: '18:00' },
  { ref: 'examination-of-conscience', time: '21:00' },
  { ref: 'night-prayer', time: '21:30' },
]

const backboneSlots: SlotState[] = backbone.map(({ ref, time }, i) => ({
  id: `backbone::${ref}::${i}`,
  practice_id: ref,
  enabled: 1,
  sort_order: i,
  tier: 'essential',
  time,
  time_block: deriveTimeBlock(time),
  notify: null,
  schedule: JSON.stringify({ type: 'daily' }),
}))

/** The backbone slots already prayed today: the nth Angelus is done once n were prayed. */
function backboneDone(prayed: string[]): Set<string> {
  const count = new Map<string, number>()
  for (const id of prayed) count.set(bareId(id), (count.get(bareId(id)) ?? 0) + 1)
  const seen = new Map<string, number>()
  const done = new Set<string>()
  for (const s of backboneSlots) {
    const nth = (seen.get(s.practice_id) ?? 0) + 1
    seen.set(s.practice_id, nth)
    if ((count.get(s.practice_id) ?? 0) >= nth) done.add(s.id)
  }
  return done
}

// ── Office hours ────────────────────────────────────────────────────────────
// A practice whose flow picks its hour from the clock (the Breviary, the
// Little Offices, the Liturgy of the Hours…) is titled by that hour — "Prime",
// "Vespers" — with the practice as subtitle, exactly as the flow will resolve
// it when opened. A slot pinned to an hour already carries its own label.

const hourSelectFor = (practiceId: string) =>
  getHourSelect(getLoadedFlow(getPractice(practiceId)?.active_variant ?? practiceId))

function withHourTitle(item: PrayNowItem, hour: number): PrayNowItem {
  if (item.pinned) return item
  const select = hourSelectFor(item.practice_id)
  const optionId = select?.map ? lookupMap(select.map, String(hour)) : undefined
  const option = select?.options.find((o) => o.id === optionId)
  if (!option) return item
  return { ...item, name: localizeContent(option.label), subtitle: item.name }
}
