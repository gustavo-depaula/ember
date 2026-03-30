import { differenceInCalendarDays, format } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { useUpcomingCelebration } from '@/features/calendar'
import { localizeContent } from '@/lib/i18n'
import type { LiturgicalSeason } from '@/lib/liturgical'
import { normalizeDate } from '@/lib/liturgical'

export function SeasonalContext({ date, season }: { date: Date; season: LiturgicalSeason }) {
  const { t } = useTranslation()
  const upcoming = useUpcomingCelebration(14)
  const dateKey = format(date, 'yyyy-MM-dd')

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  const daysUntil = useMemo(() => {
    if (!upcoming) return undefined
    return differenceInCalendarDays(normalizeDate(upcoming.date), normalizeDate(date))
  }, [upcoming, dateKey])

  const feastName = upcoming ? localizeContent(upcoming.entry.name) : undefined

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

      {feastName && daysUntil && daysUntil > 0 && (
        <Text fontFamily="$body" fontSize="$1" color="$accent" textAlign="center">
          {daysUntil === 1
            ? t('home.tomorrow', { feast: feastName })
            : t('home.daysUntil', { count: daysUntil, feast: feastName })}
        </Text>
      )}
    </YStack>
  )
}
