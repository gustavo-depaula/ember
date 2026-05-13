import DateTimePicker from '@react-native-community/datetimepicker'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, BottomSheet, PrayerTextInput } from '@/components'
import type { Cadence, MovementKind } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { useOfferThanksgiving, useRaiseIntention } from '../hooks'

import { CadenceToggle } from './CadenceToggle'
import { SubjectInput } from './SubjectInput'

const DEFAULT_BOUNDED_DAYS = 30

export function MovementCaptureSheet({
  kind,
  visible,
  onClose,
}: {
  kind: MovementKind
  visible: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>('perpetual')
  const [subject, setSubject] = useState('')
  const [showSubject, setShowSubject] = useState(false)
  const [boundedUntil, setBoundedUntil] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + DEFAULT_BOUNDED_DAYS)
    return d
  })
  const [showAndroidPicker, setShowAndroidPicker] = useState(false)

  const raiseIntention = useRaiseIntention()
  const offerThanksgiving = useOfferThanksgiving()

  function reset() {
    setText('')
    setCadence('perpetual')
    setSubject('')
    setShowSubject(false)
  }

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    lightTap()
    if (kind === 'intention') {
      await raiseIntention.mutateAsync({
        text: trimmed,
        subject: subject.trim() || undefined,
        cadence,
        bounded_until: cadence === 'bounded' ? boundedUntil.getTime() : undefined,
      })
    } else {
      await offerThanksgiving.mutateAsync({
        text: trimmed,
        subject: subject.trim() || undefined,
      })
    }
    reset()
    onClose()
  }

  const promptKey =
    kind === 'intention'
      ? 'movements.capture.intentionPrompt'
      : 'movements.capture.thanksgivingPrompt'
  const placeholderKey =
    kind === 'intention'
      ? 'movements.capture.intentionPlaceholder'
      : 'movements.capture.thanksgivingPlaceholder'
  const submitKey = kind === 'intention' ? 'movements.capture.raise' : 'movements.capture.offer'

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text fontFamily="$heading" fontSize="$4" color="$color">
        {t(promptKey)}
      </Text>

      <PrayerTextInput
        size="lg"
        surface
        value={text}
        onChangeText={setText}
        placeholder={t(placeholderKey)}
        autoFocus
      />

      {kind === 'intention' ? <CadenceToggle value={cadence} onChange={setCadence} /> : undefined}

      {kind === 'intention' && cadence === 'bounded' ? (
        <YStack gap="$xs">
          <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
            {t('movements.capture.boundedUntil').toUpperCase()}
          </Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={boundedUntil}
              mode="date"
              display="compact"
              onChange={(_, date) => date && setBoundedUntil(date)}
            />
          ) : (
            <>
              <AnimatedPressable
                onPress={() => setShowAndroidPicker(true)}
                accessibilityRole="button"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                  paddingVertical="$sm"
                  paddingHorizontal="$md"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$accent"
                >
                  <Text fontFamily="$body" fontSize="$3" color="$accent">
                    {boundedUntil.toLocaleDateString()}
                  </Text>
                </XStack>
              </AnimatedPressable>
              {showAndroidPicker ? (
                <DateTimePicker
                  value={boundedUntil}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowAndroidPicker(false)
                    if (date) setBoundedUntil(date)
                  }}
                />
              ) : undefined}
            </>
          )}
        </YStack>
      ) : undefined}

      <AnimatedPressable
        onPress={() => setShowSubject((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showSubject }}
      >
        <XStack alignItems="center" gap="$xs">
          {showSubject ? (
            <ChevronDown size={14} color={theme.colorSecondary?.val} />
          ) : (
            <ChevronRight size={14} color={theme.colorSecondary?.val} />
          )}
          <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
            {t(
              subject ? 'movements.subject.editLabel' : 'movements.subject.addLabel',
            ).toUpperCase()}
          </Text>
          {subject ? (
            <Text fontFamily="$body" fontSize="$1" color="$accent">
              {subject}
            </Text>
          ) : undefined}
        </XStack>
      </AnimatedPressable>
      {showSubject ? <SubjectInput value={subject} onChange={setSubject} /> : undefined}

      <XStack gap="$sm" paddingTop="$sm">
        <AnimatedPressable
          onPress={() => {
            reset()
            onClose()
          }}
          style={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <XStack
            justifyContent="center"
            paddingVertical="$md"
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
          disabled={!text.trim()}
          style={{ flex: 1, opacity: text.trim() ? 1 : 0.5 }}
          accessibilityRole="button"
          accessibilityLabel={t(submitKey)}
        >
          <XStack
            alignItems="center"
            justifyContent="center"
            gap="$xs"
            paddingVertical="$md"
            borderRadius="$md"
            backgroundColor="$accent"
          >
            <Plus size={14} color="white" />
            <Text fontFamily="$heading" fontSize="$2" color="white" letterSpacing={1}>
              {t(submitKey)}
            </Text>
          </XStack>
        </AnimatedPressable>
      </XStack>
    </BottomSheet>
  )
}
