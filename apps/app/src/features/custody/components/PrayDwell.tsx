import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

// Renders the deep-prayer experience: full prayer text + a minimum-dwell
// countdown that gates the confirm button. Shared between shield-pray
// (commitment kept) and pray-to-disable (commitment overridden) so the
// dwell mechanic is identical; the calling screen sets the tone via
// eyebrow / button color.
export function PrayDwell({
  eyebrow,
  commitmentName,
  prayerKey = 'ourFather',
  dwellSeconds = 30,
  confirmLabel,
  buttonTone = 'accent',
  onConfirm,
}: {
  eyebrow: string
  commitmentName?: string
  prayerKey?: 'ourFather'
  dwellSeconds?: number
  confirmLabel: string
  buttonTone?: 'accent' | 'destructive'
  onConfirm: () => void | Promise<void>
}) {
  const { t } = useTranslation()
  const [remaining, setRemaining] = useState(dwellSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [remaining])

  const ready = remaining === 0
  const buttonBg = buttonTone === 'destructive' ? '$colorDestructive' : '$accent'

  return (
    <YStack alignItems="center" gap="$lg" paddingVertical="$xl" paddingHorizontal="$lg">
      <Text
        fontFamily="$body"
        fontSize="$1"
        color="$colorSecondary"
        letterSpacing={2}
        textAlign="center"
      >
        {eyebrow}
      </Text>
      {commitmentName && (
        <Text fontFamily="$heading" fontSize="$5" color="$accent" textAlign="center">
          {commitmentName}
        </Text>
      )}
      <YStack gap="$sm" alignItems="center">
        <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
          {t(`custody.prayer.${prayerKey}.title`)}
        </Text>
        <Text
          selectable
          fontFamily="$body"
          fontSize="$3"
          color="$color"
          textAlign="center"
          lineHeight={28}
        >
          {t(`custody.prayer.${prayerKey}.text`)}
        </Text>
      </YStack>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        {ready
          ? t('custody.prayer.dwell.hint')
          : t('custody.prayer.dwell.countdown', { seconds: remaining })}
      </Text>
      <Pressable
        onPress={() => {
          if (!ready) return
          void onConfirm()
        }}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready }}
      >
        <YStack
          padding="$md"
          borderRadius="$md"
          backgroundColor={ready ? buttonBg : '$backgroundSurface'}
          opacity={ready ? 1 : 0.6}
          minWidth={220}
          alignItems="center"
        >
          <Text fontFamily="$heading" fontSize="$3" color={ready ? '#0E0D0C' : '$colorSecondary'}>
            {confirmLabel}
          </Text>
        </YStack>
      </Pressable>
    </YStack>
  )
}
