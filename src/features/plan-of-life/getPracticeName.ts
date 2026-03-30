import type { TFunction } from 'i18next'

import { getManifest, getManifestIconKey } from '@/content/practices'
import type { UserPractice } from '@/db/schema'
import { localizeContent } from '@/lib/i18n'

export function getPracticeIconKey(practice: UserPractice): string {
  if (practice.custom_icon) return practice.custom_icon
  const manifest = getManifest(practice.practice_id)
  if (manifest) return getManifestIconKey(practice.practice_id)
  return 'prayer'
}

export function getPracticeName(practice: UserPractice, t: TFunction): string {
  // Check if there's a manifest for this practice
  const manifest = getManifest(practice.practice_id)
  if (manifest) {
    const key = `practice.${practice.practice_id}`
    const translated = t(key)
    if (translated !== key) return translated
    return localizeContent(manifest.name)
  }

  // Custom practice — use custom_name
  return practice.custom_name ?? practice.practice_id
}
