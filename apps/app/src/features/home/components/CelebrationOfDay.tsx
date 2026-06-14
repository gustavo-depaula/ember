import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useYearCalendar } from '@/features/calendar'
import { localizeContent } from '@/lib/i18n'
import { getCelebrationsForDate, type ResolvedCelebration } from '@/lib/liturgical'
import { useFormularyDescription } from '@/lib/mass-of/useFormularyDescription'

function rankLabel(c: ResolvedCelebration, t: (key: string) => string): string {
  return t(`calendar.rank.${c.rank}`)
}

export function CelebrationOfDay({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const dateKey = format(date, 'yyyy-MM-dd')
  const { data: calendar } = useYearCalendar(date.getFullYear())
  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  const dayCalendar = useMemo(
    () => (calendar ? getCelebrationsForDate(calendar, date) : undefined),
    [calendar, dateKey],
  )

  const principal = dayCalendar?.principal
  // The "about this celebration" prose comes solely from the Mass formulary (the
  // same source the Mass renders); when it's absent the card simply omits it.
  const { data: description } = useFormularyDescription(principal?.entry.id)

  if (!dayCalendar?.principal || !principal) return null

  const { celebrations } = dayCalendar
  const others = celebrations.filter((c) => c !== principal).slice(0, 3)
  const blurb = description ? localizeContent(description) : undefined

  return (
    <AnimatedPressable
      onPress={() => router.push('/calendar')}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.viewCalendar')}
    >
      <YStack gap="$sm" paddingHorizontal="$lg" paddingVertical="$md">
        <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
          {t('home.celebrationOfDay')}
        </Text>

        <YStack gap={2}>
          <XStack gap="$sm" alignItems="center">
            <Text fontFamily="$heading" fontSize="$3" color="$color" flexShrink={1}>
              {localizeContent(principal.entry.name)}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$accent" letterSpacing={1}>
              {rankLabel(principal, t).toUpperCase()}
            </Text>
          </XStack>
          {blurb && (
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" numberOfLines={3}>
              {blurb}
            </Text>
          )}
          {principal.entry.holyDayOfObligation && (
            <Text fontFamily="$body" fontSize="$1" color="$accent">
              {t('calendar.holyDay')}
            </Text>
          )}
        </YStack>

        {others.map((c) => (
          <XStack key={c.entry.id} gap="$sm" alignItems="center" opacity={0.7}>
            <Text fontSize="$1" color="$colorSecondary">
              •
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
              {localizeContent(c.entry.name)}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" letterSpacing={0.5}>
              {rankLabel(c, t)}
            </Text>
          </XStack>
        ))}
      </YStack>
    </AnimatedPressable>
  )
}
