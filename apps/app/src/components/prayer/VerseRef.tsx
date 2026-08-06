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
  // Prayed text is justified, so every ordinary space on a line is elastic —
  // including the ones in and after the citation. On a short, heavily-stretched
  // line that opened the ref into "PS.    87:9" and left a gaping indent before
  // the verse. U+00A0 doesn't help: CSS Text lists no-break space as a word
  // separator, so it expands too. Both gaps therefore use fixed-width spaces
  // that aren't justification opportunities — U+202F (narrow) inside the
  // citation, U+2002 (en) to set it off from the verse.
  const label = `${value.toUpperCase().replaceAll(' ', '\u202f')}\u2002`
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
