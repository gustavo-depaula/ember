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
    // Multi-hour: use the hour name from manifest
    if (slot.slot_id !== 'default' && manifest.hours?.length) {
      const hour = manifest.hours.find((h) => h.id === slot.slot_id)
      if (hour) return localizeContent(hour.name)
    }

    // User-added slot with variant: "Practice (Variant)"
    if (slot.slot_id !== 'default' && slot.variant && manifest.variants?.length) {
      const variant = manifest.variants.find((v) => v.id === slot.variant)
      const practiceName = localizeManifestName(manifest, slot.practice_id, t)
      if (variant) return `${practiceName} (${localizeContent(variant.name)})`
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
