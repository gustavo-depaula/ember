import { canonicalize } from '@/content/contentIndex'
import {
  isTemplatePlaceholder,
  type PlanOfLifeTemplateManifest,
  type PlanOfLifeTemplatePracticeRef,
} from '@/content/manifestTypes'
import { findGroupMemberInSet } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { createPracticeWithSlot, updatePractice } from '@/db/repositories'
import { planSlots } from '@/features/plan-of-life/due'

/**
 * What adopting a template would do with each of its practices, by index (a
 * template may list one ref twice, as Opus Dei's two periods of prayer):
 *   - placeholder: named for fidelity, never adopted (the corpus lacks it)
 *   - already: in the rule as it stands
 *   - replacesId: a sibling of the same `alternativeTo` group is in the rule,
 *     so adopting switches that practice to the tradition's variant
 *   - otherwise a new practice with the template's tier, hour and days
 */
export type Proposal =
  | { index: number; placeholder: true }
  | {
      index: number
      placeholder: false
      ref: string
      tier: PlanOfLifeTemplatePracticeRef['tier']
      time?: string
      schedule: PlanOfLifeTemplatePracticeRef['schedule']
      already: boolean
      replacesId?: string
    }

export function proposalsOf(
  template: PlanOfLifeTemplateManifest,
  inRule: ReadonlySet<string>,
): Proposal[] {
  return template.practices.map((p, index) => {
    if (isTemplatePlaceholder(p)) return { index, placeholder: true }
    // Templates name practices by bare id; the plan keeps the canonical one.
    const ref = canonicalize(p.ref, 'practice') ?? p.ref
    const already = inRule.has(ref)
    return {
      index,
      placeholder: false,
      ref,
      tier: p.tier,
      time: p.time,
      schedule: p.schedule,
      already,
      replacesId: already ? undefined : findGroupMemberInSet(ref, inRule),
    }
  })
}

/** The practices of the rule as it stands, by id. */
export function practicesInRule(): Set<string> {
  return new Set(planSlots(useEventStore.getState()).map((s) => s.practice_id))
}

/**
 * Adds a template's practices to the rule — only the proposals at `only`'s
 * indexes when given. The rule's own slots, hours and tiers are never touched.
 * Returns the slots it added and the practices it added.
 */
export async function adoptTemplate(
  template: PlanOfLifeTemplateManifest,
  only?: ReadonlySet<number>,
): Promise<{ slotKeys: string[]; added: string[] }> {
  const slotKeys: string[] = []
  const added: string[] = []
  for (const p of proposalsOf(template, practicesInRule())) {
    if (p.placeholder || p.already || (only && !only.has(p.index))) continue
    if (p.replacesId) {
      // As picking a form does: no new slot, so the user's hour and tier survive.
      await updatePractice(p.replacesId, { activeVariant: p.ref })
      continue
    }
    slotKeys.push(
      await createPracticeWithSlot(
        { id: p.ref },
        { tier: p.tier, time: p.time, schedule: JSON.stringify(p.schedule) },
      ),
    )
    added.push(p.ref)
  }
  return { slotKeys, added }
}
