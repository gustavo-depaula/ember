import type { ComponentProps } from 'react'
import { Text } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'

// A citation is the translator's apparatus, not prayed words, so it stays
// subordinate: smaller, secondary colour, and `aria-hidden` so a screen reader
// doesn't spell a citation between every clause. It takes the body line-height
// so it doesn't open a taller line.
export const verseRefScale = 0.72
export const verseRefTracking = 0.4

/**
 * Justification stretches ordinary spaces (U+00A0 too — CSS treats it as a word
 * separator), which opened "PS.    87:9" on short lines. U+202F inside and
 * U+2002 after are fixed-width. The justifier's `atomic` run is rigid anyway;
 * the characters stay so both paths set the citation identically.
 */
export const verseRefLabel = (value: string) =>
  `${value.toUpperCase().replaceAll(' ', '\u202f')}\u2002`

export function VerseRef({
  value,
  ...rest
}: { value: string } & Omit<ComponentProps<typeof Text>, 'children'>) {
  const reading = useReadingStyle()
  const fontSize =
    typeof reading.fontSize === 'number' ? Math.round(reading.fontSize * verseRefScale) : undefined
  const label = verseRefLabel(value)
  return (
    <Text
      fontFamily="$body"
      color="$colorSecondary"
      fontSize={fontSize}
      lineHeight={reading.lineHeight}
      letterSpacing={verseRefTracking}
      aria-hidden
      {...rest}
    >
      {label}
    </Text>
  )
}
