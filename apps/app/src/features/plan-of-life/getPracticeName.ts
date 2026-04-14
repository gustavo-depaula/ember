import { type FlowContext, getContextValue, lookupMap } from '@ember/content-engine'
import type { TFunction } from 'i18next'

import { getManifest, getManifestIconKey, loadFlow } from '@/content/registry'
import type { UserPracticeSlot } from '@/db/schema'
import { localizeContent } from '@/lib/i18n'
import { getProgramDay, parseSchedule } from './schedule'

export function getPracticeIconKey(slot: UserPracticeSlot): string {
  if (slot.custom_icon) return slot.custom_icon
  const manifest = getManifest(slot.practice_id)
  if (manifest) return getManifestIconKey(slot.practice_id)
  return 'prayer'
}

export function getSlotName(slot: UserPracticeSlot, t: TFunction): string {
  const manifest = getManifest(slot.practice_id)

  if (manifest) {
    const baseName = localizeManifestName(manifest, slot.practice_id, t)
    const variantLabel = previewSelectLabel(slot)
    return variantLabel ? `${baseName} - ${variantLabel}` : baseName
  }

  // Custom practice — use custom_name from joined practice data
  return slot.custom_name ?? slot.practice_id
}

function previewSelectLabel(slot: UserPracticeSlot): string | undefined {
  const flow = loadFlow(slot.practice_id)
  if (!flow) return undefined

  const selectSection = flow.sections.find(
    (section) => section.type === 'select' && Boolean(section.label),
  )
  if (!selectSection || selectSection.type !== 'select') return undefined

  const date = new Date()
  if (slot.time) {
    const [hour, minute] = slot.time.split(':').map((part) => Number(part))
    if (!Number.isNaN(hour)) date.setHours(hour)
    if (!Number.isNaN(minute)) date.setMinutes(minute)
  }

  const context: FlowContext = {
    date,
    programDay: getProgramDay(parseSchedule(slot.schedule), date),
  }
  const rawValue = selectSection.on ? getContextValue(context, selectSection.on) : undefined
  const mappedValue =
    rawValue !== undefined && selectSection.map ? lookupMap(selectSection.map, rawValue) : rawValue
  const selectedId = mappedValue ?? selectSection.default ?? selectSection.options[0]?.id
  if (!selectedId) return undefined
  const selectedOption = selectSection.options.find((option) => option.id === selectedId)
  if (!selectedOption) return undefined
  return localizeContent(selectedOption.label)
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
  programDayOverride?: number,
): UserPracticeSlot & { name: string; icon: string; subtitle?: string } {
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
