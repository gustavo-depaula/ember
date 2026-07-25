import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Cadence, Movement } from '@/db/events'
import { QuietInput } from '@/features/library/CreateCollectionSheet'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useUpdateIntention, useUpdateThanksgiving } from '../hooks'

import { BoundedUntilPicker, defaultBoundedUntil } from './BoundedUntilPicker'
import { CadenceToggle } from './CadenceToggle'

/**
 * Amend something already on the Altar — fix the wording, change how long you
 * mean to carry it, push a term out. Intentions get the full cadence controls;
 * a thanksgiving is only ever its text.
 */
export function MovementEditSheet({
  movement,
  visible,
  onClose,
}: {
  movement: Movement | undefined
  visible: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>('perpetual')
  const [boundedUntil, setBoundedUntil] = useState<Date>(defaultBoundedUntil)

  const updateIntention = useUpdateIntention()
  const updateThanksgiving = useUpdateThanksgiving()
  const submitting = updateIntention.isPending || updateThanksgiving.isPending

  // Seed from the movement each time the sheet opens, so a cancelled edit never
  // leaks into the next one.
  useEffect(() => {
    if (!visible || !movement) return
    setText(movement.text)
    setCadence(movement.cadence ?? 'perpetual')
    setBoundedUntil(
      movement.bounded_until ? new Date(movement.bounded_until) : defaultBoundedUntil(),
    )
  }, [visible, movement])

  if (!movement) return null

  const isIntention = movement.kind === 'intention'

  async function save() {
    if (!movement) return
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    lightTap()
    Keyboard.dismiss()
    // The global mutation-error host reports a failed write; keep the sheet open
    // with the user's edit intact so they can retry.
    try {
      if (isIntention) {
        await updateIntention.mutateAsync({
          id: movement.id,
          text: trimmed,
          cadence,
          bounded_until: cadence === 'bounded' ? boundedUntil.getTime() : null,
        })
      } else {
        await updateThanksgiving.mutateAsync({ id: movement.id, text: trimmed })
      }
    } catch {
      return
    }
    successBuzz()
    onClose()
  }

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$lg">
        <Typography variant="sacred-title" textAlign="left">
          {t('movements.edit.title')}
        </Typography>

        <QuietInput
          value={text}
          onChangeText={setText}
          placeholder={t('movements.capture.intentionPlaceholder')}
          fontFamily="$body"
          fontSize="$4"
          autoFocus
          onSubmitEditing={save}
          returnKeyType="done"
        />

        {isIntention ? <CadenceToggle value={cadence} onChange={setCadence} /> : undefined}

        {isIntention && cadence === 'bounded' ? (
          <BoundedUntilPicker value={boundedUntil} onChange={setBoundedUntil} />
        ) : undefined}

        <AnimatedPressable
          onPress={save}
          disabled={!text.trim() || submitting}
          accessibilityRole="button"
          accessibilityLabel={t('common.save')}
        >
          <XStack
            justifyContent="center"
            paddingVertical="$md"
            borderRadius="$md"
            backgroundColor="$accent"
            opacity={!text.trim() || submitting ? 0.5 : 1}
          >
            <Typography variant="label" fontSize="$3" color="$background">
              {t('common.save')}
            </Typography>
          </XStack>
        </AnimatedPressable>
      </YStack>
    </BottomSheet>
  )
}
