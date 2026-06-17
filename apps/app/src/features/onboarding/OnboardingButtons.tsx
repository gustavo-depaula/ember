import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'

/** The gold primary CTA shared across every onboarding step. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
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
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={text}>
      <YStack padding="$sm" alignItems="center">
        <Typography variant="whisper">{text}</Typography>
      </YStack>
    </AnimatedPressable>
  )
}
