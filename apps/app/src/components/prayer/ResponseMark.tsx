import type { ComponentProps } from 'react'
import { Text } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'

/** Over body size, so the ℟/℣ glyph's visual mass matches surrounding capitals. */
export const responseMarkScale = 1.15

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
    typeof reading.fontSize === 'number'
      ? Math.round(reading.fontSize * responseMarkScale)
      : undefined
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
