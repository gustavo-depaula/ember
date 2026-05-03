import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useThemeName, View, YStack } from 'tamagui'

import {
  getLiturgicalColor,
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type LiturgicalColor,
  type LiturgicalSeason,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { DateScrubber } from './DateScrubber'

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
  today,
  onSelectDate,
}: {
  date: Date
  season: LiturgicalSeason
  rose?: boolean
  today: string
  onSelectDate: (date: string) => void
}) {
  const { t } = useTranslation()
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const dayName = getLiturgicalDayName(date, liturgicalCalendar, {
    t: (k, o) => t(k, o) as string,
  })

  const seasonDisplay = t(`home.seasonName.${season}`)

  // Strip just the season name from the end of the day name, keeping any
  // trailing connector ("da", "of", etc.) so the prefix flows visually into
  // the season title below (e.g. "Quinta-Feira da Oitava da" → "Páscoa").
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
    return stripped
  }, [dayName, seasonDisplay, t])

  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')
  const vestment: LiturgicalColor = rose ? 'rose' : getLiturgicalColor(season)
  const vestmentColor = vestmentHex[vestment]

  const router = useRouter()

  return (
    <YStack gap="$xs" alignItems="center">
      <View paddingTop="$sm" width="100%">
        <DateScrubber today={today} onSelectDate={onSelectDate} />
      </View>

      <Text
        fontFamily="$heading"
        fontSize="$3"
        color="$color"
        textAlign="center"
        maxWidth={isDark ? '60%' : '45%'}
      >
        {prefix}
      </Text>

      <Pressable
        onPress={() => router.push('/calendar')}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.viewCalendar')}
        hitSlop={8}
      >
        <Text fontFamily="$display" fontSize={'$6' as any} color="$accent" paddingVertical="$sm">
          {seasonDisplay}
        </Text>
      </Pressable>

      <Text
        fontFamily="$body"
        fontSize="$2"
        color="$accent"
        textAlign="center"
        fontStyle="italic"
        paddingHorizontal="$lg"
      >
        {t(`home.seasonDescription.${season}`)}
      </Text>

      <View
        width={40}
        height={3}
        borderRadius={2}
        backgroundColor={vestmentColor}
        opacity={isDark ? 0.85 : 0.75}
        marginTop="$sm"
      />
    </YStack>
  )
}
