import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { HeaderFlourish } from '@/components'
import { liturgicalSubThemes } from '@/config/themes'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { getLiturgicalDayName, getLiturgicalSeason } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function LiturgicalHeader({ date }: { date: Date }) {
  const { t } = useTranslation()
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const season = getLiturgicalSeason(date, liturgicalCalendar)
  const dayName = getLiturgicalDayName(date, liturgicalCalendar)
  const seasonColor = liturgicalSubThemes[season]?.accent ?? liturgicalSubThemes.ordinary.accent

  return (
    <YStack gap="$xs" alignItems="center">
      <HeaderFlourish />

      <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
        {dayName}
      </Text>

      <Text fontFamily="$script" fontSize="$4" color="$colorSecondary">
        {formatLocalized(date, 'MMMM d')}
      </Text>

      <Text fontFamily="$body" fontSize="$1" color={seasonColor}>
        {t(`home.season.${season}`)}
      </Text>
    </YStack>
  )
}
