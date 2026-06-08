import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageHeader, ScreenLayout, SectionDivider } from '@/components'
import { ContinueReading } from './ContinueReading'
import { GospelOfTheDay } from './GospelOfTheDay'
import { OpenBibleCard } from './OpenBibleCard'
import { ThemedReadings } from './ThemedReadings'

export function BibleDiscovery() {
  const { t } = useTranslation()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('bible.discovery.title')} variant="sacred" />
        <GospelOfTheDay />
        <YStack gap="$sm">
          <ContinueReading />
          <OpenBibleCard />
        </YStack>
        <SectionDivider />
        <ThemedReadings />
      </YStack>
    </ScreenLayout>
  )
}
