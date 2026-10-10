import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { PageWidth, usePageWidth } from './pageWidth'

/**
 * Two columns of a wide page: the body, and a narrower aside beside it. Each
 * knows its own width, so what stands in them sizes as it would on a phone.
 * Render it only where the window has room (`useWidthClass().expanded`); below
 * that the page stacks the same pieces itself.
 */
export function Split({
  aside,
  asideWidth = 320,
  asideSide = 'left',
  gap = 56,
  bodyMaxWidth,
  ruled = false,
  children,
}: {
  aside: ReactNode
  asideWidth?: number
  asideSide?: 'left' | 'right'
  gap?: number
  /** Rules the aside off from the body with a hairline, as the website's side columns are. */
  ruled?: boolean
  /** Caps the body, which is then centred with the aside as a pair. */
  bodyMaxWidth?: number
  children: ReactNode
}) {
  const available = usePageWidth() - asideWidth - gap
  const bodyWidth = Math.min(available, bodyMaxWidth ?? available)
  // The rule stands in the middle of the gap: half of it is the aside's own padding.
  const inset = ruled ? gap : 0
  const asideColumn = (
    <YStack
      width={asideWidth}
      paddingLeft={asideSide === 'right' ? inset : 0}
      paddingRight={asideSide === 'left' ? inset : 0}
      borderLeftWidth={ruled && asideSide === 'right' ? 0.5 : 0}
      borderRightWidth={ruled && asideSide === 'left' ? 0.5 : 0}
      borderColor="$borderColor"
    >
      <PageWidth width={asideWidth - inset}>{aside}</PageWidth>
    </YStack>
  )
  return (
    <XStack gap={gap} alignItems="flex-start" justifyContent="center">
      {asideSide === 'left' && asideColumn}
      <YStack width={bodyWidth}>
        <PageWidth width={bodyWidth}>{children}</PageWidth>
      </YStack>
      {asideSide === 'right' && asideColumn}
    </XStack>
  )
}
