import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useThemeName, View, YStack } from 'tamagui'

import { formatLocalized } from '@/lib/i18n/dateLocale'
import {
  getLiturgicalColor,
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type LiturgicalColor,
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

const vestmentHex: Record<LiturgicalColor, string> = {
  violet: '#6b4a9b',
  white: '#e8dfc6',
  green: '#5c8a3a',
  red: '#b8373c',
  rose: '#c77e95',
}

export function LiturgicalHeader({
  date,
  season,
  rose,
}: {
  date: Date
  season: LiturgicalSeason
  rose?: boolean
}) {
  const { t } = useTranslation()
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const dayName = getLiturgicalDayName(date, liturgicalCalendar, {
    t: (k, o) => t(k, o) as string,
  })

  const seasonDisplay = t(`home.seasonName.${season}`)

  // Strip the season name from the end of the day name, then trim any trailing
  // connector words so the prefix doesn't end on a dangling preposition
  // (e.g. "...Second Week of Easter" → "...Second Week", "...Semana da Páscoa" → "...Semana").
  const prefix = useMemo(() => {
    let stripped = dayName
    const grammatical = seasonKeys
      .map((key) => t(`home.liturgicalDay.seasons.${key}`) as string)
      .sort((a, b) => b.length - a.length)
    for (const s of grammatical) {
      if (stripped.endsWith(s)) {
        stripped = stripped.slice(0, -s.length).trimEnd()
        break
      }
    }
    if (stripped === dayName && dayName.endsWith(seasonDisplay)) {
      stripped = dayName.slice(0, -seasonDisplay.length).trimEnd()
    }
    return stripped.replace(/\s+(of|the|da|de|do|dos|das|du|del|della|dello)$/i, '')
  }, [dayName, seasonDisplay, t])

  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')
  const vestment: LiturgicalColor = rose ? 'rose' : getLiturgicalColor(season)
  const vestmentColor = vestmentHex[vestment]

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
        maxWidth={isDark ? '60%' : '45%'}
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
        backgroundColor={vestmentColor}
        opacity={isDark ? 0.85 : 0.75}
        marginTop="$xs"
      />
    </YStack>
  )
}
