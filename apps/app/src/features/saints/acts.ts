import type { Act } from '@ember/holy-cards'
import { type EmberWeek, emberWeeks, logicalDay } from '@ember/liturgical'
import { format } from 'date-fns'

import { canonicalize, getEntry } from '@/content/contentIndex'
import type { LiturgicalAct, PracticeManifest } from '@/content/manifestTypes'
import { getManifest } from '@/content/resolver'
import { type EventStoreState, resolveCompletions } from '@/db/events'
import type { Completion } from '@/db/schema'
import { isBackfill, prayedIdOf } from '@/features/plan-of-life/completion'
import { programFinishedOn } from '@/features/plan-of-life/program'
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

type Plan = Pick<EventStoreState, 'slots' | 'cursors' | 'completions' | 'completionsByPractice'>

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
    if (!manifest?.program || !manifest.holyCard) continue
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

/** The practices the plan keeps on the Ember days. */
function emberPractices(plan: Plan): string[] {
  const ids = new Set<string>()
  for (const slot of plan.slots.values()) {
    if (parseSchedule(slot.schedule).type === 'ember-days') ids.add(slot.practice_id)
  }
  return [...ids]
}

/**
 * How many of an Ember week's three days were kept, each marked on the day
 * itself: a fast can't be made up, so a day ticked afterwards doesn't count.
 */
export function emberDaysKept(plan: Plan, week: EmberWeek): number {
  const counts = emberPractices(plan).map((practiceId) => {
    const prayed = new Set(
      resolveCompletions(plan.completionsByPractice.get(practiceId), plan.completions)
        .filter((c) => format(logicalDay(new Date(c.completed_at)), 'yyyy-MM-dd') === c.date)
        .map((c) => c.date),
    )
    return week.days.filter((d) => prayed.has(d)).length
  })
  return Math.max(0, ...counts)
}

/**
 * The Ember weeks kept whole, dated their Saturday, each giving its season's
 * card. This year's and last year's are enough: a card unredeemed lapses
 * within days.
 */
export function emberActs(plan: Plan, today: Date): Act[] {
  const todayStr = format(today, 'yyyy-MM-dd')
  const year = today.getFullYear()
  return [...emberWeeks(year - 1), ...emberWeeks(year)]
    .filter((week) => week.days[2] <= todayStr && emberDaysKept(plan, week) === 3)
    .map((week) => ({ kind: 'emberDaysFinished', ember: week.season, date: week.days[2] }))
}
