import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'
import { XStack } from 'tamagui'

import { useWidthClass } from '@/components'

/**
 * The edge-bleeding horizontal scroller shared by every Explore row: cards bleed
 * to both screen edges (the negative margin cancels the 24px page padding) so the
 * off-screen card becomes the swipe affordance, matching `FeaturedCarousel`. Pass
 * `stretch` to make every card share the tallest one's height (flexbox align
 * stretch) — used by the title-in-block Holy See cards.
 *
 * On a wide window there is nothing to swipe: the shelf stands as rows,
 * everything on it in view, as on the website.
 */
export function CardRow({ children, stretch }: { children: ReactNode; stretch?: boolean }) {
  const { medium } = useWidthClass()
  if (medium)
    return (
      <XStack
        flexWrap="wrap"
        columnGap={14}
        rowGap={20}
        alignItems={stretch ? 'stretch' : 'flex-start'}
      >
        {children}
      </XStack>
    )
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -24 }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        gap: 14,
        ...(stretch ? { alignItems: 'stretch' } : undefined),
      }}
    >
      {children}
    </ScrollView>
  )
}
