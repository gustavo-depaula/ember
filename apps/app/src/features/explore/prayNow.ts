import { lookupMap } from '@ember/content-engine'
import type { TFunction } from 'i18next'
import { bareId } from '@/content/contentIndex'
import { minutesText, practiceMinutes } from '@/content/duration'
import { getHourSelect } from '@/content/pins'
import { getLoadedFlow, getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { getPractice } from '@/db/repositories/practices'
import type { TimeBlock } from '@/db/schema'
import { enrichSlot } from '@/features/plan-of-life/getPracticeName'
import {
  dayMinutes,
  deriveTimeBlock,
  getCurrentTimeBlock,
} from '@/features/plan-of-life/timeBlocks'
import { localizeContent } from '@/lib/i18n'
import { pickByWindow, type Timed } from './prayNowOrder'

// What "Pray now" offers. Only timed practices and hour-based offices are
// picked; untimed ones (Confession, spiritual reading) have no "now". The
// timing rules live in prayNowOrder.ts. A plan with nothing timed at all falls
// back to the backbone: a few short practices across the day, as suggestions.
// A plain function of the day, so the website's connected browser picks as the app does.

export type PrayNowItem = ReturnType<typeof enrichSlot> & Timed

export type PrayNowPick = {
  next: PrayNowItem
  /** Nothing is on time yet; `next` is the first to open. */
  comingUp: boolean
  /** Offered from the backbone, not the user's plan. */
  suggestion: boolean
  /** The part of the day it belongs to; an office's is now's. */
  block: TimeBlock
  /** The minutes it takes as prayed now ("15"), for the card's pill. */
  minutes?: string
}

/**
 * What to pray now, or undefined when there is nothing to pray. `slots` are
 * the plan's due today, the flows of their practices loaded; `prayedToday`
 * the practice ids prayed today, which the backbone counts.
 */
export function prayNowFor({
  slots,
  completedIds,
  prayedToday,
  today,
  holyDay,
  wall,
  t,
}: {
  slots: SlotState[]
  completedIds: Set<string>
  prayedToday: string[]
  today: Date
  holyDay: boolean
  wall: Date
  t: TFunction
}): PrayNowPick | undefined {
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
    minutes: minutesText(minutesOf(next, today, holyDay)),
  }
}

/** The next practice, or undefined when the plan has nothing timed at all. */
function pickNext(
  slots: SlotState[],
  completedIds: Set<string>,
  now: number,
  t: TFunction,
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

// The backbone: a few short practices (each under 10 minutes) spread over the day — what
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

/** The practices the backbone offers, for a caller that loads them ahead. */
export const backbonePractices = [...new Set(backbone.map((b) => b.ref))]

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

// A practice whose flow picks its hour from the clock (the Breviary, the
// Little Offices, the Liturgy of the Hours…) is titled by that hour — "Prime",
// "Vespers" — with the practice as subtitle, exactly as the flow will resolve
// it when opened. A slot pinned to an hour already carries its own label.

const hourSelectFor = (practiceId: string) =>
  getHourSelect(getLoadedFlow(getPractice(practiceId)?.active_variant ?? practiceId))

function withHourTitle(item: PrayNowItem, hour: number): PrayNowItem {
  if (item.pinned) return item
  const select = hourSelectFor(item.practice_id)
  const option = select?.options.find((o) => o.id === hourOf(item, hour))
  if (!option) return item
  return { ...item, name: localizeContent(option.label), subtitle: item.name }
}

/** The hour an office's slot is: the one it pins, else the clock's. */
function hourOf(item: PrayNowItem, hour: number): string | undefined {
  const select = hourSelectFor(item.practice_id)
  if (!select) return undefined
  return item.pins?.[select.as] ?? (select.map ? lookupMap(select.map, String(hour)) : undefined)
}

function minutesOf(item: PrayNowItem, today: Date, holyDay: boolean) {
  const prayedId = getPractice(item.practice_id)?.active_variant ?? item.practice_id
  return practiceMinutes(getManifest(prayedId), {
    chosen: item.minutes,
    hour: hourOf(item, Math.floor(item.due / 60) % 24),
    date: today,
    holyDay,
  })
}
