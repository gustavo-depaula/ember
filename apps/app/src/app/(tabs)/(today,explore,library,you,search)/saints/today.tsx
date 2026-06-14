import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Separator, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { useYearCalendar } from '@/features/calendar'
import { useSaintOfDay } from '@/features/explore'
import { useSaintOfDayReading } from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { getCelebrationsForDate } from '@/lib/liturgical'
import { useFormularyDescription } from '@/lib/mass-of/useFormularyDescription'

// Celebration-of-the-Day "story" — the destination of the Explore featured
// block. Shows the day's principal liturgical celebration plus any other
// celebrations that share the date, each with its name, rank, and the Mass
// formulary's liturgical description.
export default function CelebrationOfDayScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const saint = useSaintOfDay()
  const { data: calendar } = useYearCalendar(today.getFullYear())
  const { data: formularyDescription } = useFormularyDescription(saint?.celebration.entry.id)
  const reading = useSaintOfDayReading()

  const back = (
    <AnimatedPressable
      onPress={() => router.back()}
      accessibilityRole="link"
      accessibilityLabel={t('common.back', { defaultValue: 'Back' })}
    >
      <Typography variant="reference">‹ {t('common.back', { defaultValue: 'Back' })}</Typography>
    </AnimatedPressable>
  )

  if (!saint) {
    return (
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          {back}
          <Typography variant="sacred-title">{t('explore.celebrationOfDay')}</Typography>
        </YStack>
      </ScreenLayout>
    )
  }

  const entry = saint.celebration.entry
  const name = localizeContent(entry.name)
  // The "about this celebration" prose comes solely from the Mass formulary (the
  // same source the Mass shows); when it's absent we simply show no description.
  const description = formularyDescription ? localizeContent(formularyDescription) : ''

  // Other celebrations sharing today's date (the principal is rendered above).
  const others = calendar
    ? (getCelebrationsForDate(calendar, today)?.celebrations ?? []).filter(
        (c) => c.entry.id !== entry.id,
      )
    : []

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        {back}

        <YStack gap="$xs">
          <Typography
            variant="label"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing={1.5}
          >
            {t('explore.celebrationOfDay')}
          </Typography>
          <Typography variant="sacred-title" fontSize={32} lineHeight={38}>
            {name}
          </Typography>
          <Typography variant="reference" textAlign="center" textTransform="uppercase">
            {t(`calendar.rank.${saint.celebration.rank}`)}
          </Typography>
        </YStack>

        {description && (
          <Typography
            variant="whisper"
            textAlign="center"
            fontSize="$3"
            maxWidth={520}
            alignSelf="center"
          >
            {description}
          </Typography>
        )}

        <YStack gap="$sm" alignSelf="center" alignItems="center">
          <AnimatedPressable
            onPress={() =>
              router.push({ pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } })
            }
            accessibilityRole="link"
            accessibilityLabel={t('explore.todaysMass', { defaultValue: "Today's Mass" })}
          >
            <Typography variant="reference" color="$accent" textTransform="uppercase">
              {t('explore.todaysMass', { defaultValue: "Today's Mass" })} ›
            </Typography>
          </AnimatedPressable>
          {reading && (
            <AnimatedPressable
              onPress={() =>
                router.push({
                  pathname: '/pray/[practiceId]',
                  params: { practiceId: 'saint-of-the-day' },
                })
              }
              accessibilityRole="link"
              accessibilityLabel={t('explore.readFullLife', { defaultValue: 'Read the full life' })}
            >
              <Typography variant="reference" color="$accent" textTransform="uppercase">
                {t('explore.readFullLife', { defaultValue: 'Read the full life' })} ›
              </Typography>
            </AnimatedPressable>
          )}
        </YStack>

        {others.length > 0 && (
          <YStack gap="$md" alignSelf="center" maxWidth={520} width="100%">
            <Separator />
            <Typography
              variant="label"
              textAlign="center"
              textTransform="uppercase"
              letterSpacing={1.5}
            >
              {t('explore.alsoToday', { defaultValue: 'Also today' })}
            </Typography>
            {others.map((c) => (
              <YStack key={c.entry.id} gap="$xs">
                <Typography variant="sacred-title" fontSize={22} lineHeight={28}>
                  {localizeContent(c.entry.name)}
                </Typography>
                <Typography variant="reference" textTransform="uppercase">
                  {t(`calendar.rank.${c.rank}`)}
                </Typography>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
