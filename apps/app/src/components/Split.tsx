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
  children,
}: {
  aside: ReactNode
  asideWidth?: number
  asideSide?: 'left' | 'right'
  gap?: number
  /** Caps the body, which is then centred with the aside as a pair. */
  bodyMaxWidth?: number
  children: ReactNode
}) {
  const available = usePageWidth() - asideWidth - gap
  const bodyWidth = Math.min(available, bodyMaxWidth ?? available)
  const asideColumn = (
    <YStack width={asideWidth}>
      <PageWidth width={asideWidth}>{aside}</PageWidth>
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
