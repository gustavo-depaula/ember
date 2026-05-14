import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, SectionDivider } from '@/components'
import { getManifest } from '@/content/resolver'
import type { Resolution } from '@/db/events'
import {
  useActiveResolution,
  useCheckinResolution,
  useResolutionReviews,
} from '@/features/resolutions'
import { resolutionProgress } from '@/features/resolutions/progress'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { useSlots } from '../hooks'
import { nextReviewDate } from '../next-review'

function practiceLabel(practiceId: string): string {
  const m = getManifest(practiceId)
  return m ? localizeContent(m.name) : practiceId
}

export function ResolutionsPanel() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [open, setOpen] = useState(true)

  const today = useActiveResolution('daily')
  const slots = useSlots()
  const next = nextReviewDate(slots, new Date())

  return (
    <YStack
      gap="$sm"
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundSurface"
    >
      <Pressable
        onPress={() => {
          lightTap()
          setOpen((v) => !v)
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <XStack alignItems="center" gap="$sm" paddingVertical="$xs">
          {open ? (
            <ChevronDown size={16} color={theme.color?.val} />
          ) : (
            <ChevronRight size={16} color={theme.color?.val} />
          )}
          <Sparkles size={14} color={theme.accent?.val} />
          <Text fontFamily="$heading" fontSize="$3" color="$color" letterSpacing={0.5}>
            {t('resolutions.panel.title')}
          </Text>
        </XStack>
      </Pressable>

      {open ? (
        <YStack gap="$md">
          <YStack gap="$xs">
            <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
              {t('resolutions.panel.todayHeading').toUpperCase()}
            </Text>
            {today ? (
              <TodayCard resolution={today} />
            ) : (
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                {t('resolutions.panel.todayEmpty')}
              </Text>
            )}
          </YStack>

          {next ? (
            <>
              <SectionDivider />
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {t('resolutions.panel.nextReview', {
                  practice: practiceLabel(next.practiceId),
                  date: next.date.toLocaleString(),
                })}
              </Text>
            </>
          ) : undefined}
        </YStack>
      ) : undefined}
    </YStack>
  )
}

function TodayCard({ resolution }: { resolution: Resolution }) {
  const { t } = useTranslation()
  const reviews = useResolutionReviews(resolution.id)
  const progress = resolutionProgress(resolution, reviews)
  const checkinMutation = useCheckinResolution()

  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$3" color="$color">
        {resolution.text}
      </Text>
      <XStack gap="$xs">
        {(['kept', 'partial', 'broken'] as const).map((o) => (
          <AnimatedPressable
            key={o}
            onPress={() => {
              lightTap()
              checkinMutation.mutate({ resolutionId: resolution.id, outcome: o })
            }}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel={t(`resolutions.review.outcome.${o}`)}
          >
            <XStack
              justifyContent="center"
              paddingVertical="$xs"
              borderRadius="$sm"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t(`resolutions.review.outcome.${o}`)}
              </Text>
            </XStack>
          </AnimatedPressable>
        ))}
      </XStack>
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
        {progress.label}
      </Text>
    </YStack>
  )
}
