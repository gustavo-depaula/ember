import { useRouter } from 'expo-router'
import { BookOpen } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useTodayCelebration } from '@/features/calendar/hooks'
import { localizeContent } from '@/lib/i18n'
import { useProperForSlot } from '@/lib/mass-propers/hook'

export function GospelOfTheDay() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { data: gospel, isLoading } = useProperForSlot('gospel', 'of')
  const dayCalendar = useTodayCelebration()

  if (isLoading || !gospel) return null

  const celebrationName = dayCalendar?.principal
    ? localizeContent(dayCalendar.principal.entry.name)
    : undefined

  const preview =
    gospel.text.primary.length > 180
      ? `${gospel.text.primary.slice(0, 180)}...`
      : gospel.text.primary

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/pray/[practiceId]',
          params: { practiceId: 'gospel-of-the-day' },
        })
      }
    >
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$sm"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack gap="$sm" alignItems="center">
          <YStack
            width={32}
            height={32}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$accentSubtle"
            borderRadius="$md"
          >
            <BookOpen size={18} color={theme.accent.val} />
          </YStack>
          <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
            {t('bible.discovery.gospelOfTheDay').toUpperCase()}
          </Text>
        </XStack>

        {celebrationName && (
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {celebrationName}
          </Text>
        )}

        {gospel.citation && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
            {gospel.citation}
          </Text>
        )}

        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" numberOfLines={3}>
          {preview}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
