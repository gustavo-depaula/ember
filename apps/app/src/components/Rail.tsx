import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from './typography'

/**
 * One titled group in a side column — a hub's index, a reader's rail. Groups
 * after the first are set off by a hairline, as on the website.
 */
export function RailBlock({
  title,
  first = false,
  children,
}: {
  title?: string
  first?: boolean
  children: ReactNode
}) {
  return (
    <YStack
      paddingTop={first ? 0 : '$lg'}
      marginTop={first ? 0 : '$lg'}
      borderTopWidth={first ? 0 : 0.5}
      borderTopColor="$borderColor"
    >
      {title && (
        <Typography variant="marker" textAlign="left" fontSize={11} paddingBottom="$sm">
          {title}
        </Typography>
      )}
      {children}
    </YStack>
  )
}

/** A line of a rail: typographic, the chosen one in gold. */
export function RailLink({
  label,
  selected = false,
  role = 'link',
  onPress,
}: {
  label: string
  selected?: boolean
  /** `radio` for a line that picks among its siblings, `link` for one that goes somewhere. */
  role?: 'link' | 'radio'
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={role === 'radio' ? { checked: selected } : { selected }}
      aria-checked={role === 'radio' ? selected : undefined}
      aria-current={role === 'link' && selected ? 'page' : undefined}
      // The line is set tighter than a touch target; the slop makes up the 44pt.
      hitSlop={{ top: 5, bottom: 5 }}
    >
      <YStack minHeight={34} justifyContent="center">
        <Typography
          fontSize="$2"
          numberOfLines={2}
          color={selected ? '$accent' : '$colorSecondary'}
        >
          {label}
        </Typography>
      </YStack>
    </Pressable>
  )
}
