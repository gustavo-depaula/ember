import type { ReactNode } from 'react'
import { AnimatedPressable, Typography } from '@/components'
import { OutlineChip } from './OutlineChip'

// The feature's one tappable chip: a solid warm-surface pill with an optional leading icon and a
// label, with native press feedback. `selected` fills it with accent (or, with `soft`, just tints the
// label for toggle states). Haptics stay at the call site. Used for filters, kind pickers, contact
// actions, the reminder toggle, and the feedback buttons.
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
      <OutlineChip
        gap="$xs"
        paddingHorizontal="$md"
        paddingVertical="$sm"
        opacity={disabled ? 0.5 : 1}
        backgroundColor={fill ? '$accent' : '$backgroundSurface'}
      >
        {icon}
        <Typography
          variant="interface"
          fontSize="$3"
          color={fill ? '$background' : softSelected ? '$accent' : '$color'}
        >
          {label}
        </Typography>
      </OutlineChip>
    </AnimatedPressable>
  )
}
