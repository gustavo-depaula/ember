import { Check, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput } from '@/components'
import type { Cadence, MovementKind } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useOfferThanksgiving, useRaiseIntention } from '../hooks'

import { CadenceToggle } from './CadenceToggle'

/**
 * Inline capture inside a flow ("Anything new this morning?").
 *
 * Form opens only on an explicit "+ Add" tap, mirroring the offering block.
 * Auto-opening on mount is hostile — the user sees a textarea they didn't
 * ask for and wonders what to type.
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
  const theme = useTheme()

  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>(defaultCadence ?? 'perpetual')
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
    if (kind === 'intention') {
      await raiseIntention.mutateAsync({ text: trimmed, cadence })
    } else {
      await offerThanksgiving.mutateAsync({ text: trimmed })
    }
    successBuzz()
    setCaptured((prev) => [...prev, trimmed])
    setText('')
    setCadence(defaultCadence ?? 'perpetual')
    setAdding(false)
  }

  function cancel() {
    lightTap()
    setText('')
    setCadence(defaultCadence ?? 'perpetual')
    setAdding(false)
  }

  // Once at least one entry exists for a non-multi block, the user is "done"
  // and the Add button hides too.
  const canAddMore = multi || captured.length === 0
  const addLabel =
    kind === 'intention' ? t('movements.capture.raise') : t('movements.capture.offer')

  return (
    <YStack
      gap="$md"
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundSurface"
    >
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {prompt}
      </Text>

      {captured.length > 0 ? (
        <YStack gap="$xs">
          {captured.map((c) => (
            <Animated.View
              key={c}
              entering={FadeIn.duration(220)}
              layout={LinearTransition.duration(200)}
            >
              <XStack alignItems="center" gap="$xs">
                <Check size={12} color={theme.accent?.val} />
                <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                  {c}
                </Text>
              </XStack>
            </Animated.View>
          ))}
        </YStack>
      ) : undefined}

      {adding ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          layout={LinearTransition.duration(200)}
        >
          <YStack gap="$sm">
            <PrayerTextInput
              value={text}
              onChangeText={setText}
              placeholder={
                kind === 'intention'
                  ? t('movements.capture.intentionPlaceholder')
                  : t('movements.capture.thanksgivingPlaceholder')
              }
              autoFocus
            />

            {kind === 'intention' ? (
              <CadenceToggle value={cadence} onChange={setCadence} />
            ) : undefined}

            <XStack gap="$sm">
              <AnimatedPressable
                onPress={cancel}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <XStack
                  justifyContent="center"
                  paddingVertical="$sm"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={1}>
                    {t('common.cancel')}
                  </Text>
                </XStack>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={submit}
                disabled={!text.trim() || submitting}
                style={{ flex: 1, opacity: text.trim() ? 1 : 0.5 }}
                accessibilityRole="button"
                accessibilityLabel={addLabel}
              >
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  gap="$xs"
                  paddingVertical="$sm"
                  borderRadius="$md"
                  backgroundColor="$accent"
                >
                  <Plus size={14} color="white" />
                  <Text fontFamily="$heading" fontSize="$2" color="white" letterSpacing={1}>
                    {addLabel}
                  </Text>
                </XStack>
              </AnimatedPressable>
            </XStack>
          </YStack>
        </Animated.View>
      ) : canAddMore ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
          <AnimatedPressable
            onPress={() => {
              lightTap()
              setAdding(true)
            }}
            accessibilityRole="button"
            accessibilityLabel={addLabel}
          >
            <XStack alignItems="center" gap="$xs" paddingVertical="$xs">
              <Plus size={14} color={theme.accent?.val} />
              <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
                {addLabel}
              </Text>
            </XStack>
          </AnimatedPressable>
        </Animated.View>
      ) : undefined}
    </YStack>
  )
}
