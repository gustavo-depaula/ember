import type { Act, EmberSeason } from '@ember/holy-cards'
import { logicalDay } from '@ember/liturgical'
import { format } from 'date-fns'

import { canonicalize, getEntry } from '@/content/contentIndex'
import type { DayPrayer, LiturgicalAct, PracticeManifest } from '@/content/manifestTypes'
import { getManifest } from '@/content/resolver'
import { type EventStoreState, resolveCompletions } from '@/db/events'
import type { Completion } from '@/db/schema'
import { isBackfill, prayedIdOf } from '@/features/plan-of-life/completion'
import { programFinishedOn, programRounds } from '@/features/plan-of-life/program'
import { parseSchedule } from '@/features/plan-of-life/schedule'

/** Whether praying `practiceId` is attending Mass or praying the Office. */
function catalogActOf(practiceId: string): LiturgicalAct | undefined {
  const id = canonicalize(practiceId, 'practice')
  return id ? getEntry(id)?.liturgicalAct : undefined
}

/**
 * The Masses and Offices among `completions` — the acts the Mass and Office
 * doors read — judged by what was prayed, not the plan practice it was logged
 * under. Backfilled days aren't prayers the user marked, so they never count.
 */
export function liturgicalActs(
  completions: Iterable<Completion>,
  actOf: (practiceId: string) => LiturgicalAct | undefined = catalogActOf,
): Act[] {
  const acts: Act[] = []
  for (const c of completions) {
    if (isBackfill(c)) continue
    const kind = actOf(prayedIdOf(c))
    if (kind) acts.push({ kind, date: c.date })
  }
  return acts
}

function catalogDayPrayerOf(practiceId: string): DayPrayer | undefined {
  const id = canonicalize(practiceId, 'practice')
  return id ? getEntry(id)?.dayPrayer : undefined
}

export const dayPrayers: readonly DayPrayer[] = ['offering', 'rosary', 'examen']

/**
 * Which of the day's three prayers — the morning offering, the rosary, the
 * examination of conscience, in any of their forms — were prayed on each date.
 * Backfilled days aren't prayers the user marked, so they never count.
 */
export function dayPrayersByDate(
  completions: Iterable<Completion>,
  prayerOf: (practiceId: string) => DayPrayer | undefined = catalogDayPrayerOf,
): Map<string, Set<DayPrayer>> {
  const byDate = new Map<string, Set<DayPrayer>>()
  for (const c of completions) {
    if (isBackfill(c)) continue
    const prayer = prayerOf(prayedIdOf(c))
    if (prayer) byDate.set(c.date, (byDate.get(c.date) ?? new Set()).add(prayer))
  }
  return byDate
}

/** The days kept with all three: each counts as the Office does. */
export function prayedDayActs(completions: Iterable<Completion>): Act[] {
  return [...dayPrayersByDate(completions)]
    .filter(([, prayed]) => prayed.size === dayPrayers.length)
    .map(([date]) => ({ kind: 'prayedDay', date }))
}

export type Plan = Pick<
  EventStoreState,
  'slots' | 'cursors' | 'completions' | 'completionsByPractice'
>

/**
 * The novenas in the plan finished well enough to give the card each names,
 * dated the day each settled, with the card each gives. Read from the program's
 * current run: a novena begun again forgets the run before, whose card was by
 * then redeemed or lapsed. Backfilled days aren't prayers, so they never count.
 */
export function novenaActs(
  plan: Plan,
  today: Date,
  manifestOf: (practiceId: string) => PracticeManifest | undefined = getManifest,
): { acts: Act[]; cards: Record<string, string[]> } {
  const acts: Act[] = []
  const cards: Record<string, string[]> = {}
  const seen = new Set<string>()
  for (const slot of plan.slots.values()) {
    const practiceId = slot.practice_id
    if (seen.has(practiceId)) continue
    seen.add(practiceId)
    const manifest = manifestOf(practiceId)
    if (!manifest?.program || manifest.program.days || !manifest.holyCard) continue
    const prayed = resolveCompletions(plan.completionsByPractice.get(practiceId), plan.completions)
      .filter((c) => !isBackfill(c))
      .map((c) => c.date)
    const date = programFinishedOn({
      program: manifest.program,
      schedule: parseSchedule(slot.schedule),
      cursor: plan.cursors.get(`program/${practiceId}`) ?? null,
      completionDatesAsc: [...new Set(prayed)].sort(),
      today,
    })
    if (!date) continue
    acts.push({ kind: 'novenaFinished', novena: practiceId, date })
    cards[practiceId] = [manifest.holyCard].flat()
  }
  return { acts, cards }
}

/**
 * The dates a practice was marked on the day itself. A round's day is kept
 * only so: a fast can't be made up, and a day ticked afterwards doesn't
 * count.
 */
export function markedOnTheDay(plan: Plan, practiceId: string): Set<string> {
  return new Set(
    resolveCompletions(plan.completionsByPractice.get(practiceId), plan.completions)
      .filter((c) => format(logicalDay(new Date(c.completed_at)), 'yyyy-MM-dd') === c.date)
      .map((c) => c.date),
  )
}

/** How many of a round's days were kept. */
export function roundDaysKept(plan: Plan, practiceId: string, days: string[]): number {
  const kept = markedOnTheDay(plan, practiceId)
  return days.filter((d) => kept.has(d)).length
}

/**
 * The rounds kept whole of the plan's programs dated by a rule (the Ember
 * days), each dated its last day, with the card each round gives. A card
 * unredeemed lapses within days, so the rounds listed around today are enough.
 */
export function roundActs(
  plan: Plan,
  today: Date,
  manifestOf: (practiceId: string) => PracticeManifest | undefined = getManifest,
): { acts: Act[]; cards: Record<string, string> } {
  const todayStr = format(today, 'yyyy-MM-dd')
  const acts: Act[] = []
  const cards: Record<string, string> = {}
  const seen = new Set<string>()
  for (const slot of plan.slots.values()) {
    const practiceId = slot.practice_id
    if (seen.has(practiceId)) continue
    seen.add(practiceId)
    const program = manifestOf(practiceId)?.program
    if (!program?.days) continue
    Object.assign(cards, program.holyCard)
    for (const round of programRounds(program, today)) {
      const last = round.days.at(-1) as string
      if (last > todayStr || roundDaysKept(plan, practiceId, round.days) < round.days.length)
        continue
      acts.push({ kind: 'emberDaysFinished', ember: round.key as EmberSeason, date: last })
    }
  }
  return { acts, cards }
}
