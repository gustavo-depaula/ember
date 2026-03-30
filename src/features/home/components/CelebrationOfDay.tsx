import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useTodayCelebration } from '@/features/calendar'
import { localizeContent } from '@/lib/i18n'
import type { ResolvedCelebration } from '@/lib/liturgical'

function rankLabel(c: ResolvedCelebration, t: (key: string) => string): string {
  return t(`calendar.rank.${c.rank}`)
}

function CelebrationRow({
  celebration,
  t,
}: {
  celebration: ResolvedCelebration
  t: (key: string) => string
}) {
  const name = localizeContent(celebration.entry.name)
  const description = localizeContent(celebration.entry.description)

  return (
    <YStack gap={2}>
      <XStack gap="$sm" alignItems="center">
        <Text fontFamily="$heading" fontSize="$3" color="$color" flexShrink={1}>
          {name}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$accent" letterSpacing={1}>
          {rankLabel(celebration, t).toUpperCase()}
        </Text>
      </XStack>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
        {description}
      </Text>
      {celebration.entry.holyDayOfObligation && (
        <Text fontFamily="$body" fontSize="$1" color="$accent">
          {t('calendar.holyDay')}
        </Text>
      )}
    </YStack>
  )
}

export function CelebrationOfDay() {
  const { t } = useTranslation()
  const router = useRouter()
  const dayCalendar = useTodayCelebration()

  if (!dayCalendar?.principal) return null

  const { principal, celebrations } = dayCalendar
  const others = celebrations.filter((c) => c !== principal).slice(0, 3)

  return (
    <AnimatedPressable onPress={() => router.push('/calendar' as any)}>
      <YStack gap="$sm" paddingHorizontal="$md">
        <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
          {t('home.celebrationOfDay')}
        </Text>

        <CelebrationRow celebration={principal} t={t} />

        {others.map((c) => (
          <XStack key={c.entry.id} gap="$sm" alignItems="center" opacity={0.7}>
            <Text fontSize={10} color="$colorSecondary">
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
