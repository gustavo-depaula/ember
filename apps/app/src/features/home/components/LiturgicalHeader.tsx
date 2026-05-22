import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useThemeName, View, YStack } from 'tamagui'

import {
  getLiturgicalDayName,
  type LiturgicalCalendarForm,
  type LiturgicalSeason,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { DateScrubber } from './DateScrubber'

export function LiturgicalHeader({
  date,
  season,
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

  // Strip just the bare season noun from the end of the day name, keeping
  // any trailing connector ("da", "of", etc.) so the prefix flows visually
  // into the season title below (e.g. "Segunda-Feira da 2ª Semana da" →
  // "Páscoa", "4th Sunday of" → "Easter").
  const prefix = useMemo(() => {
    if (dayName.endsWith(seasonDisplay)) {
      return dayName.slice(0, -seasonDisplay.length).trimEnd()
    }
    return dayName
  }, [dayName, seasonDisplay])

  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')

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
    </YStack>
  )
}
