import { useTranslation } from 'react-i18next'

import { localizeContent } from '@/lib/i18n'
import { getLiturgicalDayName, type ResolvedCelebration } from '@/lib/liturgical'
import { useMassFormulary } from '@/lib/mass-of/useMassFormulary'

/**
 * A celebration's display name and description.
 *
 * Sanctoral celebrations carry their title from the calendar statics; temporal
 * ones don't, so their name (and "about this celebration" prose) comes from the
 * Mass formulary, falling back to `getLiturgicalDayName`.
 */
export function useCelebrationDisplay(celebration: ResolvedCelebration | undefined): {
  name: string
  description: string
} {
  const { t } = useTranslation()
  const { data: formulary } = useMassFormulary(celebration?.entry.id)

  if (!celebration) return { name: '', description: '' }

  const name =
    localizeContent(celebration.entry.name) ||
    (formulary?.title ? localizeContent(formulary.title) : '') ||
    getLiturgicalDayName(celebration.date, 'of', { t: (k, o) => t(k, o) as string })

  const description = formulary?.description
    ? localizeContent(formulary.description)
    : localizeContent(celebration.entry.description)

  return { name, description }
}
