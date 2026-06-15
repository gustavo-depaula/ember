import { useTranslation } from 'react-i18next'

import { localizeContent } from '@/lib/i18n'
import {
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type ResolvedCelebration,
} from '@/lib/liturgical'
import { useMassFormulary } from '@/lib/mass-of/useMassFormulary'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * A celebration's display name and description, with the Mass formulary as the
 * single source of truth. Sanctoral celebrations carry their title from the
 * calendar statics; temporal ones don't, so their name comes from the formulary
 * (falling back to `getLiturgicalDayName` while it loads or when none exists).
 * Descriptions come from the formulary too — EF celebrations keep the curated
 * `entries.json` text.
 */
export function useCelebrationDisplay(celebration: ResolvedCelebration | undefined): {
  name: string
  description: string
} {
  const { t } = useTranslation()
  const form = usePreferencesStore((s) => s.liturgicalCalendar) as LiturgicalCalendarForm
  const { data: formulary } = useMassFormulary(celebration?.entry.id)

  if (!celebration) return { name: '', description: '' }

  const name =
    localizeContent(celebration.entry.name) ||
    (formulary?.title ? localizeContent(formulary.title) : '') ||
    getLiturgicalDayName(celebration.date, form, { t: (k, o) => t(k, o) as string })

  const description = formulary?.description
    ? localizeContent(formulary.description)
    : localizeContent(celebration.entry.description)

  return { name, description }
}
