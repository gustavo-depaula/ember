import type { TFunction } from 'i18next'

import { getEntry } from '@/content/contentIndex'
import { getManifest, getManifestIconKey } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { getPractice } from '@/db/repositories'
import { localizeContent } from '@/lib/i18n'
import { getProgramDay, parseSchedule } from './schedule'

export function getPracticeIconKey(slot: SlotState): string {
  const practice = getPractice(slot.practice_id)
  if (practice?.custom_icon) return practice.custom_icon
  const manifest = getManifest(slot.practice_id)
  if (manifest) return getManifestIconKey(slot.practice_id)
  // Catalog icon hint resolves before the manifest body warms.
  return getEntry(slot.practice_id)?.icon ?? 'prayer'
}

export function getSlotName(slot: SlotState, _t: TFunction): string {
  const manifest = getManifest(slot.practice_id)
  if (manifest) return localizeContent(manifest.name)
  const practice = getPractice(slot.practice_id)
  if (practice?.custom_name) return practice.custom_name
  // Fall back to the catalog name hint (present for list rendering without a
  // manifest fetch) so a corpus slot never shows its raw id while warming.
  const entry = getEntry(slot.practice_id)
  if (entry?.name) return localizeContent(entry.name)
  return slot.practice_id
}

export function enrichSlot(
  slot: SlotState,
  t: TFunction,
  programDayOverride?: number,
): SlotState & { name: string; icon: string; subtitle?: string } {
  const manifest = getManifest(slot.practice_id)
  const subtitle = (() => {
    if (!manifest?.program) return undefined
    const day = programDayOverride ?? getProgramDay(parseSchedule(slot.schedule), new Date())
    if (day === undefined) return undefined
    return t('program.dayOf', { day: day + 1, total: manifest.program.totalDays })
  })()

  return {
    ...slot,
    name: getSlotName(slot, t),
    icon: getPracticeIconKey(slot),
    subtitle,
  }
}
