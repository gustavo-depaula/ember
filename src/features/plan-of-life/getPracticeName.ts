import type { TFunction } from 'i18next'

import type { Practice } from '@/db/schema'

export function getPracticeName(practice: Practice, t: TFunction): string {
  if (practice.is_builtin === 1) {
    const key = `practice.${practice.id}`
    const translated = t(key)
    return translated !== key ? translated : practice.name
  }
  return practice.name
}
