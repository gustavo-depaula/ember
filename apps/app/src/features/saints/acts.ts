import type { Act } from '@ember/holy-cards'

import { canonicalize, getEntry } from '@/content/contentIndex'
import type { LiturgicalAct } from '@/content/manifestTypes'
import type { Completion } from '@/db/schema'
import { isBackfill, prayedIdOf } from '@/features/plan-of-life/completion'

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
