import { useTranslation } from 'react-i18next'
import { Text, View, YStack } from 'tamagui'

import { HeaderFlourish, SeasonalIcon } from '@/components'
import type { LiturgicalThemeName } from '@/hooks/useLiturgicalTheme'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import {
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type LiturgicalSeason,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function LiturgicalHeader({
  date,
  season,
  themeName,
}: {
  date: Date
  season: LiturgicalSeason
  themeName: LiturgicalThemeName
}) {
  const { t } = useTranslation()
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const dayName = getLiturgicalDayName(date, liturgicalCalendar)

  return (
    <YStack gap="$xs" alignItems="center">
      <HeaderFlourish />

      <SeasonalIcon season={themeName} size={28} />

      <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
        {dayName}
      </Text>

      <Text fontFamily="$script" fontSize="$4" color="$colorSecondary">
        {formatLocalized(date, 'MMMM d')}
      </Text>

      <Text fontFamily="$body" fontSize="$1" color="$accent" letterSpacing={2}>
        {t(`home.season.${season}`).toUpperCase()}
      </Text>

      <View
        width={40}
        height={3}
        borderRadius={2}
        backgroundColor="$accent"
        opacity={0.7}
        marginTop="$xs"
      />
    </YStack>
  )
}
