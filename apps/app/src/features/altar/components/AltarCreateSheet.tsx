import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import type { Cadence } from '@/db/events'
import { QuietInput } from '@/features/library/CreateCollectionSheet'
import { CadenceToggle, useOfferThanksgiving, useRaiseIntention } from '@/features/movements'
import { useReviseResolution, useSetResolution } from '@/features/resolutions'
import { lightTap, successBuzz } from '@/lib/haptics'

import { AltarTabs } from './AltarTabs'

export type AltarCreateType = 'intention' | 'thanksgiving' | 'resolution'

const DEFAULT_BOUNDED_DAYS = 30

function todayWindow() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { starts_at: start.getTime(), ends_at: end.getTime() }
}

const copy = {
  intention: {
    prompt: 'movements.capture.intentionPrompt',
    placeholder: 'movements.capture.intentionPlaceholder',
    submit: 'movements.capture.raise',
  },
  thanksgiving: {
    prompt: 'movements.capture.thanksgivingPrompt',
    placeholder: 'movements.capture.thanksgivingPlaceholder',
    submit: 'movements.capture.offer',
  },
  resolution: {
    prompt: 'altar.resolutionPrompt',
    placeholder: 'resolutions.capture.placeholder',
    submit: 'altar.setResolution',
  },
} as const

/**
 * One sheet to lay anything on the Altar — a petition, a thanksgiving, or
 * today's resolution. A typographic type selector switches the kind; the body is
 * the same borderless field + gold submit. Resolution revises today's when one
 * exists; intentions carry the cadence + optional term.
 */
export function AltarCreateSheet({
  visible,
  onClose,
  initialType,
  existingResolution,
}: {
  visible: boolean
  onClose: () => void
  initialType: AltarCreateType
  existingResolution?: { id: string; text: string }
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const [type, setType] = useState<AltarCreateType>(initialType)
  const [text, setText] = useState('')
  const [cadence, setCadence] = useState<Cadence>('perpetual')
  const [boundedUntil, setBoundedUntil] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + DEFAULT_BOUNDED_DAYS)
    return d
  })
  const [showAndroidPicker, setShowAndroidPicker] = useState(false)

  const raiseIntention = useRaiseIntention()
  const offerThanksgiving = useOfferThanksgiving()
  const setResolution = useSetResolution()
  const reviseResolution = useReviseResolution()
  const submitting =
    raiseIntention.isPending ||
    offerThanksgiving.isPending ||
    setResolution.isPending ||
    reviseResolution.isPending

  const seedText = (next: AltarCreateType) =>
    next === 'resolution' && existingResolution ? existingResolution.text : ''

  // Open with the tab's type and the right seed; reset the intention extras.
  // biome-ignore lint/correctness/useExhaustiveDependencies: seed only when the sheet opens
  useEffect(() => {
    if (!visible) return
    setType(initialType)
    setText(seedText(initialType))
    setCadence('perpetual')
  }, [visible, initialType])

  function changeType(next: AltarCreateType) {
    setType(next)
    setText(seedText(next))
  }

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    lightTap()
    Keyboard.dismiss()
    if (type === 'intention') {
      await raiseIntention.mutateAsync({
        text: trimmed,
        cadence,
        bounded_until: cadence === 'bounded' ? boundedUntil.getTime() : undefined,
      })
    } else if (type === 'thanksgiving') {
      await offerThanksgiving.mutateAsync({ text: trimmed })
    } else if (existingResolution) {
      await reviseResolution.mutateAsync({ id: existingResolution.id, text: trimmed })
    } else {
      const w = todayWindow()
      await setResolution.mutateAsync({
        level: 'daily',
        text: trimmed,
        starts_at: w.starts_at,
        ends_at: w.ends_at,
        source: 'manual',
      })
    }
    successBuzz()
    onClose()
  }

  const submitLabel =
    type === 'resolution' && existingResolution ? t('common.save') : t(copy[type].submit)

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$lg">
        <AltarTabs
          tabs={[
            { key: 'intention', label: t('altar.intentions') },
            { key: 'thanksgiving', label: t('altar.gratitude') },
            { key: 'resolution', label: t('altar.resolution') },
          ]}
          active={type}
          onChange={changeType}
        />

        <Typography variant="screen-title" fontSize="$5" textAlign="left">
          {t(copy[type].prompt)}
        </Typography>

        <QuietInput
          value={text}
          onChangeText={setText}
          placeholder={t(copy[type].placeholder)}
          fontFamily="$body"
          fontSize="$4"
          autoFocus
          onSubmitEditing={submit}
          returnKeyType="done"
        />

        {type === 'intention' ? <CadenceToggle value={cadence} onChange={setCadence} /> : undefined}

        {type === 'intention' && cadence === 'bounded' ? (
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
                  <Text fontFamily="$body" fontSize="$3" color="$accent">
                    {boundedUntil.toLocaleDateString()}
                  </Text>
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

        <Pressable
          onPress={submit}
          disabled={!text.trim() || submitting}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
        >
          <YStack
            backgroundColor="$accent"
            borderRadius="$md"
            padding="$md"
            alignItems="center"
            opacity={!text.trim() || submitting ? 0.5 : 1}
          >
            <Text fontFamily="$heading" fontSize="$3" color="$background">
              {submitLabel}
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </BottomSheet>
  )
}
