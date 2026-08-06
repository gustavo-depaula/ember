import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { XStack, YStack } from 'tamagui'

import { PrayerTextInput, Typography } from '@/components'
import {
  FlowAction,
  FlowActionSeparator,
  FlowActions,
  FlowInteraction,
  FlowLine,
  InlineMarkdownRubric,
} from '@/components/prayer'
import type { ResolutionOutcome } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useCheckinResolution, useReviewResolution } from '../hooks'

type Mode = 'review' | 'checkin' | 'show'

/**
 * Yesterday's resolution, brought back for an honest word.
 *
 * `show` simply carries it into today's prayer; `review` / `checkin` ask for an
 * outcome. The prompt is a rubric — the instruction — and the resolution itself
 * is a carried line, so it sits in the same manuscript register as an offered
 * intention rather than inside a form card.
 */
export function RenderedReviewResolutionBlock({
  mode,
  resolution,
  prompt,
  outcomes,
  allowNotes,
}: {
  mode: Mode
  resolution?: { id: string; text: string; level: 'daily' }
  prompt?: string
  outcomes: ResolutionOutcome[]
  allowNotes: boolean
}) {
  const { t } = useTranslation()
  const [submittedOutcome, setSubmittedOutcome] = useState<ResolutionOutcome | undefined>()
  const [notes, setNotes] = useState('')

  const reviewMutation = useReviewResolution()
  const checkinMutation = useCheckinResolution()

  if (!resolution) {
    return null
  }

  async function submit(outcome: ResolutionOutcome) {
    if (!resolution || submittedOutcome) return
    lightTap()
    Keyboard.dismiss()
    const args = { resolutionId: resolution.id, outcome, notes: notes.trim() || undefined }
    // A failed write surfaces through the global mutation-error host; leave the
    // outcome unrecorded so the user can answer again.
    try {
      if (mode === 'review') await reviewMutation.mutateAsync(args)
      else if (mode === 'checkin') await checkinMutation.mutateAsync(args)
    } catch {
      return
    }
    successBuzz()
    setSubmittedOutcome(outcome)
  }

  const answered = mode === 'show' || submittedOutcome

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
      <FlowInteraction>
        {prompt ? (
          <Typography variant="rubric">
            <InlineMarkdownRubric source={prompt} />
          </Typography>
        ) : undefined}
        <FlowLine text={resolution.text} />

        {answered ? (
          submittedOutcome ? (
            <Animated.View entering={FadeIn.duration(260)}>
              <Typography variant="whisper" fontStyle="italic" color="$accent">
                {t(`resolutions.review.recorded.${submittedOutcome}`)}
              </Typography>
            </Animated.View>
          ) : null
        ) : (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(140)}
            layout={LinearTransition.duration(200)}
          >
            <YStack gap="$sm">
              <FlowActions>
                {outcomes.map((o, i) => (
                  <XStack key={o} alignItems="center" gap="$sm">
                    {i > 0 ? <FlowActionSeparator /> : undefined}
                    <FlowAction
                      label={t(`resolutions.review.outcome.${o}`)}
                      onPress={() => submit(o)}
                    />
                  </XStack>
                ))}
              </FlowActions>
              {allowNotes ? (
                <PrayerTextInput
                  size="sm"
                  fontSize={14}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('resolutions.review.notesPlaceholder')}
                />
              ) : undefined}
            </YStack>
          </Animated.View>
        )}
      </FlowInteraction>
    </Animated.View>
  )
}
