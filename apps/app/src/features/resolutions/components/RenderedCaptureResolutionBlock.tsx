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
  InlineMarkdownRubric,
} from '@/components/prayer'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useReviseResolution, useSetResolution } from '../hooks'

export function RenderedCaptureResolutionBlock({
  prompt,
  window,
  prefill,
}: {
  forward: 'current' | 'next'
  prompt: string
  window: { starts_at: number; ends_at: number }
  /**
   * Existing resolution for this block's window. When present, the block opens
   * in display mode (resolution text + Change link); tapping Change swaps to
   * the form pre-filled with the existing text, and submission revises rather
   * than creating a new resolution.
   */
  prefill?: { resolution_id: string; text: string }
}) {
  const { t } = useTranslation()
  const [text, setText] = useState(prefill?.text ?? '')
  const [savedText, setSavedText] = useState(prefill?.text ?? '')
  const [resolutionId, setResolutionId] = useState<string | undefined>(prefill?.resolution_id)
  const [editing, setEditing] = useState(!prefill)

  const setMutation = useSetResolution()
  const reviseMutation = useReviseResolution()
  const submitting = setMutation.isPending || reviseMutation.isPending

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    lightTap()
    Keyboard.dismiss()
    if (resolutionId) {
      await reviseMutation.mutateAsync({ id: resolutionId, text: trimmed })
    } else {
      const id = await setMutation.mutateAsync({
        level: 'daily',
        text: trimmed,
        starts_at: window.starts_at,
        ends_at: window.ends_at,
        source: 'examen',
      })
      setResolutionId(id)
    }
    successBuzz()
    setSavedText(trimmed)
    setText(trimmed)
    setEditing(false)
  }

  function startEdit() {
    lightTap()
    setText(savedText)
    setEditing(true)
  }

  function cancelEdit() {
    lightTap()
    setText(savedText)
    setEditing(false)
  }

  return (
    <FlowInteraction>
      <Typography variant="rubric">
        <InlineMarkdownRubric source={prompt} />
      </Typography>

      {!editing && resolutionId ? (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          layout={LinearTransition.duration(200)}
        >
          <YStack>
            <FlowLine text={savedText} />
            <Typography variant="whisper" fontStyle="italic" color="$accent">
              {t('resolutions.capture.recorded')}
            </Typography>
            <FlowActions>
              <FlowAction label={t('resolutions.capture.change')} onPress={startEdit} />
            </FlowActions>
          </YStack>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          layout={LinearTransition.duration(200)}
        >
          <YStack gap="$sm" paddingTop="$xs">
            <PrayerTextInput
              value={text}
              onChangeText={setText}
              placeholder={t('resolutions.capture.placeholder')}
            />
            <FlowActions>
              <FlowAction
                label={resolutionId ? t('common.save') : t('resolutions.capture.save')}
                onPress={submit}
                disabled={!text.trim() || submitting}
              />
              {resolutionId ? (
                <>
                  <FlowActionSeparator />
                  <FlowAction label={t('common.cancel')} onPress={cancelEdit} />
                </>
              ) : undefined}
            </FlowActions>
          </YStack>
        </Animated.View>
      )}
    </FlowInteraction>
  )
}
