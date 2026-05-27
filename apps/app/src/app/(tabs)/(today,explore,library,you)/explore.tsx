import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { DiscoverySections } from '@/features/collections/DiscoverySections'
import { LatestRow } from '@/features/creators/home/LatestRow'

// Explore tab root: discovery. A "latest from the creators you follow" feed
// sits above the curated catalog browse sections. LatestRow self-hides when
// the user follows no creators, so the screen degrades to pure browse.
export default function ExploreScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('nav.explore')} />
        <LatestRow />
        <DiscoverySections />
      </YStack>
    </ScreenLayout>
  )
}
