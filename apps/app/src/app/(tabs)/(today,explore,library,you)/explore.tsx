import { YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { AlmanacMasthead, ExploreFeed } from '@/features/explore'

// Explore tab root: "The Almanac" — an illuminated, daily-fresh front page. A
// masthead naming today in the Church, a featured editorial carousel, and
// imagery-rich rows (library, voices, collections). See docs/features/explore.md.
export default function ExploreScreen() {
  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <AlmanacMasthead />
        <ExploreFeed />
      </YStack>
    </ScreenLayout>
  )
}
