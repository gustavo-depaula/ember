import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { useToday } from '@/hooks/useToday'
import i18n from '@/lib/i18n'
import { getLiturgicalSeason, type LiturgicalCalendarForm } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * The daily masthead — `WEEKDAY · SEASON` over the date in the manuscript hand.
 * An almanac front page, deliberately distinct from the utility `PageHeader` the
 * other tabs wear: Explore announces *today in the Church*, not just its name.
 */
export function AlmanacMasthead() {
  const { t } = useTranslation()
  const today = useToday()
  const form = usePreferencesStore((s) => s.liturgicalCalendar) as LiturgicalCalendarForm
  const season = getLiturgicalSeason(today, form)

  const lang = i18n.language || 'en-US'
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(today)
  const dateLine = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' }).format(today)
  const seasonLabel = t(`explore.season.${season}`)

  return (
    <YStack marginTop="$-md" marginBottom="$-sm" gap="$xs">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {weekday} · {seasonLabel}
      </Typography>
      <Typography variant="screen-title">{dateLine}</Typography>
    </YStack>
  )
}
