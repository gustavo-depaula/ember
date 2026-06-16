import { differenceInCalendarDays, format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { InlineMarkdown } from '@/components/prayer'
import { useCelebrationDisplay, useUpcomingCelebration } from '@/features/calendar'
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

  const { name: feastName, description } = useCelebrationDisplay(upcoming)

  if (!feastName || !daysUntil || daysUntil <= 0) return null

  const when =
    daysUntil === 1 ? t('home.upcomingTomorrow') : t('home.upcomingInDays', { count: daysUntil })

  return (
    <AnimatedPressable
      onPress={() => router.push('/calendar')}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.viewCalendar')}
    >
      <YStack gap="$sm" paddingHorizontal="$lg" paddingVertical="$md">
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={2.5}
          textTransform="uppercase"
        >
          {t('home.upcomingLabel')}
        </Text>
        <Text fontFamily="$body" fontSize="$3" color="$color" fontStyle="italic" maxWidth={420}>
          {feastName}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {when}
        </Text>
        {description && (
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$colorSecondary"
            maxWidth={520}
            numberOfLines={3}
          >
            <InlineMarkdown source={description} />
          </Text>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
