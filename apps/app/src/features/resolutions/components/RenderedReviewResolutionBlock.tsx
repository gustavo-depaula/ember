import { Check, CircleSlash, Minus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { ResolutionOutcome } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useCheckinResolution, useReviewResolution } from '../hooks'

type Mode = 'review' | 'checkin' | 'show'

const outcomeIcons: Record<ResolutionOutcome, typeof Check> = {
  kept: Check,
  partial: Minus,
  broken: CircleSlash,
}

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
  const theme = useTheme()
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
    if (mode === 'review') {
      await reviewMutation.mutateAsync({
        resolutionId: resolution.id,
        outcome,
        notes: notes.trim() || undefined,
      })
    } else if (mode === 'checkin') {
      await checkinMutation.mutateAsync({
        resolutionId: resolution.id,
        outcome,
        notes: notes.trim() || undefined,
      })
    }
    successBuzz()
    setSubmittedOutcome(outcome)
  }

  return (
    <YStack
      gap="$md"
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundSurface"
    >
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
          {t(`resolutions.scope.${resolution.level}`).toUpperCase()}
        </Text>
        <Text fontFamily="$body" fontSize="$3" color="$color">
          {resolution.text}
        </Text>
      </YStack>

      {mode === 'show' || submittedOutcome ? (
        submittedOutcome ? (
          <Text fontFamily="$body" fontSize="$2" color="$accent" fontStyle="italic">
            {t(`resolutions.review.recorded.${submittedOutcome}`)}
          </Text>
        ) : null
      ) : (
        <>
          {prompt ? (
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
              {prompt}
            </Text>
          ) : undefined}
          <XStack gap="$sm">
            {outcomes.map((o) => {
              const Icon = outcomeIcons[o]
              return (
                <AnimatedPressable
                  key={o}
                  onPress={() => submit(o)}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel={t(`resolutions.review.outcome.${o}`)}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="center"
                    gap="$xs"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$accent"
                  >
                    <Icon size={14} color={theme.accent?.val} />
                    <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
                      {t(`resolutions.review.outcome.${o}`)}
                    </Text>
                  </XStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
          {allowNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t('resolutions.review.notesPlaceholder')}
              placeholderTextColor={theme.colorSecondary?.val}
              multiline
              style={{
                fontFamily: 'EBGaramond_400Regular',
                fontSize: 14,
                color: theme.color?.val,
                minHeight: 48,
                maxHeight: 120,
                textAlignVertical: 'top',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.borderColor?.val,
                backgroundColor: theme.background?.val,
              }}
            />
          ) : undefined}
        </>
      )}
    </YStack>
  )
}
