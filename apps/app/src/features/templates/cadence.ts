import type { TFunction } from 'i18next'

import { dayKeys } from '@/config/constants'
import type { Schedule } from '@/features/plan-of-life/schedule'

/**
 * A short, human cadence summary for a template practice — "daily", "Mon · Wed",
 * "1ª · 3ª · Sat". Minimal on purpose: enough to read a proposed rule at a glance, not
 * a full schedule editor (that is the rule's `WhenSheet`). Reuses the existing
 * `frequency.*` / `day.*` i18n keys so the wording matches the rest of the app.
 */
export function cadenceLabel(schedule: Schedule, t: TFunction): string {
  switch (schedule.type) {
    case 'daily':
    case 'fixed-program':
      return t('frequency.daily')

    case 'days-of-week': {
      const labels = schedule.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => t(`day.${dayKeys[d] ?? 'sun'}`))
      return labels.join(' · ')
    }

    case 'day-of-month':
      return t('frequency.monthly')

    case 'nth-weekday': {
      const day = t(`day.${dayKeys[schedule.day] ?? 'sun'}`)
      const weeks = schedule.n.map((n) => (n === -1 ? t('frequency.last') : `${n}ª`))
      return `${weeks.join(' · ')} · ${day}`
    }

    case 'holy-days-of-obligation':
      return t('frequency.holyDays')

    default:
      return t('frequency.daily')
  }
}
