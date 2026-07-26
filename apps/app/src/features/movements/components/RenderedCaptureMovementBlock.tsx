import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { YStack } from 'tamagui'

import { PrayerTextInput, Typography } from '@/components'
import {
  FlowAction,
  FlowActionSeparator,
  FlowActions,
  FlowInteraction,
  FlowLine,
} from '@/components/prayer'
import type { Cadence, MovementKind } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useOfferThanksgiving, useRaiseIntention } from '../hooks'

import { BoundedUntilPicker, defaultBoundedUntil } from './BoundedUntilPicker'
import { CadenceToggle } from './CadenceToggle'

/**
 * Inline capture inside a flow ("Anything new this morning?").
 *
 * The prompt is a rubric — an instruction to the one praying, not words to be
 * prayed — so it takes the missal's red ink. What has been captured this sitting
 * reads back as ordinary carried lines.
 *
 * Form opens only on an explicit tap. Auto-opening is hostile — the user sees a
 * textarea they didn't ask for and wonders what to type.
 */
export function RenderedCaptureMovementBlock({
  kind,
  prompt,
  multi,
  defaultCadence,
}: {
  kind: MovementKind
  prompt: string
  multi: boolean
  defaultCadence?: Cadence
}) {
  const { t } = useTranslation()

  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>(defaultCadence ?? 'perpetual')
  const [boundedUntil, setBoundedUntil] = useState<Date>(defaultBoundedUntil)
  const [captured, setCaptured] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

  const raiseIntention = useRaiseIntention()
  const offerThanksgiving = useOfferThanksgiving()
  const submitting = raiseIntention.isPending || offerThanksgiving.isPending

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    lightTap()
    Keyboard.dismiss()
    // A failed write already surfaces through the global mutation-error host;
    // bail without clearing so the user's words survive the retry.
    try {
      if (kind === 'intention') {
        await raiseIntention.mutateAsync({
          text: trimmed,
          cadence,
          bounded_until: cadence === 'bounded' ? boundedUntil.getTime() : undefined,
        })
      } else {
        await offerThanksgiving.mutateAsync({ text: trimmed })
      }
    } catch {
      return
    }
    successBuzz()
    setCaptured((prev) => [...prev, trimmed])
    reset()
  }

  function reset() {
    setText('')
    setCadence(defaultCadence ?? 'perpetual')
    setBoundedUntil(defaultBoundedUntil())
    setAdding(false)
  }

  // Once at least one entry exists for a non-multi block, the user is "done"
  // and the action hides too.
  const canAddMore = multi || captured.length === 0
  const addLabel =
    kind === 'intention' ? t('movements.capture.raise') : t('movements.capture.offer')

  return (
    <FlowInteraction>
      <Typography variant="rubric">{prompt}</Typography>

      {captured.map((c) => (
        <Animated.View
          key={c}
          entering={FadeIn.duration(220)}
          layout={LinearTransition.duration(200)}
        >
          <FlowLine text={c} muted />
        </Animated.View>
      ))}

      {adding ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          layout={LinearTransition.duration(200)}
        >
          <YStack gap="$sm" paddingTop="$xs">
            <PrayerTextInput
              value={text}
              onChangeText={setText}
              placeholder={t(
                kind === 'intention'
                  ? 'movements.capture.intentionPlaceholder'
                  : 'movements.capture.thanksgivingPlaceholder',
              )}
              autoFocus
            />
            {kind === 'intention' ? (
              <CadenceToggle value={cadence} onChange={setCadence} />
            ) : undefined}
            {kind === 'intention' && cadence === 'bounded' ? (
              <BoundedUntilPicker value={boundedUntil} onChange={setBoundedUntil} />
            ) : undefined}
            <FlowActions>
              <FlowAction label={addLabel} onPress={submit} disabled={!text.trim() || submitting} />
              <FlowActionSeparator />
              <FlowAction
                label={t('common.cancel')}
                onPress={() => {
                  lightTap()
                  reset()
                }}
              />
            </FlowActions>
          </YStack>
        </Animated.View>
      ) : canAddMore ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
          <FlowActions>
            <FlowAction
              label={addLabel}
              onPress={() => {
                lightTap()
                setAdding(true)
              }}
            />
          </FlowActions>
        </Animated.View>
      ) : undefined}
    </FlowInteraction>
  )
}
