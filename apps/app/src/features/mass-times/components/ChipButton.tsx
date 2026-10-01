import type { ReactNode } from 'react'
import { XStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'

// The feature's one tappable chip: a hairline-ruled button with an optional leading icon and a label,
// so it sits on the sheet as type rather than as a tile. `selected` fills it with ink (or, with
// `soft`, just inks its rule for toggle states). Haptics stay at the call site. Used for the check-in
// kind picker and the feedback buttons.
export function ChipButton({
  label,
  onPress,
  icon,
  selected,
  soft,
  disabled,
  hitSlop,
  accessibilityLabel,
}: {
  label: string
  onPress: () => void
  icon?: ReactNode
  selected?: boolean
  soft?: boolean
  disabled?: boolean
  hitSlop?: number
  accessibilityLabel?: string
}) {
  const fill = selected && !soft
  const softSelected = selected && soft
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
    >
      <XStack
        alignItems="center"
        gap="$xs"
        minHeight={44}
        paddingHorizontal="$md"
        borderRadius={10}
        borderWidth={1}
        borderColor={fill || softSelected ? '$color' : '$borderColor'}
        backgroundColor={fill ? '$color' : 'transparent'}
        opacity={disabled ? 0.5 : 1}
      >
        {icon}
        <Typography variant="interface" fontSize="$3" color={fill ? '$background' : '$color'}>
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
