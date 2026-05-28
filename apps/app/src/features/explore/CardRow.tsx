import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'

/**
 * The edge-bleeding horizontal scroller shared by every Explore row: cards bleed
 * to both screen edges (the negative margin cancels the 24px page padding) so the
 * off-screen card becomes the swipe affordance, matching `DailyCarousel`. Pass
 * `stretch` to make every card share the tallest one's height (flexbox align
 * stretch) — used by the title-in-block Holy See cards.
 */
export function CardRow({ children, stretch }: { children: ReactNode; stretch?: boolean }) {
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
