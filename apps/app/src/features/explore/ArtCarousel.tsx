import { type Href, useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { CardRow } from './CardRow'

/**
 * A titled, full-bleed horizontal row — the section unit beneath the featured
 * carousel. Hosts any cards (`ArtCoverCard`, `CreatorGridCard`). The label sits
 * inside the screen padding; the scroller bleeds to the edges so off-screen cards
 * become the swipe affordance (see `CardRow`). With `href`, the title carries an
 * arrow and opens the row's full list.
 */
export function ArtCarousel({
  title,
  href,
  children,
}: {
  title: string
  href?: Href
  children: ReactNode
}) {
  const router = useRouter()
  const label = (
    <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
      {title}
    </Typography>
  )
  return (
    <YStack gap="$sm">
      {href ? (
        <AnimatedPressable
          onPress={() => router.push(href)}
          accessibilityRole="link"
          accessibilityLabel={title}
          hitSlop={8}
        >
          <XStack alignItems="center" gap="$sm">
            {label}
            <Typography variant="label" color="$accent">
              →
            </Typography>
          </XStack>
        </AnimatedPressable>
      ) : (
        label
      )}
      <CardRow>{children}</CardRow>
    </YStack>
  )
}
