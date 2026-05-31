import { useRouter } from 'expo-router'
import { ChevronRight, Target } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import type { Resolution, ResolutionReview } from '@/db/events'
import { useEventStore } from '@/db/events'
import { useActiveResolutions } from '@/features/resolutions'
import { lightTap } from '@/lib/haptics'

function latestOutcome(reviews: ResolutionReview[] | undefined) {
  if (!reviews?.length) return undefined
  return [...reviews]
    .filter((r) => r.kind === 'checkin' || r.kind === 'review')
    .sort((a, b) => b.reviewed_at - a.reviewed_at)[0]?.outcome
}

// The day's resolutions on Today, as one more "part of day" — a tracked-caps
// header with a kept/total count and hairline, then tight rows in the same hand
// as the morning/afternoon/evening blocks. Tapping a row opens the Altar's
// Resolução tab, where the kept/partial/broken check-in lives.
export function ResolutionLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const resolutions = useActiveResolutions('daily')
  const reviewsMap = useEventStore((s) => s.resolutionReviews)

  if (resolutions.length === 0) return null

  const keptCount = resolutions.filter(
    (r: Resolution) => latestOutcome(reviewsMap.get(r.id)) === 'kept',
  ).length

  return (
    <YStack gap="$sm" paddingTop="$md">
      <YStack
        paddingHorizontal="$xs"
        paddingBottom="$xs"
        borderBottomWidth={0.5}
        borderBottomColor="$accentSubtle"
      >
        <XStack justifyContent="space-between" alignItems="baseline">
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$colorSecondary"
            letterSpacing={3}
            textTransform="uppercase"
          >
            {t('altar.resolutions')}
          </Text>
          <Typography tone="muted" fontSize="$1">
            {keptCount}/{resolutions.length}
          </Typography>
        </XStack>
      </YStack>

      <YStack gap="$xs">
        {resolutions.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => {
              lightTap()
              router.push({ pathname: '/altar', params: { tab: 'resolution' } })
            }}
            accessibilityRole="button"
            accessibilityLabel={t('home.resolutionTap', { text: r.text })}
          >
            <XStack paddingVertical="$xs" paddingHorizontal="$xs" alignItems="center" gap="$sm">
              <Target size={18} color={theme.accent?.val} />
              <Text fontFamily="$body" fontSize="$4" color="$color" flex={1} numberOfLines={2}>
                {r.text}
              </Text>
              <ChevronRight size={16} color={theme.accentSubtle?.val} />
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </YStack>
  )
}
