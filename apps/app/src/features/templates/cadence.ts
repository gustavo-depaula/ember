import type { TFunction } from 'i18next'

import { dayKeys } from '@/config/constants'
import type { Schedule } from '@/features/plan-of-life/schedule'

/**
 * A short, human cadence summary for a template practice — "daily", "Mon · Wed",
 * "1×/week". Minimal on purpose: enough to read a proposed rule at a glance, not
 * a full schedule editor (that lives in `SchedulePicker`). Reuses the existing
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
      if (schedule.n === -1) return `${t('frequency.last')} · ${day}`
      return `${schedule.n}ª · ${day}`
    }

    case 'times-per':
      return `${schedule.count}× / ${t(`frequency.${schedule.period}`)}`

    case 'holy-days-of-obligation':
      return t('frequency.holyDays')

    default:
      return t('frequency.daily')
  }
}
