import { differenceInCalendarDays, format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useUpcomingCelebration } from '@/features/calendar'
import { localizeContent } from '@/lib/i18n'
import { normalizeDate } from '@/lib/liturgical'

export function SeasonalContext({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const upcoming = useUpcomingCelebration(14)
  const dateKey = format(date, 'yyyy-MM-dd')

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  const daysUntil = useMemo(() => {
    if (!upcoming) return undefined
    return differenceInCalendarDays(normalizeDate(upcoming.date), normalizeDate(date))
  }, [upcoming, dateKey])

  const feastName = upcoming ? localizeContent(upcoming.entry.name) : undefined

  if (!feastName || !daysUntil || daysUntil <= 0) return null

  return (
    <AnimatedPressable
      onPress={() => router.push('/calendar')}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.viewCalendar')}
    >
      <YStack alignItems="center" gap="$xs" paddingHorizontal="$lg">
        <Text fontFamily="$body" fontSize="$1" color="$accent" textAlign="center">
          {daysUntil === 1
            ? t('home.tomorrow', { feast: feastName })
            : t('home.daysUntil', { count: daysUntil, feast: feastName })}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
