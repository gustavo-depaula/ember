import { Check, Pencil, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput } from '@/components'
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
  const theme = useTheme()
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

      {!editing && resolutionId ? (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          layout={LinearTransition.duration(200)}
        >
          <YStack gap="$sm">
            <XStack alignItems="center" gap="$xs">
              <Check size={14} color={theme.accent?.val} />
              <Text fontFamily="$body" fontSize="$2" color="$accent" fontStyle="italic">
                {t('resolutions.capture.recorded')}
              </Text>
            </XStack>
            <Text fontFamily="$body" fontSize="$3" color="$color">
              {savedText}
            </Text>
            <AnimatedPressable
              onPress={startEdit}
              accessibilityRole="button"
              accessibilityLabel={t('resolutions.capture.change')}
              hitSlop={8}
            >
              <XStack alignItems="center" gap="$xs" paddingVertical="$xs">
                <Pencil size={12} color={theme.accent?.val} />
                <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={0.5}>
                  {t('resolutions.capture.change').toUpperCase()}
                </Text>
              </XStack>
            </AnimatedPressable>
          </YStack>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          layout={LinearTransition.duration(200)}
        >
          <PrayerTextInput
            value={text}
            onChangeText={setText}
            placeholder={t('resolutions.capture.placeholder')}
          />
          <XStack gap="$sm">
            {resolutionId ? (
              <AnimatedPressable
                onPress={cancelEdit}
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
            ) : undefined}
            <AnimatedPressable
              onPress={submit}
              disabled={!text.trim() || submitting}
              style={{ flex: 1, opacity: text.trim() ? 1 : 0.5 }}
              accessibilityRole="button"
              accessibilityLabel={resolutionId ? t('common.save') : t('resolutions.capture.save')}
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
                  {resolutionId ? t('common.save') : t('resolutions.capture.save')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </Animated.View>
      )}
    </YStack>
  )
}
