import type { TFunction } from 'i18next'

import { getManifest, getManifestIconKey } from '@/content/practices'
import type { UserPracticeSlot } from '@/db/schema'
import { localizeContent } from '@/lib/i18n'

export function getPracticeIconKey(slot: UserPracticeSlot): string {
  if (slot.custom_icon) return slot.custom_icon
  const manifest = getManifest(slot.practice_id)
  if (manifest) return getManifestIconKey(slot.practice_id)
  return 'prayer'
}

export function getSlotName(slot: UserPracticeSlot, t: TFunction): string {
  const manifest = getManifest(slot.practice_id)

  if (manifest) {
    // Multi-flow: use the flow name from manifest
    if (slot.slot_id !== 'default' && manifest.flows.length > 1) {
      const flow = manifest.flows.find((f) => f.id === slot.slot_id)
      if (flow) return localizeContent(flow.name)
    }

    // Default slot: use manifest name
    return localizeManifestName(manifest, slot.practice_id, t)
  }

  // Custom practice — use custom_name from joined practice data
  return slot.custom_name ?? slot.practice_id
}

function localizeManifestName(
  manifest: NonNullable<ReturnType<typeof getManifest>>,
  practiceId: string,
  t: TFunction,
): string {
  const key = `practice.${practiceId}`
  const translated = t(key)
  if (translated !== key) return translated
  return localizeContent(manifest.name)
}

export function enrichSlot(
  slot: UserPracticeSlot,
  t: TFunction,
): UserPracticeSlot & { name: string; icon: string } {
  return {
    ...slot,
    name: getSlotName(slot, t),
    icon: getPracticeIconKey(slot),
  }
}
