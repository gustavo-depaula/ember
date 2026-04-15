import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, YStack } from 'tamagui'

import { formatLocalized } from '@/lib/i18n/dateLocale'
import {
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type LiturgicalSeason,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

const seasonKeys = [
  'advent',
  'lent',
  'easter',
  'ordinaryTime',
  'epiphany',
  'septuagesima',
  'postPentecost',
] as const

export function LiturgicalHeader({ date, season }: { date: Date; season: LiturgicalSeason }) {
  const { t } = useTranslation()
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const dayName = getLiturgicalDayName(date, liturgicalCalendar, {
    t: (k, o) => t(k, o) as string,
  })

  const seasonDisplay = t(`home.seasonName.${season}`)

  // Strip the bare season name from the end of the day name,
  // keeping the preposition (e.g. "da Páscoa" → strip "Páscoa", keep "da")
  const prefix = useMemo(() => {
    if (dayName.endsWith(seasonDisplay)) {
      return dayName.slice(0, -seasonDisplay.length).trimEnd()
    }
    // Try with the grammatical season form (includes preposition)
    for (const key of seasonKeys) {
      const s = t(`home.liturgicalDay.seasons.${key}`) as string
      if (dayName.endsWith(s)) {
        return dayName.slice(0, -s.length).trimEnd()
      }
    }
    return dayName
  }, [dayName, seasonDisplay, t])

  return (
    <YStack gap="$xs" alignItems="center">
      <Text fontFamily="$script" fontSize="$4" color="$colorSecondary" paddingTop="$sm">
        {formatLocalized(date, 'MMMM d').replace(/^\w/, (c) => c.toUpperCase())}
      </Text>

      <Text
        fontFamily="$heading"
        fontSize="$3"
        color="$color"
        textAlign="center"
        paddingHorizontal="$xxl"
      >
        {prefix}
      </Text>

      <Text fontFamily="$display" fontSize={'$6' as any} color="$accent" paddingVertical="$sm">
        {seasonDisplay}
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
