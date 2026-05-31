import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import { useSaintOfDayReading } from '@/features/saints'

// Home-carousel card for the day's saint from Pictorial Lives of the Saints.
// Opens the `saint-of-the-day` practice (today's life + reflection). Distinct
// from the liturgical "Celebration of the Day" — this is the book's fixed
// day-by-day saint. Text-only, matching the other carousel cards.
export function SaintOfDayCard() {
  const { t } = useTranslation()
  const router = useRouter()
  const reading = useSaintOfDayReading()

  if (!reading) return null

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/pray/[practiceId]', params: { practiceId: 'saint-of-the-day' } })
      }
      accessibilityRole="link"
      accessibilityLabel={t('explore.saintOfDay')}
      hitSlop={6}
    >
      <YStack gap="$sm" paddingHorizontal="$lg" paddingVertical="$md">
        <Typography variant="marker" textAlign="left" fontSize="$1" letterSpacing={2.5}>
          {t('explore.saintOfDay')}
        </Typography>
        <Typography variant="whisper" color="$color" fontSize="$3" maxWidth={420}>
          {reading.name}
        </Typography>
        <Typography variant="whisper" fontSize="$2" maxWidth={520} numberOfLines={3}>
          {t('explore.saintReadingTagline')}
        </Typography>
      </YStack>
    </Pressable>
  )
}
