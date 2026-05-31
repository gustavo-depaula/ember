import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
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

// A quiet illuminated line under the centerpiece — today's resolution prefixed
// by a fleuron, plus the de-boxed kept/partial/broken affordances. No surface
// box, no collapse chrome.
export function ResolutionsPanel() {
  const { t } = useTranslation()

  const today = useActiveResolution('daily')
  const slots = useSlots()
  const next = nextReviewDate(slots, new Date())

  return (
    <YStack gap="$sm">
      {today ? (
        <TodayLine resolution={today} />
      ) : (
        <XStack gap="$sm" alignItems="baseline">
          <Typography color="$accent">⟢</Typography>
          <Typography tone="muted" fontStyle="italic" flex={1}>
            {t('resolutions.panel.todayEmpty')}
          </Typography>
        </XStack>
      )}

      {next ? (
        <Typography variant="caption">
          {t('resolutions.panel.nextReview', {
            practice: practiceLabel(next.practiceId),
            date: next.date.toLocaleString(),
          })}
        </Typography>
      ) : undefined}
    </YStack>
  )
}

function TodayLine({ resolution }: { resolution: Resolution }) {
  const { t } = useTranslation()
  const reviews = useResolutionReviews(resolution.id)
  const progress = resolutionProgress(resolution, reviews)
  const checkinMutation = useCheckinResolution()

  return (
    <YStack gap="$xs">
      <XStack gap="$sm" alignItems="baseline">
        <Typography color="$accent">⟢</Typography>
        <Typography flex={1}>{resolution.text}</Typography>
      </XStack>
      <XStack gap="$lg" paddingLeft="$lg">
        {(['kept', 'partial', 'broken'] as const).map((o) => (
          <AnimatedPressable
            key={o}
            onPress={() => {
              lightTap()
              checkinMutation.mutate({ resolutionId: resolution.id, outcome: o })
            }}
            accessibilityRole="button"
            accessibilityLabel={t(`resolutions.review.outcome.${o}`)}
          >
            <Typography variant="label" fontSize="$1" tone="muted">
              {t(`resolutions.review.outcome.${o}`)}
            </Typography>
          </AnimatedPressable>
        ))}
      </XStack>
      <Typography variant="caption" paddingLeft="$lg">
        {progress.label}
      </Typography>
    </YStack>
  )
}
