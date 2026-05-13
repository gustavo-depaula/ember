import { Check, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput } from '@/components'
import { lightTap, successBuzz } from '@/lib/haptics'

import { useSetResolution } from '../hooks'

export function RenderedCaptureResolutionBlock({
  prompt,
  window,
  optional,
}: {
  level: 'daily'
  forward: 'current' | 'next'
  prompt: string
  window: { starts_at: number; ends_at: number }
  optional: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const setResolutionMutation = useSetResolution()

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed || setResolutionMutation.isPending) return
    lightTap()
    Keyboard.dismiss()
    await setResolutionMutation.mutateAsync({
      level: 'daily',
      text: trimmed,
      starts_at: window.starts_at,
      ends_at: window.ends_at,
      source: 'examen',
    })
    successBuzz()
    setSubmitted(true)
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

      {submitted ? (
        <XStack alignItems="center" gap="$xs">
          <Check size={14} color={theme.accent?.val} />
          <Text fontFamily="$body" fontSize="$2" color="$accent" fontStyle="italic">
            {t('resolutions.capture.recorded')}
          </Text>
        </XStack>
      ) : skipped ? null : (
        <>
          <PrayerTextInput
            value={text}
            onChangeText={setText}
            placeholder={t('resolutions.capture.placeholder')}
          />
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
              disabled={!text.trim() || setResolutionMutation.isPending}
              style={{ flex: 1, opacity: text.trim() ? 1 : 0.5 }}
              accessibilityRole="button"
              accessibilityLabel={t('resolutions.capture.save')}
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
                  {t('resolutions.capture.save')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </>
      )}
    </YStack>
  )
}
