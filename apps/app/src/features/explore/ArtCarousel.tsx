import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'

/**
 * A titled, full-bleed horizontal row — the section unit beneath the featured
 * carousel. Hosts any cards (`ArtCoverCard`, `CreatorGridCard`). The label sits
 * inside the screen padding; the scroller bleeds to the edges (negative margin)
 * so off-screen cards become the swipe affordance, matching `DailyCarousel`.
 */
export function ArtCarousel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {title}
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -24 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
      >
        {children}
      </ScrollView>
    </YStack>
  )
}
