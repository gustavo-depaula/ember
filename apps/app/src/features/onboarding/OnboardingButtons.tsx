import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'

/**
 * The primary CTA shared across every onboarding step. Outlined by default: gold
 * is the app's preciousness channel, and a solid gold slab on every step would
 * spend it on "Continue" nine times over and outshout the paintings behind it.
 * Only the closing **Begin** fills — so the one moment that matters is also the
 * only one that gleams. Fires a light tap on press; `haptic="success"` gives the
 * final step a heavier flourish.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  haptic = 'tap',
  filled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  haptic?: 'tap' | 'success'
  filled?: boolean
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
        backgroundColor={filled ? '$accent' : 'transparent'}
        borderWidth={filled ? 0 : 1}
        borderColor="$accent"
        borderRadius="$md"
        padding="$md"
        alignItems="center"
        opacity={disabled ? 0.45 : 1}
      >
        <Typography variant="label" fontSize="$3" color={filled ? '$background' : '$accent'}>
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
