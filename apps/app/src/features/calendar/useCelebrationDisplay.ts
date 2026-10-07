import { descriptionOf } from '@ember/missal'
import { useTranslation } from 'react-i18next'

import { localizeContent } from '@/lib/i18n'
import { getLiturgicalDayName, type ResolvedCelebration } from '@/lib/liturgical'
import { useMassFormulary } from '@/lib/missal/useMassFormulary'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

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
  const transfers = useOfTransfers()
  const { data: formulary } = useMassFormulary(celebration?.entry.id)

  if (!celebration) return { name: '', description: '' }

  const name =
    localizeContent(celebration.entry.name) ||
    (formulary?.title ? localizeContent(formulary.title) : '') ||
    getLiturgicalDayName(celebration.date, 'of', { t: (k, o) => t(k, o) as string }, transfers)

  const note = {
    'en-US': descriptionOf(formulary ?? undefined, 'en-US'),
    'pt-BR': descriptionOf(formulary ?? undefined, 'pt-BR'),
    la: descriptionOf(formulary ?? undefined, 'la'),
  }
  const description = localizeContent(note) || localizeContent(celebration.entry.description)

  return { name, description }
}
