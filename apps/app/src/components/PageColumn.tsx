import type { ComponentProps, ReactNode } from 'react'
import { YStack } from 'tamagui'

import { type PageMeasure, pageGutter, pageOuterWidth } from '@/lib/layout'

import { PageWidth, useFrameWidth } from './pageWidth'

/**
 * The centred column of a page that owns its own scroller (a hero page, a
 * list): `ScreenLayout`'s measure and gutters without its scroll view or its
 * safe-area padding.
 */
export function PageColumn({
  measure = 'column',
  children,
  ...stack
}: {
  measure?: PageMeasure
  children: ReactNode
} & Omit<ComponentProps<typeof YStack>, 'width' | 'maxWidth' | 'alignSelf' | 'paddingHorizontal'>) {
  const outer = pageOuterWidth(useFrameWidth(), measure)
  return (
    <YStack
      width="100%"
      maxWidth={outer}
      alignSelf="center"
      paddingHorizontal={pageGutter}
      {...stack}
    >
      <PageWidth width={outer - pageGutter * 2}>{children}</PageWidth>
    </YStack>
  )
}
