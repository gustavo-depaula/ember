import type { ReactNode } from 'react'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { CardRow } from './CardRow'

/**
 * A titled, full-bleed horizontal row — the section unit beneath the featured
 * carousel. Hosts any cards (`ArtCoverCard`, `CreatorGridCard`). The label sits
 * inside the screen padding; the scroller bleeds to the edges so off-screen cards
 * become the swipe affordance (see `CardRow`).
 */
export function ArtCarousel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {title}
      </Typography>
      <CardRow>{children}</CardRow>
    </YStack>
  )
}
