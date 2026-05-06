import type { ComponentProps } from 'react'
import { Text } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'

/**
 * Canonical missal-typography mark for response (℟) and versicle (℣)
 * glyphs. Bumped 1.15× over body text so the glyph's visual mass
 * matches surrounding capitals instead of riding low and small.
 *
 * Single source of truth — all places that render a response/versicle
 * marker (LiturgicalPrayerBlock, ResponseBlock, ProperSlot,
 * ChoiceRichTextBlock) go through this component, so styling changes
 * land everywhere at once.
 */
export function ResponseMark({
  value,
  width,
  ...rest
}: {
  value: string
  width?: number
} & Omit<ComponentProps<typeof Text>, 'children'>) {
  const reading = useReadingStyle()
  const fontSize =
    typeof reading.fontSize === 'number' ? Math.round(reading.fontSize * 1.15) : undefined
  return (
    <Text
      fontFamily="$body"
      color="$colorBurgundy"
      fontStyle="italic"
      fontWeight="bold"
      fontSize={fontSize}
      lineHeight={reading.lineHeight}
      width={width}
      aria-hidden
      {...rest}
    >
      {value}
    </Text>
  )
}
