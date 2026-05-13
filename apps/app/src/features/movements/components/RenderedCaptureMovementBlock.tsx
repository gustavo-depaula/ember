import { Check, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput } from '@/components'
import type { Cadence, MovementKind } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useOfferThanksgiving, useRaiseIntention } from '../hooks'

import { CadenceToggle } from './CadenceToggle'

export function RenderedCaptureMovementBlock({
  kind,
  prompt,
  multi,
  optional,
  defaultCadence,
}: {
  kind: MovementKind
  prompt: string
  multi: boolean
  optional: boolean
  defaultCadence?: Cadence
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>(defaultCadence ?? 'perpetual')
  const [captured, setCaptured] = useState<string[]>([])
  const [skipped, setSkipped] = useState(false)

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
    if (kind === 'intention') setCadence(defaultCadence ?? 'perpetual')
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
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {prompt}
      </Text>

      {captured.length > 0 ? (
        <YStack gap="$xs">
          {captured.map((c) => (
            <XStack key={c} alignItems="center" gap="$xs">
              <Check size={12} color={theme.accent?.val} />
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                {c}
              </Text>
            </XStack>
          ))}
        </YStack>
      ) : undefined}

      {!skipped && (multi || captured.length === 0) ? (
        <>
          <PrayerTextInput
            value={text}
            onChangeText={setText}
            placeholder={
              kind === 'intention'
                ? t('movements.capture.intentionPlaceholder')
                : t('movements.capture.thanksgivingPlaceholder')
            }
          />

          {kind === 'intention' ? (
            <CadenceToggle value={cadence} onChange={setCadence} />
          ) : undefined}

          <XStack gap="$sm">
            {optional ? (
              <AnimatedPressable
                onPress={() => setSkipped(true)}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.skip')}
              >
                <XStack
                  justifyContent="center"
                  paddingVertical="$sm"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={1}>
                    {t('common.skip')}
                  </Text>
                </XStack>
              </AnimatedPressable>
            ) : undefined}
            <AnimatedPressable
              onPress={submit}
              disabled={!text.trim() || submitting}
              style={{ flex: 1, opacity: text.trim() ? 1 : 0.5 }}
              accessibilityRole="button"
              accessibilityLabel={
                kind === 'intention' ? t('movements.capture.raise') : t('movements.capture.offer')
              }
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
                  {kind === 'intention'
                    ? t('movements.capture.raise')
                    : t('movements.capture.offer')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </>
      ) : undefined}
    </YStack>
  )
}
