import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'

/**
 * The gold primary CTA shared across every onboarding step. Fires a light tap on
 * press; the final "Begin" step passes `haptic="success"` for a heavier flourish.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  haptic = 'tap',
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  haptic?: 'tap' | 'success'
}) {
  return (
    <AnimatedPressable
      onPress={
        disabled
          ? undefined
          : () => {
              if (haptic === 'success') successBuzz()
              else lightTap()
              onPress()
            }
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
    >
      <YStack
        backgroundColor="$accent"
        borderRadius="$md"
        padding="$md"
        alignItems="center"
        opacity={disabled ? 0.45 : 1}
      >
        <Typography variant="label" fontSize="$3" color="$background">
          {label}
        </Typography>
      </YStack>
    </AnimatedPressable>
  )
}

/** The quiet secondary action (Skip / Not now). Defaults its label to "Skip". */
export function SkipButton({ label, onPress }: { label?: string; onPress: () => void }) {
  const { t } = useTranslation()
  const text = label ?? t('common.skip')
  return (
    <AnimatedPressable
      onPress={() => {
        selectionTick()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <YStack padding="$sm" alignItems="center">
        <Typography variant="whisper">{text}</Typography>
      </YStack>
    </AnimatedPressable>
  )
}
