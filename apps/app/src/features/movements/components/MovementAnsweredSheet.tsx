import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput, Typography } from '@/components'
import type { Movement } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useMarkIntentionAnswered, useOfferThanksgiving } from '../hooks'

/**
 * A petition granted.
 *
 * Answering closes the intention either way — declining the thanksgiving must
 * never undo that, including when the sheet is dismissed by a swipe. What the
 * user writes here does double duty: it becomes the thanksgiving in their own
 * words, and it is kept as the answered note on the intention, so the closed
 * entry says *how* the prayer was answered instead of only that it was.
 */
export function MovementAnsweredSheet({
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
  const [settled, setSettled] = useState(false)

  const markAnswered = useMarkIntentionAnswered()
  const offerThanksgiving = useOfferThanksgiving()
  const submitting = markAnswered.isPending || offerThanksgiving.isPending

  useEffect(() => {
    if (!visible || !movement) return
    setText(t('movements.bridge.thanksgivingPrefill', { text: movement.text }))
    setSettled(false)
  }, [visible, movement, t])

  if (!movement) return null

  async function close(withThanksgiving: boolean) {
    if (!movement || settled) return
    setSettled(true)
    const trimmed = text.trim()
    lightTap()
    Keyboard.dismiss()
    try {
      await markAnswered.mutateAsync({
        id: movement.id,
        notes: withThanksgiving ? trimmed || undefined : undefined,
      })
      if (withThanksgiving && trimmed) {
        await offerThanksgiving.mutateAsync({
          text: trimmed,
          subject: movement.subject,
          from_intention: movement.id,
        })
      }
    } catch {
      // Surfaced by the global mutation-error host; let the user try again.
      setSettled(false)
      return
    }
    successBuzz()
    onClose()
  }

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      // A swipe-dismiss still answers the petition — only the thanksgiving is
      // declined.
      onClose={() => close(false)}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$md">
        <Typography variant="sacred-title" textAlign="left">
          {t('movements.bridge.title')}
        </Typography>
        <Typography variant="caption">{movement.text}</Typography>

        <PrayerTextInput
          size="sm"
          value={text}
          onChangeText={setText}
          placeholder={t('movements.capture.thanksgivingPlaceholder')}
          style={{ maxHeight: 160 }}
        />

        <XStack gap="$lg" alignItems="center" paddingTop="$xs">
          <AnimatedPressable
            onPress={() => close(true)}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('movements.bridge.confirm')}
          >
            <Typography color="$accent" fontSize="$3">
              {t('movements.bridge.confirm')}
            </Typography>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => close(false)}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('common.notNow')}
          >
            <Typography tone="muted" fontSize="$3">
              {t('common.notNow')}
            </Typography>
          </AnimatedPressable>
        </XStack>
      </YStack>
    </BottomSheet>
  )
}
