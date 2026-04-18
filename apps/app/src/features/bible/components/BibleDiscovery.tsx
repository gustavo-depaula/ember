import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageBreakOrnament, PageHeader, ScreenLayout } from '@/components'
import { ContinueReading } from './ContinueReading'
import { GospelOfTheDay } from './GospelOfTheDay'
import { OpenBibleCard } from './OpenBibleCard'
import { ThemedReadings } from './ThemedReadings'

export function BibleDiscovery() {
  const { t } = useTranslation()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('bible.discovery.title')} />
        <GospelOfTheDay />
        <OpenBibleCard />
        <ThemedReadings />
        <ContinueReading />
        <PageBreakOrnament />
      </YStack>
    </ScreenLayout>
  )
}
