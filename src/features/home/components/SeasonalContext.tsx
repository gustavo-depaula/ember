import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import {
  computeEaster,
  getAshWednesday,
  getFirstSundayOfAdvent,
  type LiturgicalSeason,
  normalizeDate,
} from '@/lib/liturgical'

type UpcomingFeast = { key: string; daysUntil: number }

function getNextFeast(date: Date): UpcomingFeast | undefined {
  const d = normalizeDate(date)
  const year = d.getFullYear()
  const easter = computeEaster(year)
  const easterNext = computeEaster(year + 1)

  const feasts = [
    { key: 'christmas', date: new Date(year, 11, 25) },
    { key: 'easter', date: easter },
    { key: 'ashWednesday', date: getAshWednesday(year) },
    { key: 'pentecost', date: addDays(easter, 49) },
    { key: 'advent', date: getFirstSundayOfAdvent(year) },
    { key: 'christmas', date: new Date(year + 1, 11, 25) },
    { key: 'easter', date: easterNext },
    { key: 'ashWednesday', date: getAshWednesday(year + 1) },
    { key: 'advent', date: getFirstSundayOfAdvent(year + 1) },
  ]

  let closest: UpcomingFeast | undefined
  for (const feast of feasts) {
    const days = differenceInCalendarDays(normalizeDate(feast.date), d)
    if (days > 0 && days <= 14) {
      if (!closest || days < closest.daysUntil) {
        closest = { key: feast.key, daysUntil: days }
      }
    }
  }

  return closest
}

export function SeasonalContext({ date, season }: { date: Date; season: LiturgicalSeason }) {
  const { t } = useTranslation()
  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day, not Date reference
  const upcoming = useMemo(() => getNextFeast(date), [format(date, 'yyyy-MM-dd')])

  return (
    <YStack alignItems="center" gap="$xs" paddingHorizontal="$lg">
      <Text
        fontFamily="$body"
        fontSize="$2"
        color="$colorSecondary"
        textAlign="center"
        fontStyle="italic"
      >
        {t(`home.seasonDescription.${season}`)}
      </Text>

      {upcoming && (
        <Text fontFamily="$body" fontSize="$1" color="$accent" textAlign="center">
          {upcoming.daysUntil === 1
            ? t('home.tomorrow', { feast: t(`home.feastName.${upcoming.key}`) })
            : t('home.daysUntil', {
                count: upcoming.daysUntil,
                feast: t(`home.feastName.${upcoming.key}`),
              })}
        </Text>
      )}
    </YStack>
  )
}
