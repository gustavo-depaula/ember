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
 * A celebration's display name and description.
 *
 * OF sanctoral celebrations carry their title from the calendar statics; OF
 * temporal ones don't, so their name (and "about this celebration" prose) comes
 * from the Mass formulary, falling back to `getLiturgicalDayName`.
 *
 * EF celebrations come straight from the Divinum Officium engine: sanctoral days
 * carry the DO Latin title, temporal days fall back to `getLiturgicalDayName`.
 * DO has no descriptive prose, so EF cards show no description.
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
