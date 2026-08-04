import type { ComponentProps } from 'react'
import { Text } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'

/**
 * Scripture citation set as a lead-in to a prayed verse ("Ps. 56:1").
 *
 * These are the translator's apparatus, not words anyone prays, so the mark is
 * deliberately subordinate: secondary colour, ~0.72× body size, uppercase. It
 * inherits the body line-height so it sits on the prayed text's baseline rather
 * than opening a taller line, and it's `aria-hidden` so a screen reader reads
 * the verse without spelling a citation between every clause.
 */
export function VerseRef({
  value,
  ...rest
}: { value: string } & Omit<ComponentProps<typeof Text>, 'children'>) {
  const reading = useReadingStyle()
  const fontSize =
    typeof reading.fontSize === 'number' ? Math.round(reading.fontSize * 0.72) : undefined
  // Prayed text is justified, and a plain space inside the citation gets pulled
  // apart by the justifier into "PS.    87:9". U+00A0 doesn't help — CSS Text
  // lists it as a word separator, so browsers expand it too. U+202F (narrow
  // no-break space) isn't a justification opportunity, so the ref stays welded
  // together. The trailing gap stays an ordinary space and may stretch.
  const label = `${value.toUpperCase().replaceAll(' ', '\u202f')}\u0020`
  return (
    <Text
      fontFamily="$body"
      color="$colorSecondary"
      fontSize={fontSize}
      lineHeight={reading.lineHeight}
      letterSpacing={0.4}
      aria-hidden
      {...rest}
    >
      {label}
    </Text>
  )
}
