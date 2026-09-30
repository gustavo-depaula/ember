import type { Act } from '@ember/holy-cards'

import type { PracticeManifest } from '@/content/manifestTypes'
import type { Completion } from '@/db/schema'

type LiturgicalAct = NonNullable<PracticeManifest['liturgicalAct']>

/**
 * Whether praying `practiceId` is attending Mass or praying the Office. A form
 * of a practice (the Vetus Ordo, a breviary edition) takes it from its group's
 * primary manifest, so only the primary declares it.
 */
export function liturgicalActOf(
  practiceId: string,
  manifestOf: (id: string) => PracticeManifest | undefined,
): LiturgicalAct | undefined {
  const manifest = manifestOf(practiceId)
  if (!manifest) return undefined
  if (manifest.liturgicalAct) return manifest.liturgicalAct
  const group = manifest.alternativeTo?.id
  return group && group !== manifest.id ? manifestOf(group)?.liturgicalAct : undefined
}

/**
 * The Masses and Offices among the user's completions — the acts the Mass and
 * Office doors read. Backfilled days (a program catching up days it missed)
 * aren't prayers the user marked, so they never count.
 */
export function liturgicalActs(
  completions: Iterable<Completion>,
  prayedIdOf: (completion: Completion) => string,
  manifestOf: (id: string) => PracticeManifest | undefined,
): Act[] {
  const actOf = new Map<string, LiturgicalAct | undefined>()
  const acts: Act[] = []
  for (const c of completions) {
    if (c.sub_id === 'backfill') continue
    const prayed = prayedIdOf(c)
    if (!actOf.has(prayed)) actOf.set(prayed, liturgicalActOf(prayed, manifestOf))
    const kind = actOf.get(prayed)
    if (kind) acts.push({ kind, date: c.date })
  }
  return acts
}
