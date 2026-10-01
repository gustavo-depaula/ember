import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { XStack, YStack } from 'tamagui'
import { Typography } from '@/components'

// The Mass Times sheet's typographic furniture: hierarchy from small tracked caps and hairline rules
// rather than tiles, the way a missal sets its tables. Colour is rationed to two cues — a gold ✠ for
// the next Mass, rubric red for "today" — so neither reads as the interface colour. The ✠ closes its
// label rather than opening it, so the label keeps the left edge the rows beneath it align to.

export function SectionLabel({
  children,
  cross,
  rule,
}: {
  children: ReactNode
  cross?: boolean
  rule?: boolean
}) {
  return (
    <XStack alignItems="center" gap="$sm">
      <SmallCaps>{children}</SmallCaps>
      {cross ? (
        <Typography
          color="$accentHover"
          fontSize={12}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          ✠
        </Typography>
      ) : null}
      {rule ? <Hairline flex={1} /> : null}
    </XStack>
  )
}

export function SmallCaps({
  children,
  color = '$colorSecondary',
  fontSize = 11,
}: {
  children: ReactNode
  color?: '$colorSecondary' | '$colorBurgundy'
  fontSize?: number
}) {
  return (
    <Typography
      variant="label"
      fontSize={fontSize}
      letterSpacing={fontSize * 0.16}
      textTransform="uppercase"
      color={color}
      numberOfLines={1}
    >
      {children}
    </Typography>
  )
}

export function Hairline({ flex }: { flex?: number }) {
  return (
    <YStack
      flex={flex}
      height={StyleSheet.hairlineWidth}
      backgroundColor="$borderColor"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  )
}

// The time column leading the nearby list and the check-in log, wide enough for its day label in
// tracked caps ("TOMORROW" is the longest).
export const timeColumnWidth = 76

// Clock times set in the title face with lining, tabular figures so a column of them aligns.
export const clockFigures = ['lining-nums', 'tabular-nums'] as const
