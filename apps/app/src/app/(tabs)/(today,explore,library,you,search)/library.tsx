import { YStack } from 'tamagui'

import { PageFlourish, ScreenLayout } from '@/components'
import { LibraryFeed, LibraryMasthead } from '@/features/library'

const flourishDark = require('../../../../assets/textures/notch_library_dark.png')
const flourishLight = require('../../../../assets/textures/notch_library_light.png')
const flourishAspect = 2172 / 481
const flourishLightAspect = 2142 / 397

// Library tab root: the user's personal shelf. A masthead, a "Continue" strip,
// then shelves built from what they've gathered — saved books, prayers, and
// collections (pinned), the voices they follow, and a holy-card gallery. See
// features/library/LibraryFeed.tsx.
export default function LibraryScreen() {
  return (
    <ScreenLayout>
      <PageFlourish
        dark={flourishDark}
        light={flourishLight}
        aspectRatio={flourishAspect}
        lightAspectRatio={flourishLightAspect}
      />
      <YStack gap="$lg" paddingTop="$sm" paddingBottom="$lg">
        <LibraryMasthead />
        <LibraryFeed />
      </YStack>
    </ScreenLayout>
  )
}
