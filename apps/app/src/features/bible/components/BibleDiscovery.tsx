import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { ScreenLayout, SectionDivider } from '@/components'
import { Typography } from '@/components/typography'
import { GospelOfTheDay } from './GospelOfTheDay'
import { ReadingStamps } from './ReadingStamps'
import { ThemedReadings } from './ThemedReadings'

export function BibleDiscovery() {
  const { t } = useTranslation()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack gap="$xs" marginTop="$-md">
          <Typography variant="screen-title" fontSize={44} lineHeight={50}>
            {t('bible.discovery.title')}
          </Typography>
          <XStack alignItems="center" gap="$sm">
            <Typography
              variant="marker"
              textAlign="left"
              color="$accent"
              fontSize={10}
              letterSpacing={2}
            >
              {t('bible.discovery.motto')}
            </Typography>
            <YStack flex={1} height={1} backgroundColor="$accentSubtle" />
          </XStack>
        </YStack>
        <GospelOfTheDay />
        <ReadingStamps />
        <SectionDivider />
        <ThemedReadings />
      </YStack>
    </ScreenLayout>
  )
}
