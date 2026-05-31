import { YStack } from 'tamagui'

import { PageFlourish, ScreenLayout } from '@/components'
import { AlmanacMasthead, ExploreFeed } from '@/features/explore'

const flourishDark = require('../../../../assets/textures/notch_explore_dark.png')
const flourishLight = require('../../../../assets/textures/notch_explore_light.png')
const flourishAspect = 2172 / 438
const flourishLightAspect = 2143 / 416

// Explore tab root: "The Almanac" — an illuminated, daily-fresh front page. A
// masthead naming today in the Church, a featured editorial carousel, and
// imagery-rich rows (library, voices, collections). See docs/features/explore.md.
export default function ExploreScreen() {
  return (
    <ScreenLayout>
      <PageFlourish
        dark={flourishDark}
        light={flourishLight}
        aspectRatio={flourishAspect}
        lightAspectRatio={flourishLightAspect}
      />
      <YStack gap="$lg" paddingTop="$sm" paddingBottom="$lg">
        <AlmanacMasthead />
        <ExploreFeed />
      </YStack>
    </ScreenLayout>
  )
}
